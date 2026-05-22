/* eslint-disable @typescript-eslint/no-unused-vars, max-lines-per-function */
import { CommonModule } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
} from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { BOOTSTRAP_CORRELATION_ID } from '../core/correlation/bootstrap-correlation-id.token';
import { createCorrelationId } from '../core/correlation/correlation-id';
import { EventBusService } from '../core/events/event-bus.service';
import { createEvent } from '../core/events/event-factory';
import { RuntimeEvent } from '../core/events/runtime-event.model';
import { emitBootstrapCompletedEvent } from '../bootstrap/emit-bootstrap-completed-event';
import { AppComponent } from '../app.component';
import { AppModule } from '../app.module';
import { TimelineComponent } from '../features/timeline/timeline.component';

function observeEvents(eventBus: EventBusService): {
  state: { latestEvents: RuntimeEvent[] };
  subscription: Subscription;
} {
  const state = { latestEvents: [] as RuntimeEvent[] };
  const subscription = eventBus.events$.subscribe((events) => {
    state.latestEvents = events;
  });

  return { state, subscription };
}

describe('bootstrap and root contract', () => {
  beforeEach(() => {
    spyOn(console, 'log').and.stub();
    spyOn(console, 'warn').and.stub();
    spyOn(console, 'error').and.stub();
  });

  it('emits the AppModule bootstrap event with the shared bootstrap correlation id', () => {
    const emitSpy = jasmine.createSpy('emit');
    const bootstrapCorrelationId = 'bootstrap-test-id';

    new AppModule(
      { emit: emitSpy } as unknown as EventBusService,
      bootstrapCorrelationId,
    );

    expect(emitSpy).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        category: 'BOOTSTRAP',
        label: 'AppModule created',
        source: 'AppModule',
        correlationId: bootstrapCorrelationId,
      }),
    );
  });

  it('emits the bootstrap completion event through NgZone after bootstrap', () => {
    const emitSpy = jasmine.createSpy('emit');
    const runSpy = jasmine
      .createSpy('run')
      .and.callFake((callback: () => void) => {
        callback();
      });

    emitBootstrapCompletedEvent({
      eventBusService: { emit: emitSpy },
      ngZone: { run: runSpy },
      bootstrapCorrelationId: 'bootstrap-test-id',
      bootstrapStartTimestamp: 100,
      now: () => 145,
    });

    expect(runSpy).toHaveBeenCalledOnceWith(jasmine.any(Function));
    expect(emitSpy).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        category: 'BOOTSTRAP',
        label: 'Angular bootstrap completed',
        source: 'main.ts',
        correlationId: 'bootstrap-test-id',
        durationMs: 45,
      }),
    );
  });

  it('emits the AppComponent root lifecycle in order', fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        EventBusService,
        {
          provide: BOOTSTRAP_CORRELATION_ID,
          useValue: 'bootstrap-root-test',
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const eventBus = TestBed.inject(EventBusService);
    const { subscription, state } = observeEvents(eventBus);
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    flushMicrotasks();

    const appComponentEvents = state.latestEvents.filter(
      (event) => event.source === 'AppComponent',
    );
    const bootstrapEvents = state.latestEvents.filter(
      (event) => event.category === 'BOOTSTRAP',
    );

    expect(bootstrapEvents.length).toBe(0);
    expect(appComponentEvents.map((event) => event.label)).toEqual([
      'AppComponent constructor created',
      'AppComponent ngOnInit',
      'AppComponent ngAfterViewInit',
    ]);
    expect(
      appComponentEvents.every((event) => event.level === 'info'),
    ).toBeTrue();
    expect(
      appComponentEvents.every(
        (event) => event.correlationId === 'bootstrap-root-test',
      ),
    ).toBeTrue();
    expect(fixture.componentInstance.activeView).toBe('timeline');

    fixture.destroy();
    flushMicrotasks();

    const destroyEvent = state.latestEvents.find(
      (event) => event.label === 'AppComponent ngOnDestroy',
    );
    expect(destroyEvent).toEqual(
      jasmine.objectContaining({
        source: 'AppComponent',
        level: 'warn',
        correlationId: 'bootstrap-root-test',
      }),
    );

    subscription.unsubscribe();
  }));

  it('allows TimelineComponent to clear the event stream and reset selection', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [TimelineComponent],
      providers: [EventBusService],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const eventBus = TestBed.inject(EventBusService);
    const { subscription, state } = observeEvents(eventBus);
    const fixture: ComponentFixture<TimelineComponent> =
      TestBed.createComponent(TimelineComponent);

    fixture.detectChanges();

    const timelineEvent = createEvent({
      category: 'BOOTSTRAP',
      label: 'Synthetic bootstrap event',
      source: 'test',
      correlationId: createCorrelationId('bootstrap'),
    });

    eventBus.emit(timelineEvent);
    flushMicrotasks();
    fixture.detectChanges();

    expect(state.latestEvents.length).toBe(1);
    expect(state.latestEvents[0]).toEqual(timelineEvent);

    fixture.componentInstance.selectedEvent = timelineEvent;
    fixture.detectChanges();

    const clearButton = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const clearControl = clearButton.find((button) =>
      button.textContent?.includes('Clear'),
    );

    expect(clearControl).toBeDefined();

    clearControl?.click();
    fixture.detectChanges();
    flushMicrotasks();

    expect(fixture.componentInstance.selectedEvent).toBeUndefined();
    expect(state.latestEvents).toEqual([]);

    subscription.unsubscribe();
    fixture.destroy();
  }));

  it('keeps EventBusService append and clear behavior in order', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [EventBusService],
    });

    const eventBus = TestBed.inject(EventBusService);
    const { subscription, state } = observeEvents(eventBus);

    const firstEvent = createEvent({
      category: 'BOOTSTRAP',
      label: 'first',
      source: 'test',
      correlationId: 'bootstrap-a',
    });
    const secondEvent = createEvent({
      category: 'LIFECYCLE',
      label: 'second',
      source: 'test',
      correlationId: 'bootstrap-a',
      level: 'warn',
    });

    eventBus.emit(firstEvent);
    eventBus.emit(secondEvent);
    flushMicrotasks();

    expect(state.latestEvents).toEqual([firstEvent, secondEvent]);

    eventBus.clear();
    expect(state.latestEvents).toEqual([]);

    subscription.unsubscribe();
  }));
});

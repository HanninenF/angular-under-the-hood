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
import { PageWrapper } from '../features/page-wrapper/page-wrapper';
import { SettingsComponent } from '../features/settings/settings.component';
import { LifecyclePreferencesCardComponent } from '../features/lifecycle-demo/lifecycle-preferences-card.component';
import { LifecycleProfileCardComponent } from '../features/lifecycle-demo/lifecycle-profile-card.component';
import { TimelineComponent } from '../features/timeline/timeline.component';
import { TimelineDetailsComponent } from '../features/timeline/timeline-details/timeline-details.component';
import { TimelineMetaComponent } from '../features/timeline/timeline-details/timeline-meta/timeline-meta.component';
import { TimelineListComponent } from '../features/timeline/timeline-list/timeline-list.component';

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

  it('keeps timeline controls at the shell level so pause and auto-scroll survive view changes', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        AppComponent,
        PageWrapper,
        TimelineComponent,
        TimelineListComponent,
        TimelineDetailsComponent,
        TimelineMetaComponent,
        SettingsComponent,
        LifecycleProfileCardComponent,
        LifecyclePreferencesCardComponent,
      ],
      providers: [
        EventBusService,
        {
          provide: BOOTSTRAP_CORRELATION_ID,
          useValue: 'bootstrap-root-test',
        },
      ],
    });

    const eventBus = TestBed.inject(EventBusService);
    const { subscription, state } = observeEvents(eventBus);
    const fixture: ComponentFixture<AppComponent> =
      TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    flushMicrotasks();

    const getButtons = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('button'));
    const getRows = (): HTMLButtonElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.list-wrapper button.row'),
      ) as HTMLButtonElement[];

    const initialEvent = createEvent({
      category: 'BOOTSTRAP',
      label: 'Synthetic bootstrap event',
      source: 'test',
      correlationId: createCorrelationId('bootstrap'),
    });

    eventBus.emit(initialEvent);
    flushMicrotasks();
    fixture.detectChanges();

    const initialRows = getRows().length;
    expect(initialRows).toBeGreaterThan(0);

    const pauseButton = getButtons().find((button) =>
      button.textContent?.includes('Pause'),
    );

    expect(pauseButton).toBeDefined();
    pauseButton?.click();
    fixture.detectChanges();

    const settingsButton = getButtons().find((button) =>
      button.textContent?.includes('Settings'),
    );

    expect(settingsButton).toBeDefined();
    settingsButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    const pausedEvent = createEvent({
      category: 'HTTP',
      label: 'event while paused',
      source: 'test',
      correlationId: createCorrelationId('bootstrap'),
    });

    eventBus.emit(pausedEvent);
    flushMicrotasks();
    fixture.detectChanges();

    const timelineButton = getButtons().find((button) =>
      button.textContent?.includes('Timeline'),
    );

    expect(timelineButton).toBeDefined();
    timelineButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    expect(getRows().length).toBe(initialRows);

    const resumeButton = getButtons().find((button) =>
      button.textContent?.includes('Resume'),
    );

    expect(resumeButton).toBeDefined();
    resumeButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    expect(getRows().length).toBeGreaterThan(initialRows);
    expect(
      getRows().some((row) => row.textContent?.includes('event while paused')),
    ).toBeTrue();
    expect(
      state.latestEvents.some((event) => event.label === 'event while paused'),
    ).toBeTrue();

    subscription.unsubscribe();
    fixture.destroy();
  }));

  it('clears the shell-managed timeline stream and resets the selected event', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        AppComponent,
        PageWrapper,
        TimelineComponent,
        TimelineListComponent,
        TimelineDetailsComponent,
        TimelineMetaComponent,
        SettingsComponent,
        LifecycleProfileCardComponent,
        LifecyclePreferencesCardComponent,
      ],
      providers: [
        EventBusService,
        {
          provide: BOOTSTRAP_CORRELATION_ID,
          useValue: 'bootstrap-root-test',
        },
      ],
    });

    const eventBus = TestBed.inject(EventBusService);
    const { subscription, state } = observeEvents(eventBus);
    const fixture: ComponentFixture<AppComponent> =
      TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    flushMicrotasks();

    const getButtons = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('button'));
    const getRows = (): HTMLButtonElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.list-wrapper button.row'),
      ) as HTMLButtonElement[];

    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'clear target event',
        source: 'test',
        correlationId: createCorrelationId('bootstrap'),
      }),
    );
    flushMicrotasks();
    fixture.detectChanges();

    const firstRow = getRows()[0];
    expect(firstRow).toBeDefined();
    firstRow.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.details')).toBeTruthy();

    const clearButton = getButtons().find((button) =>
      button.textContent?.includes('Clear'),
    );

    expect(clearButton).toBeDefined();
    clearButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    expect(getRows().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.details')).toBeNull();
    expect(state.latestEvents).toEqual([]);

    subscription.unsubscribe();
    fixture.destroy();
  }));

  it('auto-scrolls the timeline viewport when the shell control is enabled', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        AppComponent,
        PageWrapper,
        TimelineComponent,
        TimelineListComponent,
        TimelineDetailsComponent,
        TimelineMetaComponent,
        SettingsComponent,
        LifecycleProfileCardComponent,
        LifecyclePreferencesCardComponent,
      ],
      providers: [
        EventBusService,
        {
          provide: BOOTSTRAP_CORRELATION_ID,
          useValue: 'bootstrap-root-test',
        },
      ],
    });

    const eventBus = TestBed.inject(EventBusService);
    const fixture: ComponentFixture<AppComponent> =
      TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    flushMicrotasks();

    const listViewport = fixture.nativeElement.querySelector(
      '.list-viewport',
    ) as HTMLElement;

    expect(listViewport).toBeTruthy();

    spyOnProperty(listViewport, 'scrollHeight', 'get').and.returnValue(640);
    const scrollTopSpy = spyOnProperty(listViewport, 'scrollTop', 'set');

    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'scroll target event',
        source: 'test',
        correlationId: createCorrelationId('bootstrap'),
      }),
    );

    flushMicrotasks();
    fixture.detectChanges();

    expect(scrollTopSpy).toHaveBeenCalledWith(640);

    fixture.destroy();
  }));

  it('keeps shell-owned timeline filters in sync across view changes and filters by correlation id', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        AppComponent,
        PageWrapper,
        TimelineComponent,
        TimelineListComponent,
        TimelineDetailsComponent,
        TimelineMetaComponent,
        SettingsComponent,
        LifecycleProfileCardComponent,
        LifecyclePreferencesCardComponent,
      ],
      providers: [
        EventBusService,
        {
          provide: BOOTSTRAP_CORRELATION_ID,
          useValue: 'bootstrap-root-test',
        },
      ],
    });

    const eventBus = TestBed.inject(EventBusService);
    const fixture: ComponentFixture<AppComponent> =
      TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    flushMicrotasks();

    const getButtons = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('button'));
    const getRows = (): HTMLButtonElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.list-wrapper button.row'),
      ) as HTMLButtonElement[];
    const getSelects = (): HTMLSelectElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('select'),
      ) as HTMLSelectElement[];
    const getSearchInputs = (): HTMLInputElement[] =>
      Array.from(
        fixture.nativeElement.querySelectorAll('input[type="search"]'),
      ) as HTMLInputElement[];

    const clearButton = getButtons().find(
      (button) => button.textContent?.trim() === 'Clear',
    );

    expect(clearButton).toBeDefined();
    clearButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    const bootstrapCorrelationId = createCorrelationId('bootstrap');
    const lifecycleCorrelationId = createCorrelationId('lifecycle');

    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'boot event',
        source: 'test',
        correlationId: bootstrapCorrelationId,
      }),
    );
    eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'profile card mounted',
        source: 'LifecycleProfileCardComponent',
        correlationId: lifecycleCorrelationId,
      }),
    );
    eventBus.emit(
      createEvent({
        category: 'HTTP',
        label: 'http request completed',
        source: 'HttpClient',
        correlationId: bootstrapCorrelationId,
      }),
    );

    flushMicrotasks();
    fixture.detectChanges();

    expect(getRows().length).toBe(3);

    const categorySelect = getSelects()[0];
    categorySelect.value = 'LIFECYCLE';
    categorySelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(getRows().length).toBe(1);
    expect(getRows()[0].textContent).toContain('profile card mounted');

    getRows()[0].click();
    fixture.detectChanges();

    const correlationButton = fixture.nativeElement.querySelector(
      '.details__meta .correlation-button',
    ) as HTMLButtonElement;

    expect(correlationButton).toBeTruthy();
    correlationButton.click();
    fixture.detectChanges();

    const correlationInput = getSearchInputs()[1];
    expect(correlationInput.value).toBe(lifecycleCorrelationId);
    expect(getRows().length).toBe(1);

    const settingsButton = getButtons().find((button) =>
      button.textContent?.includes('Settings'),
    );
    expect(settingsButton).toBeDefined();
    settingsButton?.click();
    fixture.detectChanges();

    const timelineButton = getButtons().find((button) =>
      button.textContent?.includes('Timeline'),
    );
    expect(timelineButton).toBeDefined();
    timelineButton?.click();
    fixture.detectChanges();
    flushMicrotasks();

    const refreshedSelects = getSelects();
    expect(refreshedSelects[0].value).toBe('LIFECYCLE');
    expect(refreshedSelects[1].value).toBe('ALL');
    expect(getSearchInputs()[0].value).toBe('');
    expect(getSearchInputs()[1].value).toBe(lifecycleCorrelationId);
    expect(getRows().length).toBe(1);

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

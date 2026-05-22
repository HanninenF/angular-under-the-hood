/* eslint-disable max-lines-per-function */
import { CommonModule } from '@angular/common';
import { Component, Type } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
} from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { EventBusService } from '../core/events/event-bus.service';
import { EventLevel, RuntimeEvent } from '../core/events/runtime-event.model';
import { LifecyclePreferencesCardComponent } from '../features/lifecycle-demo/lifecycle-preferences-card.component';
import { LifecycleProfileCardComponent } from '../features/lifecycle-demo/lifecycle-profile-card.component';
import { SettingsComponent } from '../features/settings/settings.component';

@Component({
  selector: 'app-lifecycle-host',
  template: `
    @if (renderedComponent) {
      <ng-container *ngComponentOutlet="renderedComponent"></ng-container>
    }
  `,
})
class LifecycleHostComponent {
  renderedComponent: Type<unknown> | null = null;
}

describe('lifecycle contract', () => {
  let fixture: ComponentFixture<LifecycleHostComponent>;
  let hostComponent: LifecycleHostComponent;
  let eventBus: EventBusService;
  let latestEvents: RuntimeEvent[] = [];
  let eventsSubscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        LifecycleHostComponent,
        SettingsComponent,
        LifecycleProfileCardComponent,
        LifecyclePreferencesCardComponent,
      ],
    });

    spyOn(console, 'log').and.stub();
    spyOn(console, 'warn').and.stub();
    spyOn(console, 'error').and.stub();

    fixture = TestBed.createComponent(LifecycleHostComponent);
    hostComponent = fixture.componentInstance;
    eventBus = TestBed.inject(EventBusService);
    eventsSubscription = eventBus.events$.subscribe((events) => {
      latestEvents = events;
    });
  });

  afterEach(() => {
    eventsSubscription.unsubscribe();
    fixture.destroy();
  });

  function rendered(selector: string): boolean {
    return fixture.nativeElement.querySelector(selector) !== null;
  }

  function eventsSince(beforeCount: number): RuntimeEvent[] {
    return latestEvents.slice(beforeCount);
  }

  function mount(componentType: Type<unknown>): RuntimeEvent[] {
    const beforeCount = latestEvents.length;
    hostComponent.renderedComponent = componentType;
    fixture.detectChanges();
    flushMicrotasks();
    return eventsSince(beforeCount);
  }

  function unmount(): RuntimeEvent[] {
    const beforeCount = latestEvents.length;
    hostComponent.renderedComponent = null;
    fixture.detectChanges();
    flushMicrotasks();
    return eventsSince(beforeCount);
  }

  function clickButton(buttonText: string): RuntimeEvent[] {
    const beforeCount = latestEvents.length;
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const button = buttons.find((candidate) =>
      candidate.textContent?.includes(buttonText),
    );

    expect(button).withContext(`Missing button: ${buttonText}`).toBeDefined();

    button?.click();
    fixture.detectChanges();
    flushMicrotasks();

    return eventsSince(beforeCount);
  }

  function expectLifecycleEvents(
    events: RuntimeEvent[],
    source: string,
    expectedLabels: string[],
    expectedLevels?: EventLevel[],
  ): string {
    const sourceEvents = events.filter((event) => event.source === source);
    const levels =
      expectedLevels ??
      expectedLabels.map((label) =>
        label.endsWith('ngOnDestroy') ? 'warn' : 'info',
      );

    expect(sourceEvents.length).toBe(expectedLabels.length);
    expect(sourceEvents.map((event) => event.label)).toEqual(expectedLabels);
    expect(sourceEvents.map((event) => event.level)).toEqual(levels);

    const correlationId = sourceEvents[0]?.correlationId;
    expect(correlationId).withContext(source).toBeDefined();
    expect(
      sourceEvents.every((event) => event.correlationId === correlationId),
    ).toBeTrue();

    return correlationId as string;
  }

  function expectNoLifecycleEvents(
    events: RuntimeEvent[],
    source: string,
  ): void {
    expect(events.some((event) => event.source === source)).toBeFalse();
  }

  it('treats the profile card lifecycle as a stable contract', fakeAsync(() => {
    const initialEvents = mount(LifecycleProfileCardComponent);

    expect(rendered('app-lifecycle-profile-card')).toBeTrue();

    const lifecycleCorrelationId = expectLifecycleEvents(
      initialEvents,
      'LifecycleProfileCardComponent',
      [
        'LifecycleProfileCardComponent constructor created',
        'LifecycleProfileCardComponent ngOnInit',
        'LifecycleProfileCardComponent ngAfterViewInit',
      ],
    );

    const destroyEvents = unmount();

    expect(rendered('app-lifecycle-profile-card')).toBeFalse();
    expectLifecycleEvents(
      destroyEvents,
      'LifecycleProfileCardComponent',
      ['LifecycleProfileCardComponent ngOnDestroy'],
      ['warn'],
    );
    expect(destroyEvents[0]?.correlationId).toBe(lifecycleCorrelationId);
  }));

  it('treats the preferences card lifecycle as a stable contract', fakeAsync(() => {
    const initialEvents = mount(LifecyclePreferencesCardComponent);

    expect(rendered('app-lifecycle-preferences-card')).toBeTrue();

    const lifecycleCorrelationId = expectLifecycleEvents(
      initialEvents,
      'LifecyclePreferencesCardComponent',
      [
        'LifecyclePreferencesCardComponent constructor created',
        'LifecyclePreferencesCardComponent ngOnInit',
        'LifecyclePreferencesCardComponent ngAfterViewInit',
      ],
    );

    const destroyEvents = unmount();

    expect(rendered('app-lifecycle-preferences-card')).toBeFalse();
    expectLifecycleEvents(
      destroyEvents,
      'LifecyclePreferencesCardComponent',
      ['LifecyclePreferencesCardComponent ngOnDestroy'],
      ['warn'],
    );
    expect(destroyEvents[0]?.correlationId).toBe(lifecycleCorrelationId);
  }));

  it('keeps SettingsComponent and its child cards on separate lifecycles', fakeAsync(() => {
    const initialEvents = mount(SettingsComponent);

    expect(rendered('app-settings')).toBeTrue();
    expect(rendered('app-lifecycle-profile-card')).toBeTrue();
    expect(rendered('app-lifecycle-preferences-card')).toBeFalse();

    const settingsCorrelationId = expectLifecycleEvents(
      initialEvents,
      'SettingsComponent',
      ['SettingsComponent constructor created', 'SettingsComponent ngOnInit'],
      ['info', 'info'],
    );
    const profileCorrelationId = expectLifecycleEvents(
      initialEvents,
      'LifecycleProfileCardComponent',
      [
        'LifecycleProfileCardComponent constructor created',
        'LifecycleProfileCardComponent ngOnInit',
        'LifecycleProfileCardComponent ngAfterViewInit',
      ],
    );

    expect(profileCorrelationId).not.toBe(settingsCorrelationId);

    const preferencesBatch = clickButton('Preferences card');

    expect(rendered('app-lifecycle-profile-card')).toBeFalse();
    expect(rendered('app-lifecycle-preferences-card')).toBeTrue();
    expectNoLifecycleEvents(preferencesBatch, 'SettingsComponent');
    expectLifecycleEvents(
      preferencesBatch,
      'LifecycleProfileCardComponent',
      ['LifecycleProfileCardComponent ngOnDestroy'],
      ['warn'],
    );
    const preferencesCorrelationId = expectLifecycleEvents(
      preferencesBatch,
      'LifecyclePreferencesCardComponent',
      [
        'LifecyclePreferencesCardComponent constructor created',
        'LifecyclePreferencesCardComponent ngOnInit',
        'LifecyclePreferencesCardComponent ngAfterViewInit',
      ],
    );

    expect(preferencesCorrelationId).not.toBe(profileCorrelationId);

    const profileBatch = clickButton('Profile card');

    expect(rendered('app-lifecycle-profile-card')).toBeTrue();
    expect(rendered('app-lifecycle-preferences-card')).toBeFalse();
    expectNoLifecycleEvents(profileBatch, 'SettingsComponent');
    expectLifecycleEvents(
      profileBatch,
      'LifecyclePreferencesCardComponent',
      ['LifecyclePreferencesCardComponent ngOnDestroy'],
      ['warn'],
    );
    const secondProfileCorrelationId = expectLifecycleEvents(
      profileBatch,
      'LifecycleProfileCardComponent',
      [
        'LifecycleProfileCardComponent constructor created',
        'LifecycleProfileCardComponent ngOnInit',
        'LifecycleProfileCardComponent ngAfterViewInit',
      ],
    );

    expect(secondProfileCorrelationId).not.toBe(profileCorrelationId);

    const destroyEvents = unmount();

    expect(rendered('app-settings')).toBeFalse();
    expectLifecycleEvents(
      destroyEvents,
      'LifecycleProfileCardComponent',
      ['LifecycleProfileCardComponent ngOnDestroy'],
      ['warn'],
    );
    expectLifecycleEvents(
      destroyEvents,
      'SettingsComponent',
      ['SettingsComponent ngOnDestroy'],
      ['warn'],
    );
  }));
});

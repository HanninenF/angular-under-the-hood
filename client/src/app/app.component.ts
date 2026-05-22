import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RuntimeEvent } from './core/events/runtime-event.model';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';
import { BOOTSTRAP_CORRELATION_ID } from './core/correlation/bootstrap-correlation-id.token';
import { DemoView } from './features/page-wrapper/page-wrapper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly eventBus = inject(EventBusService);
  private readonly bootstrapCorrelationId = inject(BOOTSTRAP_CORRELATION_ID);
  private readonly eventSubscription = new Subscription();
  private readonly visibleTimelineEventsSubject = new BehaviorSubject<
    RuntimeEvent[]
  >([]);

  private allTimelineEvents: RuntimeEvent[] = [];

  title = 'client';
  activeView: DemoView = 'timeline';
  isDebugOutlineEnabled = false;
  isPaused = false;
  isAutoScrollEnabled = true;
  selectedEvent?: RuntimeEvent;

  readonly timelineEvents$ = this.visibleTimelineEventsSubject.asObservable();

  constructor() {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent constructor created',
        source: 'AppComponent',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }

  ngOnInit(): void {
    this.eventSubscription.add(
      this.eventBus.events$.subscribe((events) => {
        this.allTimelineEvents = events;

        if (events.length === 0) {
          this.selectedEvent = undefined;
          this.visibleTimelineEventsSubject.next([]);
          return;
        }

        if (!this.isPaused) {
          this.visibleTimelineEventsSubject.next(events);
        }
      }),
    );

    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngOnInit',
        source: 'AppComponent',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
    this.updateBodyDebugOutlineClass();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.eventBus.emit(
        createEvent({
          category: 'LIFECYCLE',
          label: 'AppComponent ngAfterViewInit',
          source: 'AppComponent',
          correlationId: this.bootstrapCorrelationId,
        }),
      );
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngOnDestroy',
        source: 'AppComponent',
        level: 'warn',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }

  setActiveView(view: DemoView): void {
    this.activeView = view;
  }

  selectEvent(event: RuntimeEvent): void {
    this.selectedEvent = event;
  }

  closeDetails(): void {
    this.selectedEvent = undefined;
  }

  clearTimeline(): void {
    this.closeDetails();
    this.allTimelineEvents = [];
    this.visibleTimelineEventsSubject.next([]);
    this.eventBus.clear();
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;

    if (!this.isPaused) {
      this.visibleTimelineEventsSubject.next(this.allTimelineEvents);
    }
  }

  toggleAutoScroll(): void {
    this.isAutoScrollEnabled = !this.isAutoScrollEnabled;
  }

  toggleDebugOutline(): void {
    this.isDebugOutlineEnabled = !this.isDebugOutlineEnabled;
    this.updateBodyDebugOutlineClass();
  }

  private updateBodyDebugOutlineClass(): void {
    document.body.classList.toggle('debug-outline', this.isDebugOutlineEnabled);
  }
}

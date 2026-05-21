import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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

  title = 'client';
  activeView: DemoView = 'timeline';
  isDebugOutlineEnabled = false;

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
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: `AppComponent active view changed to ${view}`,
        source: 'AppComponent',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }

  toggleDebugOutline(): void {
    this.isDebugOutlineEnabled = !this.isDebugOutlineEnabled;
    this.updateBodyDebugOutlineClass();
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: `AppComponent debug outline ${
          this.isDebugOutlineEnabled ? 'enabled' : 'disabled'
        }`,
        source: 'AppComponent',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }

  private updateBodyDebugOutlineClass(): void {
    document.body.classList.toggle('debug-outline', this.isDebugOutlineEnabled);
  }
}

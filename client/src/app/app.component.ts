import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';
import { BOOTSTRAP_CORRELATION_ID } from './core/correlation/bootstrap-correlation-id.token';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'client';

  constructor(
    private readonly eventBus: EventBusService,
    @Inject(BOOTSTRAP_CORRELATION_ID)
    private readonly bootstrapCorrelationId: string,
  ) {
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
  }

  ngAfterViewInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngAfterViewInit',
        source: 'AppComponent',
      }),
    );
  }

  ngOnDestroy(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngOnDestroy',
        source: 'AppComponent',
        level: 'warn',
      }),
    );
  }
}

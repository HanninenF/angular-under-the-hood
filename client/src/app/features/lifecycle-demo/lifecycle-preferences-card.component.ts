import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { createCorrelationId } from '../../core/correlation/correlation-id';
import { EventBusService } from '../../core/events/event-bus.service';
import { createEvent } from '../../core/events/event-factory';
import { LIFECYCLE_PREFERENCES_CORRELATION_ID } from './lifecycle-preferences-correlation-id.token';

@Component({
  selector: 'app-lifecycle-preferences-card',
  templateUrl: './lifecycle-preferences-card.component.html',
  styleUrls: ['./lifecycle-preferences-card.component.scss'],
  providers: [
    {
      provide: LIFECYCLE_PREFERENCES_CORRELATION_ID,
      useFactory: () => createCorrelationId('preferences'),
    },
  ],
})
export class LifecyclePreferencesCardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly eventBus = inject(EventBusService);
  private readonly correlationId = inject(LIFECYCLE_PREFERENCES_CORRELATION_ID);

  constructor() {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecyclePreferencesCardComponent constructor created',
        source: 'LifecyclePreferencesCardComponent',
        correlationId: this.correlationId,
      }),
    );
  }

  ngOnInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecyclePreferencesCardComponent ngOnInit',
        source: 'LifecyclePreferencesCardComponent',
        correlationId: this.correlationId,
      }),
    );
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.eventBus.emit(
        createEvent({
          category: 'LIFECYCLE',
          label: 'LifecyclePreferencesCardComponent ngAfterViewInit',
          source: 'LifecyclePreferencesCardComponent',
          correlationId: this.correlationId,
        }),
      );
    });
  }

  ngOnDestroy(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecyclePreferencesCardComponent ngOnDestroy',
        source: 'LifecyclePreferencesCardComponent',
        level: 'warn',
        correlationId: this.correlationId,
      }),
    );
  }
}

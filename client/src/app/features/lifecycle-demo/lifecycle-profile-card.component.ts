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
import { LIFECYCLE_PROFILE_CORRELATION_ID } from './lifecycle-profile-correlation-id.token';

@Component({
  selector: 'app-lifecycle-profile-card',
  templateUrl: './lifecycle-profile-card.component.html',
  styleUrls: ['./lifecycle-profile-card.component.scss'],
  providers: [
    {
      provide: LIFECYCLE_PROFILE_CORRELATION_ID,
      useFactory: () => createCorrelationId('profile'),
    },
  ],
})
export class LifecycleProfileCardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly eventBus = inject(EventBusService);
  private readonly correlationId = inject(LIFECYCLE_PROFILE_CORRELATION_ID);

  constructor() {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecycleProfileCardComponent constructor created',
        source: 'LifecycleProfileCardComponent',
        correlationId: this.correlationId,
      }),
    );
  }

  ngOnInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecycleProfileCardComponent ngOnInit',
        source: 'LifecycleProfileCardComponent',
        correlationId: this.correlationId,
      }),
    );
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.eventBus.emit(
        createEvent({
          category: 'LIFECYCLE',
          label: 'LifecycleProfileCardComponent ngAfterViewInit',
          source: 'LifecycleProfileCardComponent',
          correlationId: this.correlationId,
        }),
      );
    });
  }

  ngOnDestroy(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'LifecycleProfileCardComponent ngOnDestroy',
        source: 'LifecycleProfileCardComponent',
        level: 'warn',
        correlationId: this.correlationId,
      }),
    );
  }
}

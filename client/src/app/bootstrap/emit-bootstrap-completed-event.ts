import { NgZone } from '@angular/core';
import { EventBusService } from '../core/events/event-bus.service';
import { createEvent } from '../core/events/event-factory';

export function emitBootstrapCompletedEvent(input: {
  eventBusService: Pick<EventBusService, 'emit'>;
  ngZone: Pick<NgZone, 'run'>;
  bootstrapCorrelationId: string;
  bootstrapStartTimestamp: number;
  now?: () => number;
}): void {
  const now = input.now ?? (() => performance.now());

  input.ngZone.run(() => {
    input.eventBusService.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'Angular bootstrap completed',
        source: 'main.ts',
        correlationId: input.bootstrapCorrelationId,
        durationMs: Math.round(now() - input.bootstrapStartTimestamp),
      }),
    );
  });
}

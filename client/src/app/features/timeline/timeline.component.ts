import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeEvent } from '../../core/events/runtime-event.model';
import { EventBusService } from '../../core/events/event-bus.service';
import { getShortCorrelationId } from '../../core/correlation/correlation-id';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  readonly events$: Observable<RuntimeEvent[]> = this.eventBus.events$;

  selectedEvent?: RuntimeEvent;

  constructor(private readonly eventBus: EventBusService) {}

  select(event: RuntimeEvent): void {
    this.selectedEvent = event;
  }

  closeDetails(): void {
    this.selectedEvent = undefined;
  }

  clear(): void {
    this.closeDetails();
    this.eventBus.clear();
  }

  formatMs(ms: number): string {
    return `${Math.round(ms)}ms`;
  }

  getShortCorrelationId = getShortCorrelationId;

  getFlowColor(id?: string): string {
    if (!id) return 'transparent';

    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;

    return `hsl(${hue}, 96%, 78%)`;
  }
}

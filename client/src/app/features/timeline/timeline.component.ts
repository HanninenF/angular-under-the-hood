import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeEvent } from '../../core/events/runtime-event.model';
import { EventBusService } from '../../core/events/event-bus.service';

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
}

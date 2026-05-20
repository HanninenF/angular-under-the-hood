import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeEvent } from '../../core/events/runtime-event.model';
import { EventBusService } from '../../core/events/event-bus.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  private readonly eventBus = inject(EventBusService);

  readonly events$: Observable<RuntimeEvent[]> = this.eventBus.events$;

  selectedEvent?: RuntimeEvent;

  selectEvent(event: RuntimeEvent): void {
    this.selectedEvent = event;
  }

  closeDetails(): void {
    this.selectedEvent = undefined;
  }

  clear(): void {
    this.closeDetails();
    this.eventBus.clear();
  }
}

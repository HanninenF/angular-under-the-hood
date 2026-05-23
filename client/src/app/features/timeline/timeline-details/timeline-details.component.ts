import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RuntimeEvent } from '../../../core/events/runtime-event.model';

@Component({
  selector: 'app-timeline-details',
  templateUrl: './timeline-details.componet.html',
  styleUrls: ['./timeline-details.componet.scss'],
})
export class TimelineDetailsComponent {
  @Input() selectedEvent?: RuntimeEvent;
  @Output() closeDetails = new EventEmitter<void>();
  @Output() readonly filterByCorrelationId = new EventEmitter<string>();
}

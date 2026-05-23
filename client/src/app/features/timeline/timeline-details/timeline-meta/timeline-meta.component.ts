import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RuntimeEvent } from '../../../../core/events/runtime-event.model';

@Component({
  selector: 'app-timeline-meta',
  templateUrl: './timeline-meta.component.html',
  styleUrls: ['./timeline-meta.component.scss'],
})
export class TimelineMetaComponent {
  @Input() selectedEvent?: RuntimeEvent;
  @Output() readonly filterByCorrelationId = new EventEmitter<string>();
}

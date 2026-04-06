import { Component, Input } from '@angular/core';
import { RuntimeEvent } from '../../../../core/events/runtime-event.model';

@Component({
  selector: 'app-timeline-meta',
  templateUrl: './timeline-meta.component.html',
  styleUrl: './timeline-meta.component.scss',
})
export class TimelineMetaComponent {
  @Input() selectedEvent?: RuntimeEvent;
}

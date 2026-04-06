import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RuntimeEvent } from '../../../core/events/runtime-event.model';
import { Observable } from 'rxjs';
import { getShortCorrelationId } from '../../../core/correlation/correlation-id';

@Component({
  selector: 'app-timeline-list',
  templateUrl: './timeline-list.component.html',
  styleUrl: './timeline-list.component.scss',
})
export class TimelineListComponent {
  @Input() events$?: Observable<RuntimeEvent[]>;
  @Input() selectedEvent?: RuntimeEvent;
  @Output() selectEvent = new EventEmitter<RuntimeEvent>();

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

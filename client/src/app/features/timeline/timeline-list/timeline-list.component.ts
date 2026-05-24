import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RuntimeEvent } from '../../../core/events/runtime-event.model';
import { map, Observable } from 'rxjs';
import { getShortCorrelationId as shortenCorrelationId } from '../../../core/correlation/correlation-id';

interface TimelineRowViewModel {
  event: RuntimeEvent;
  timestampText: string;
  lifecycleDurationText: string;
  flowToneClass: string;
  shortCorrelationId: string;
}

@Component({
  selector: 'app-timeline-list',
  templateUrl: './timeline-list.component.html',
  styleUrls: ['./timeline-list.component.scss'],
})
export class TimelineListComponent {
  private eventsSource$?: Observable<RuntimeEvent[]>;

  @Input()
  set events$(value: Observable<RuntimeEvent[]> | undefined) {
    this.eventsSource$ = value;
    this.timelineRows$ = value?.pipe(
      map((events) => this.mapTimelineRows(events)),
    );
  }

  get events$(): Observable<RuntimeEvent[]> | undefined {
    return this.eventsSource$;
  }

  @Input() selectedEvent?: RuntimeEvent;
  @Output() selectEvent = new EventEmitter<RuntimeEvent>();

  timelineRows$?: Observable<TimelineRowViewModel[]>;

  formatMs(ms: number): string {
    return `${Math.round(ms)}ms`;
  }

  formatDurationMs(ms: number): string {
    const normalizedMilliseconds = Math.max(0, Math.round(ms));
    const minutes = Math.floor(normalizedMilliseconds / 60000);
    const seconds = Math.floor((normalizedMilliseconds % 60000) / 1000);
    const milliseconds = normalizedMilliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  }

  private readonly getShortCorrelationId = shortenCorrelationId;

  private mapTimelineRows(events: RuntimeEvent[]): TimelineRowViewModel[] {
    const lifecycleCreatedTimestamps =
      this.buildLifecycleCreatedTimestampMap(events);

    return events.map((event) => ({
      event,
      timestampText: this.formatMs(event.timestampMs),
      lifecycleDurationText: this.formatDurationMs(
        this.getLifecycleDurationMs(event, lifecycleCreatedTimestamps),
      ),
      flowToneClass: this.getFlowToneClass(event.correlationId),
      shortCorrelationId: event.correlationId
        ? this.getShortCorrelationId(event.correlationId)
        : '',
    }));
  }

  private getFlowToneClass(id?: string): string {
    if (!id) {
      return 'flow-tone-neutral';
    }

    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return `flow-tone-${Math.abs(hash) % 12}`;
  }

  private getLifecycleDurationMs(
    event: RuntimeEvent,
    createdTimestampByLifecycleKey: Map<string, number>,
  ): number {
    if (event.category !== 'LIFECYCLE' || !event.correlationId) {
      return 0;
    }

    const lifecycleKey = this.getLifecycleKey(
      event.source,
      event.correlationId,
    );
    const createdTimestampMs = createdTimestampByLifecycleKey.get(lifecycleKey);

    if (createdTimestampMs === undefined) {
      return 0;
    }

    return Math.max(0, event.timestampMs - createdTimestampMs);
  }

  private buildLifecycleCreatedTimestampMap(
    events: RuntimeEvent[],
  ): Map<string, number> {
    const createdTimestampByLifecycleKey = new Map<string, number>();

    for (const event of events) {
      if (event.category !== 'LIFECYCLE' || !event.correlationId) {
        continue;
      }

      if (!event.label.includes('constructor created')) {
        continue;
      }

      const lifecycleKey = this.getLifecycleKey(
        event.source,
        event.correlationId,
      );
      const existingTimestampMs =
        createdTimestampByLifecycleKey.get(lifecycleKey);

      if (
        existingTimestampMs === undefined ||
        event.timestampMs < existingTimestampMs
      ) {
        createdTimestampByLifecycleKey.set(lifecycleKey, event.timestampMs);
      }
    }

    return createdTimestampByLifecycleKey;
  }

  private getLifecycleKey(source: string, correlationId: string): string {
    return `${source}::${correlationId}`;
  }
}

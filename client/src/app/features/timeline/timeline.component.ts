import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeEvent } from '../../core/events/runtime-event.model';
import { EventBusService } from '../../core/events/event-bus.service';
import { createEvent } from '../../core/events/event-factory';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  readonly events$: Observable<RuntimeEvent[]> = this.eventBus.events$;

  selectedEvent?: RuntimeEvent;
  monsterCount = 0;

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

  spawnMonster(): void {
    this.monsterCount++;
    this.eventBus.emit(
      createEvent({
        category: 'USER_ACTION',
        label: `Monster #${this.monsterCount} spawned! 👾`,
        source: 'TimelineComponent',
        data: { monsterId: this.monsterCount },
      }),
    );
  }

  formatMs(ms: number): string {
    return `${Math.round(ms)}ms`;
  }
}

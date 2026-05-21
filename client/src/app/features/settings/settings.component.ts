import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EventBusService } from '../../core/events/event-bus.service';
import { createEvent } from '../../core/events/event-factory';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly eventBus = inject(EventBusService);

  readonly environmentName = 'DEV';
  readonly baseUrl = 'Local demo shell';
  readonly storageMode = 'InMemory';

  constructor() {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'SettingsComponent constructor created',
        source: 'SettingsComponent',
      }),
    );
  }

  ngOnInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'SettingsComponent ngOnInit',
        source: 'SettingsComponent',
      }),
    );
  }

  ngOnDestroy(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'SettingsComponent ngOnDestroy',
        source: 'SettingsComponent',
        level: 'warn',
      }),
    );
  }
}

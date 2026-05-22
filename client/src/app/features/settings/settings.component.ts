import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { createCorrelationId } from '../../core/correlation/correlation-id';
import { EventBusService } from '../../core/events/event-bus.service';
import { createEvent } from '../../core/events/event-factory';
import { SETTINGS_LIFECYCLE_CORRELATION_ID } from './settings-lifecycle-correlation-id.token';

type LifecycleTab = 'profile' | 'preferences';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [
    {
      provide: SETTINGS_LIFECYCLE_CORRELATION_ID,
      useFactory: () => createCorrelationId('settings'),
    },
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly eventBus = inject(EventBusService);
  readonly lifecycleCorrelationId = inject(SETTINGS_LIFECYCLE_CORRELATION_ID);

  readonly environmentName = 'DEV';
  readonly baseUrl = 'Local demo shell';
  readonly storageMode = 'InMemory';
  activeTab: LifecycleTab = 'profile';

  constructor() {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'SettingsComponent constructor created',
        source: 'SettingsComponent',
        correlationId: this.lifecycleCorrelationId,
      }),
    );
  }

  setActiveTab(tab: LifecycleTab): void {
    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
  }

  ngOnInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'SettingsComponent ngOnInit',
        source: 'SettingsComponent',
        correlationId: this.lifecycleCorrelationId,
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
        correlationId: this.lifecycleCorrelationId,
      }),
    );
  }
}

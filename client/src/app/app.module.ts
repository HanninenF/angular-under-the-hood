import { Inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TimelineComponent } from './features/timeline/timeline.component';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';
import { BOOTSTRAP_CORRELATION_ID } from './core/correlation/bootstrap-correlation-id.token';
import { PageWrapper } from './features/page-wrapper/page-wrapper';
import { TimelineDetailsComponent } from './features/timeline/timeline-details/timeline-details.component';
import { TimelineListComponent } from './features/timeline/timeline-list/timeline-list.component';
import { TimelineMetaComponent } from './features/timeline/timeline-details/timeline-meta/timeline-meta.component';
import { SettingsComponent } from './features/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent,
    PageWrapper,
    TimelineDetailsComponent,
    TimelineListComponent,
    TimelineMetaComponent,
    SettingsComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private readonly eventBus: EventBusService,
    @Inject(BOOTSTRAP_CORRELATION_ID)
    private readonly bootstrapCorrelationId: string,
  ) {
    this.eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'AppModule created',
        source: 'AppModule',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }
}

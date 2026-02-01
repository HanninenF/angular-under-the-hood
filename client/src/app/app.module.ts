import { Inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TimelineComponent } from './features/timeline/timeline.component';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';
import { BOOTSTRAP_CORRELATION_ID } from './core/correlation/bootstrap-correlation-id.token';

@NgModule({
  declarations: [AppComponent, TimelineComponent],
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
    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'AppModule created',
        source: 'AppModule',
        correlationId: this.bootstrapCorrelationId,
      }),
    );
  }
}

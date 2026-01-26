import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TimelineComponent } from './features/timeline/timeline.component';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';

@NgModule({
  declarations: [AppComponent, TimelineComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(eventBus: EventBusService) {
    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'AppModule created',
        source: 'AppModule',
      }),
    );
  }
}

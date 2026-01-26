import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { EventBusService } from './core/events/event-bus.service';
import { createEvent } from './core/events/event-factory';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'client';

  constructor(private readonly eventBus: EventBusService) {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent constructor created',
        source: 'AppComponent',
      }),
    );
  }

  ngOnInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngOnInit',
        source: 'AppComponent',
      }),
    );
  }

  ngAfterViewInit(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngAfterViewInit',
        source: 'AppComponent',
      }),
    );
  }

  ngOnDestroy(): void {
    this.eventBus.emit(
      createEvent({
        category: 'LIFECYCLE',
        label: 'AppComponent ngOnDestroy',
        source: 'AppComponent',
        level: 'warn',
      }),
    );
  }
}

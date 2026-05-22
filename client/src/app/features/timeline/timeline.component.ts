import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RuntimeEvent } from '../../core/events/runtime-event.model';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  private readonly eventsSubscription = new Subscription();
  private shouldScrollToBottom = false;

  @Input() events$?: Observable<RuntimeEvent[]>;
  @Input() selectedEvent?: RuntimeEvent;
  @Input() isPaused = false;
  @Input() isAutoScrollEnabled = true;

  @Output() readonly selectEvent = new EventEmitter<RuntimeEvent>();
  @Output() readonly closeDetails = new EventEmitter<void>();

  @ViewChild('listViewport')
  private listViewport?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    if (!this.events$) {
      return;
    }

    this.eventsSubscription.add(
      this.events$.subscribe((events) => {
        this.shouldScrollToBottom =
          this.isAutoScrollEnabled && !this.isPaused && events.length > 0;
      }),
    );
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom || !this.listViewport) {
      return;
    }

    this.listViewport.nativeElement.scrollTop =
      this.listViewport.nativeElement.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  ngOnDestroy(): void {
    this.eventsSubscription.unsubscribe();
  }
}

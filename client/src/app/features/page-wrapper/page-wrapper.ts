import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DemoView = 'timeline' | 'settings';

@Component({
  selector: 'app-page-wrapper',
  templateUrl: './page-wrapper.html',
  styleUrls: ['./page-wrapper.scss'],
})
export class PageWrapper {
  @Input() activeView: DemoView = 'timeline';
  @Input() isDebugOutlineEnabled = false;
  @Input() isPaused = false;
  @Input() isAutoScrollEnabled = true;

  @Output() readonly activeViewChange = new EventEmitter<DemoView>();
  @Output() readonly toggleDebugOutline = new EventEmitter<void>();
  @Output() readonly togglePause = new EventEmitter<void>();
  @Output() readonly toggleAutoScroll = new EventEmitter<void>();
  @Output() readonly clearTimeline = new EventEmitter<void>();

  get debugOutlineButtonLabel(): string {
    return this.isDebugOutlineEnabled
      ? 'Turn off debug outline'
      : 'Turn on debug outline';
  }

  get pauseButtonLabel(): string {
    return this.isPaused ? 'Resume' : 'Pause';
  }

  get autoScrollButtonLabel(): string {
    return this.isAutoScrollEnabled ? 'Auto-scroll on' : 'Auto-scroll off';
  }
}

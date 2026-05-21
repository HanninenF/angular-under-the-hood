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

  @Output() readonly activeViewChange = new EventEmitter<DemoView>();
  @Output() readonly toggleDebugOutline = new EventEmitter<void>();
}

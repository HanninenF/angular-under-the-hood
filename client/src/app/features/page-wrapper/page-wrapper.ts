import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DEFAULT_TIMELINE_FILTERS,
  TimelineFilters,
} from '../timeline/timeline-filters.model';

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
  @Input() timelineFilters: TimelineFilters = { ...DEFAULT_TIMELINE_FILTERS };

  @Output() readonly activeViewChange = new EventEmitter<DemoView>();
  @Output() readonly toggleDebugOutline = new EventEmitter<void>();
  @Output() readonly togglePause = new EventEmitter<void>();
  @Output() readonly toggleAutoScroll = new EventEmitter<void>();
  @Output() readonly clearTimeline = new EventEmitter<void>();
  @Output() readonly timelineFiltersChange =
    new EventEmitter<TimelineFilters>();
  @Output() readonly clearTimelineFilters = new EventEmitter<void>();

  readonly categoryOptions = [
    { value: 'ALL', label: 'All categories' },
    { value: 'BOOTSTRAP', label: 'Bootstrap' },
    { value: 'LIFECYCLE', label: 'Lifecycle' },
    { value: 'ROUTER', label: 'Router' },
    { value: 'GUARDS_AUTH', label: 'Guards/Auth' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'APP_INITIALIZER', label: 'App initializer' },
    { value: 'API_CONTRACT', label: 'API contract' },
    { value: 'PROXY', label: 'Proxy' },
  ] as const;

  readonly levelOptions = [
    { value: 'ALL', label: 'All levels' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warn' },
    { value: 'error', label: 'Error' },
  ] as const;

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

  get hasActiveTimelineFilters(): boolean {
    return (
      this.timelineFilters.category !== 'ALL' ||
      this.timelineFilters.level !== 'ALL' ||
      this.timelineFilters.searchText.trim().length > 0 ||
      this.timelineFilters.correlationId.trim().length > 0
    );
  }

  setCategory(category: string): void {
    this.timelineFiltersChange.emit({
      ...this.timelineFilters,
      category: category as TimelineFilters['category'],
    });
  }

  setLevel(level: string): void {
    this.timelineFiltersChange.emit({
      ...this.timelineFilters,
      level: level as TimelineFilters['level'],
    });
  }

  setSearchText(searchText: string): void {
    this.timelineFiltersChange.emit({
      ...this.timelineFilters,
      searchText,
    });
  }

  setCorrelationId(correlationId: string): void {
    this.timelineFiltersChange.emit({
      ...this.timelineFilters,
      correlationId,
    });
  }

  resetTimelineFilters(): void {
    this.clearTimelineFilters.emit();
  }
}

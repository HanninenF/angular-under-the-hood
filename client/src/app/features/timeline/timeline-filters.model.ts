import { getShortCorrelationId } from '../../core/correlation/correlation-id';
import {
  EventCategory,
  EventLevel,
  RuntimeEvent,
} from '../../core/events/runtime-event.model';

export type TimelineCategoryFilter = EventCategory | 'ALL';
export type TimelineLevelFilter = EventLevel | 'ALL';

export interface TimelineFilters {
  category: TimelineCategoryFilter;
  level: TimelineLevelFilter;
  searchText: string;
  correlationId: string;
}

export const DEFAULT_TIMELINE_FILTERS: TimelineFilters = {
  category: 'ALL',
  level: 'ALL',
  searchText: '',
  correlationId: '',
};

export function matchesTimelineFilters(
  event: RuntimeEvent,
  filters: TimelineFilters,
): boolean {
  return (
    matchesCategoryFilter(event, filters.category) &&
    matchesLevelFilter(event, filters.level) &&
    matchesSearchTextFilter(event, filters.searchText) &&
    matchesCorrelationFilter(event, filters.correlationId)
  );
}

function matchesCategoryFilter(
  event: RuntimeEvent,
  categoryFilter: TimelineCategoryFilter,
): boolean {
  return categoryFilter === 'ALL' || event.category === categoryFilter;
}

function matchesLevelFilter(
  event: RuntimeEvent,
  levelFilter: TimelineLevelFilter,
): boolean {
  return levelFilter === 'ALL' || event.level === levelFilter;
}

function matchesSearchTextFilter(
  event: RuntimeEvent,
  searchText: string,
): boolean {
  const normalizedSearchText = searchText.trim().toLowerCase();

  if (normalizedSearchText.length === 0) {
    return true;
  }

  const searchableText = [
    event.id,
    event.category,
    event.level,
    event.label,
    event.source,
    event.correlationId ?? '',
    event.durationMs?.toString() ?? '',
    JSON.stringify(event.data ?? {}),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedSearchText);
}

function matchesCorrelationFilter(
  event: RuntimeEvent,
  correlationId: string,
): boolean {
  const normalizedCorrelationId = correlationId.trim().toLowerCase();

  if (normalizedCorrelationId.length === 0) {
    return true;
  }

  const fullCorrelationId = (event.correlationId ?? '').toLowerCase();
  const shortCorrelationId = event.correlationId
    ? getShortCorrelationId(event.correlationId).toLowerCase()
    : '';

  return (
    fullCorrelationId.includes(normalizedCorrelationId) ||
    shortCorrelationId.includes(normalizedCorrelationId)
  );
}

import { EventCategory, EventLevel, RuntimeEvent } from './runtime-event.model';
//Obs: crypto.randomUUID() funkar i moderna browsers. Om du får problem kan vi byta till en enkel id-generator.

export function createEvent(input: {
  category: EventCategory;
  label: string;
  source: string;
  level?: EventLevel;
  correlationId?: string;
  durationMs?: number;
  data?: Record<string, unknown>;
}): RuntimeEvent {
  return {
    id: crypto.randomUUID(),
    timestampMs: performance.now(),
    level: input.level ?? 'info',
    ...input,
  };
}

/* En modellfil (TypeScript interface + typer). Den beskriver formatet på ett event.

Varför gör vi den?
Om vi inte standardiserar event-formatet blir varje event “lite olika”, och då blir UI:t svårt att filtrera, söka och visa konsekvent.

Vad signalerar det till nästa utvecklare?
“Alla events i systemet ser ut så här. Lägg inte in egna ad-hoc-objekt.” */

export type EventCategory =
  | 'BOOTSTRAP'
  | 'LIFECYCLE'
  | 'ROUTER'
  | 'GUARDS_AUTH'
  | 'HTTP'
  | 'APP_INITIALIZER'
  | 'API_CONTRACT'
  | 'PROXY'
  | 'USER_ACTION';

export type EventLevel = 'info' | 'warn' | 'error';

export interface RuntimeEvent {
  id: string;
  timestampMs: number; //performance.now()
  category: EventCategory;
  label: string;
  level: EventLevel;
  source: string; // component/service name
  correlationId?: string;
  durationMs?: number;
  data?: Record<string, unknown>;
}

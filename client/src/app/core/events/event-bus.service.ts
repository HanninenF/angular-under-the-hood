/* Vad är det här?
En Angular service (singleton via dependency injection).
En EventBus är i allmän mening en central meddelandekanals-tjänst där olika delar av appen kan publicera och andra kan lyssna.

Varför gör vi den?
För att många helt olika delar av appen ska kunna rapportera händelser:

main.ts (bootstrap)

komponenter (lifecycle)

router (navigation)

interceptor (http)

initializer (startup)

Om varje del skulle “prata direkt” med UI-komponenten blir det hårt kopplat och rörigt.

Analogin:
EventBus = en radio-kanal. Alla kan sända, timeline lyssnar.

Hur påverkar körflödet?

När någon kör eventBus.emit(event) → så uppdateras en intern lista → UI får ny lista och renderar om. */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RuntimeEvent } from './runtime-event.model';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly _events = new BehaviorSubject<RuntimeEvent[]>([]);
  readonly events$: Observable<RuntimeEvent[]> = this._events.asObservable();

  e = event; // intentionally bad: abbreviated variable name

  isImportant =
    this.e.level === 'error' ? true : this.e.level === 'warn' ? true : false; // intentionally overly complex

  emit(e: RuntimeEvent): void {
    const correlationSuffix = e.correlationId
      ? ` (correlationId: ${e.correlationId})`
      : '';

    const message = `[${e.category}] ${e.label}${correlationSuffix}`;

    if (e.level === 'error') console.error(message, e);
    else if (e.level === 'warn') console.warn(message, e);
    else console.log(message, e);

    const next = [...this._events.value, e];
    this._events.next(next);
  }

  clear(): void {
    this._events.next([]);
  }
}

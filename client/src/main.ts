import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { EventBusService } from './app/core/events/event-bus.service';
import { environment } from './environments/environments';
import { createEvent } from './app/core/events/event-factory';
import { createCorrelationId } from './app/core/correlation/correlation-id';
import { BOOTSTRAP_CORRELATION_ID } from './app/core/correlation/bootstrap-correlation-id.token';

console.log(`[main.ts] startar filen`);

async function bootstrap() {
  const bootstrapStartTimestamp = performance.now();

  const bootstrapCorrelationId = createCorrelationId('bootstrap');

  if (environment.production) {
    enableProdMode();
  }

  try {
    const moduleReference = await platformBrowserDynamic([
      { provide: BOOTSTRAP_CORRELATION_ID, useValue: bootstrapCorrelationId },
    ]).bootstrapModule(AppModule);

    const eventBusService = moduleReference.injector.get(EventBusService);

    eventBusService.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'Angular bootstrap completed',
        source: 'main.ts',
        correlationId: bootstrapCorrelationId,
        durationMs: Math.round(performance.now() - bootstrapStartTimestamp),
      }),
    );
  } catch (err) {
    console.error('[main.ts] bootstrap error', err);
  }
}
bootstrap();

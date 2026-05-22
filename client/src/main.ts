import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode, NgZone } from '@angular/core';
import { EventBusService } from './app/core/events/event-bus.service';
import { environment } from './environments/environments';
import { createCorrelationId } from './app/core/correlation/correlation-id';
import { BOOTSTRAP_CORRELATION_ID } from './app/core/correlation/bootstrap-correlation-id.token';
import { emitBootstrapCompletedEvent } from './app/bootstrap/emit-bootstrap-completed-event';

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
    const ngZone = moduleReference.injector.get(NgZone);

    emitBootstrapCompletedEvent({
      eventBusService,
      ngZone,
      bootstrapCorrelationId,
      bootstrapStartTimestamp,
    });
  } catch (err) {
    console.error('[main.ts] bootstrap error', err);
  }
}

bootstrap();

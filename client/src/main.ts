import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { EventBusService } from './app/core/events/event-bus.service';
import { environment } from './environments/environments';
import { createEvent } from './app/core/events/event-factory';

console.log(`[main.ts] startar filen`);

async function bootstrap() {
  const bootstrapStart = performance.now();

  if (environment.production) {
    enableProdMode();
  }

  try {
    const moduleRef = await platformBrowserDynamic().bootstrapModule(AppModule);

    const eventBus = moduleRef.injector.get(EventBusService);

    eventBus.emit(
      createEvent({
        category: 'BOOTSTRAP',
        label: 'Angular bootstrap completed',
        source: 'main.ts',
        correlationId: 'bootstrap-1',
        durationMs: Math.round(performance.now() - bootstrapStart),
      }),
    );
  } catch (err) {
    console.error('[main.ts] bootstrap error', err);
  }
}
bootstrap();

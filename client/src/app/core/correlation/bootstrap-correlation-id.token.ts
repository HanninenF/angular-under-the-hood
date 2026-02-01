import { InjectionToken } from '@angular/core';

/* BOOTSTRAP_CORRELATION_ID
Ett DI-token som håller correlationId för det initiala Angular bootstrap-flödet.

Varför gör vi den?
- Bootstrap-flödet startar innan de flesta services och komponenter skapas.
- Genom att använda ett InjectionToken kan vi skicka in correlationId till DI-containern tidigt. */
export const BOOTSTRAP_CORRELATION_ID = new InjectionToken<string>(
  'BOOTSTRAP_CORRELATION_ID',
);

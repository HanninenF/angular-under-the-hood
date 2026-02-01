import { InjectionToken } from '@angular/core';

/**
 * BOOTSTRAP_CORRELATION_ID
 * En DI-token som innehåller correlationId för det initiala Angular-bootstrapflödet.
 *
 * Varför detta finns:
 * - Bootstrapflödet startar innan de flesta tjänster och komponenter skapas.
 * - Genom att använda en InjectionToken kan vi skicka in correlationId i DI-containern tidigt.
 */

export const BOOTSTRAP_CORRELATION_ID = new InjectionToken<string>(
  'BOOTSTRAP_CORRELATION_ID',
);

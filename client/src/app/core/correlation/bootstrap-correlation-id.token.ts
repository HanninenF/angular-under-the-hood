import { InjectionToken } from '@angular/core';

/**
 * BOOTSTRAP_CORRELATION_ID
 * A DI token that holds the correlationId for the initial Angular bootstrap flow.
 *
 * Why this exists:
 * - The bootstrap flow starts before most services and components are created.
 * - Using an InjectionToken lets us pass the correlationId into the DI container early.
 */
export const BOOTSTRAP_CORRELATION_ID = new InjectionToken<string>(
  'BOOTSTRAP_CORRELATION_ID',
);

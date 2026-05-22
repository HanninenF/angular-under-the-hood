# Bootstrap and Root Contract Test Plan

## Summary

- This repo uses a separate contract for app bootstrap, root lifecycle, timeline behavior, and the shared event bus.
- The goal is to prove what the app actually emits and renders when it boots and when the main shell interacts with the event stream.
- This contract is independent from the lifecycle-card contract and covers the broader app-level behaviors.

## Contract

- App bootstrap should emit the bootstrap completion event with the shared bootstrap correlation id.
- `AppModule` should emit its bootstrap event when constructed.
- `AppComponent` should emit its root lifecycle hooks in order:
  - `constructor`
  - `ngOnInit`
  - `ngAfterViewInit`
  - `ngOnDestroy`
- `TimelineComponent` should be able to clear the stream and reset its selected state.
- `EventBusService` should append events in order and clear them when requested.

## Current Scenarios

- Bootstrap emits a completion event after the module finishes bootstrapping.
- `AppModule` creates a bootstrap event tied to the shared bootstrap correlation id.
- `AppComponent` behaves like a root component with a stable lifecycle during the app session.
- `TimelineComponent` clears the event stream without leaving stale selected state behind.

## Ticket Rule

- The scenarios in this plan cover the current bootstrap/root/timeline tickets.
- If a ticket adds a new bootstrap event, root lifecycle event, timeline behavior, or event-bus behavior, that ticket must also update `client/src/app/testing/bootstrap-root-contract.spec.ts`.
- New bootstrap/root/timeline behavior is not considered tested until it is explicitly added to the spec.

## How to Use This Plan

- Read this plan before starting any bootstrap/root/timeline/event-bus ticket.
- Keep `client/src/app/testing/bootstrap-root-contract.spec.ts` aligned with this plan so the spec remains the canonical truth for these app-level behaviors.

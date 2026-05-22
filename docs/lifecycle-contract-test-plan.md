# Lifecycle Contract Test Plan

## Summary

- This repo uses the lifecycle test as the source of truth for component lifecycle behavior.
- The goal is to prove what Angular actually does when a component is created, initialized, rendered, and destroyed.
- DOM presence is a secondary check; emitted lifecycle events are the contract.

## Contract

- Use a reusable host that toggles child components with `@if`.
- Verify lifecycle events in order:
  - `constructor`
  - `ngOnInit`
  - `ngAfterViewInit`
  - `ngOnDestroy`
- Flush microtasks before asserting because the event stream updates asynchronously.
- Assert that each component instance keeps one stable correlation id for its full lifecycle.
- Assert that a destroyed component is removed from the DOM, but do not use the DOM as the primary source of truth.

## Current Scenarios

- Standalone lifecycle cards should mount, render, and destroy cleanly.
- `SettingsComponent` should host separate child component instances for the profile and preferences cards.
- Switching tabs inside `SettingsComponent` should destroy the current child and create the next one.
- If the runtime behavior and this contract disagree, the runtime implementation is wrong unless the contract itself is intentionally being changed.
- Bootstrap, root lifecycle, timeline, and event-bus behavior live in `docs/bootstrap-root-contract-test-plan.md` and `client/src/app/testing/bootstrap-root-contract.spec.ts`.

## Ticket Rule

- The scenarios in this plan cover the lifecycle tickets that already exist.
- If a ticket adds a new lifecycle component, card, or lifecycle event, that ticket must also update `client/src/app/testing/lifecycle-contract.spec.ts` so the new behavior is covered by the contract.
- New lifecycle behavior is not considered tested until it is explicitly added to the spec.

## How to Use This Plan

- Read this plan before starting any lifecycle-related ticket.
- Use it to decide the expected event sequence before touching code.
- Keep `client/src/app/testing/lifecycle-contract.spec.ts` aligned with this plan so the spec remains the canonical truth for lifecycle behavior.

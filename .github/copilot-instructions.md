When reviewing pull requests:

- Focus on architectural correctness and long-term maintainability
- Do not comment on formatting handled by Prettier
- Flag nested ternaries and overly complex conditionals
- Prefer explicit, readable code over clever solutions
- Avoid abbreviated variable names in all code (functions, methods, loops, types, interfaces). Use meaningful, descriptive names instead
- For lifecycle-related work, read `docs/lifecycle-contract-test-plan.md` first and treat the lifecycle spec as the source of truth.
- If lifecycle work adds a new component, card, or lifecycle event, update `client/src/app/testing/lifecycle-contract.spec.ts` in the same ticket so the new behavior is explicitly covered.
- For bootstrap, root, timeline, or event-bus work, read `docs/bootstrap-root-contract-test-plan.md` first and treat the bootstrap/root spec as the source of truth.
- If bootstrap, root, timeline, or event-bus work adds new behavior, update `client/src/app/testing/bootstrap-root-contract.spec.ts` in the same ticket so the new behavior is explicitly covered.
- For ticket work, `kör ticket #<number>` always means proposal-only: update the docs, provide copyable code, and do not edit source files unless the user explicitly says `implementera` or otherwise clearly asks for file changes.
- If the user asks for implementation, then and only then may you edit source files. If the request is ambiguous, default to proposal-only behavior.

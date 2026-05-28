# Angular under the hood

This project is built to show what happens inside Angular while the app is running. It collects runtime events from bootstrap and component lifecycles, sends them through an `EventBus`, and shows them in a timeline. There is also a simple `Settings` view with demo components so you can see when components are created and destroyed.

In short: this app is a small demo for understanding Angular lifecycle, event flow, and what happens in the UI when different parts of the app mount and unmount.

## Run locally

Go into the `client` folder first:

```bash
cd client
```

Install dependencies if you have not already:

```bash
npm install
```

Start the app:

```bash
npm start
```

Then open:

```text
http://localhost:4200/
```

## Tests

Run unit tests:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run e2e
```

For E2E tests, the app needs to be running on `http://localhost:4200/`.

## Other useful commands

Build the project:

```bash
npm run build
```

Run type checking:

```bash
npm run typecheck
```

Run lint:

```bash
npm run lint
```

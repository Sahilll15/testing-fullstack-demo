# Campus Cart: a testing demo

A small campus shopping cart built with React and Express, with prices in rupees and 18% GST. It exists to show the different kinds of tests in one full-stack app.

![Campus Cart](docs/cart.png)

## Run it

```bash
nvm use            # Node 22
npm install
npx playwright install chromium
npm run dev        # React on http://localhost:5173, API on http://localhost:3000
```

## The tests

| Layer | What it checks | Tool | Command |
|---|---|---|---|
| Server unit tests | Pricing rules: subtotal, discount codes (FEST10, FLAT50), GST | Vitest | `npm run test:server` |
| Server API tests | The real Express app and pricing working together | Vitest + Supertest | `npm run test:server` |
| React unit tests | Components and the whole app, with the network faked | Vitest + Testing Library + MSW | `npm run test:client` |
| Contract tests | The React app writes down what it needs from the API, then the real API is checked against it | Pact | `npm run test:contract` |
| API automation | The running server over real HTTP | Playwright | `npm run test:e2e:api` |
| UI automation | Real user flows in a real browser | Playwright | `npm run test:e2e:ui` |

Run everything with `npm test`. Playwright builds the React app and starts the server for you.

`npm install` also turns on a git pre-push hook (`.githooks/pre-push`) that runs the unit tests and cancels the push if any fail. Skip it with `git push --no-verify`.

## Where things live

```
server/src        Express app, pricing rules, in-memory store
server/tests      unit/ and api/ tests
client/src        React app
client/tests      component tests and MSW mocks
contract          Pact consumer and provider tests, and the saved contract in contract/pacts/
e2e/api           Playwright API tests
e2e/ui            Playwright browser tests
```

## Things worth showing in a talk

- **See a test fail.** Change `GST_RATE` in `server/src/pricing.js` from `0.18` to `0.28` and run `npm test`. Server tests and browser tests go red. The React tests stay green, because MSW fakes the server. That is why you need tests at more than one layer.
- **Only the contract catches it.** In `server/src/app.js`, rename the cart item field `name` to `title`. All unit and React tests stay green, but `npm run test:contract` fails with `$.items[0] -> Actual map is missing the following keys: name`.
- **Seeded test data.** The Playwright API and UI tests create their own products in `beforeEach` through a key-protected admin API (`e2e/support/seed.js`) and delete them in `afterEach`, so every test starts and ends clean.
- **Two users at once.** `e2e/ui/checkout.spec.js` opens two browsers as two shoppers and checks their carts stay separate.
- **No shared state.** Every API and browser test gets its own cart, so tests can run in parallel in any order.
- **Evidence on failure.** Playwright keeps a trace, a screenshot and a video for failed tests. Open them with `npx playwright show-report`.

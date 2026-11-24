# CLAUDE.md

Standing context for Claude Code in this repository. **What to build** currently lives in [checkout spec](./specs/checkout.spec.md) (forward contract); this file covers **how the repo works** and **how we work together**.

## Working agreement

- **SPEC is the contract.** When it's ambiguous or needs a real design decision, surface it with concrete options (trade-offs + a recommendation) and a short, level-appropriate rationale: assuming solid language/framework fundamentals; teach system-design, distributed-systems, and infra concepts. Propose and explain; let Alex choose. Don't assume understanding on HLD/LLD concepts (verify/assess first), and never decide silently.
- **Division of labor — Alex writes what he's here to learn; accelerate the mechanical.**
    - *Alex writes:* domain/business logic, state machines, auth / sessions / cookies / headers, and any non-trivial or non-repetitive wiring — anything where learning by writing it IS the point.
    - *Draft, Alex reviews and owns:* boilerplate mirroring an existing pattern, DTO/type scaffolds, test scaffolding (`describe`/`it` skeletons, fixtures, harness wiring), mechanical refactors.
    - *Test for who owns a task:* would writing this teach Alex something he wants, or is it repetition of a pattern he's already shown? Learning → Alex. Mechanical → Draft, Alex reviews.
    - *Pace valve:* on a bulky but mostly-mechanical task, scaffold the repetitive parts and leave the meaningful logic to Alex, clearly marked — so he moves fast without skipping what he's building to learn.
- **You still:** surface the decisions due at each SPEC step with options + a recommendation; amend the SPEC when reality diverges; keep README and this file current; run `pnpm typecheck` and `pnpm test` after backend changes and report anything red you didn't cause.
- **Owner (Alex) decides and runs every git operation.** Never commit/push/branch/merge; leave changes uncommitted and summarize. Commit/branch suggestions are welcome.
- **Things the owner should author or decide** (interview-facing prose, first-person README narrative, product calls): don't refuse and don't ghost-write silently. Mark the spot in the document with `TODO(Alex)` (an HTML comment in README so it doesn't render) plus a one-paragraph recap of what was discussed in the thread, so it can be written on the spot.

## Commands

Two separate processes run concurrently:

```bash
pnpm dev-client     # Next.js frontend, http://localhost:3000 (port pinned with -p 3000)
pnpm dev-server     # Express backend, http://localhost:5000 (tsx watch)
```

```bash
pnpm build          # Production build (Next.js only)
pnpm lint           # ESLint
pnpm typecheck      # Type-check backend (tsc -p backend/tsconfig.json, no emit)
pnpm test           # All tests (Jest + ESM)
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

Run a single test file:
```bash
NODE_OPTIONS=--experimental-vm-modules pnpm exec jest backend/features/products/product.service.test.ts
```

CI (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile`, `test`, `typecheck`, `lint`, `build`.

## Architecture

### Two-process setup
Frontend (Next.js 16, port 3000) and backend (Express 5, port 5000) are independent processes with a one-way dependency: the frontend consumes the backend's API. The frontend reads the API base URL from `process.env.NEXT_PUBLIC_API_URL` (**required**, there is no fallback in the code; set it in `.env.local`). `NEXT_PUBLIC_*` values are inlined at compile time, so **restart `next dev` after editing `.env.local`**.

Both scripts that start Next (`dev-client`, `start`) pin `-p 3000`: Next honors a shell-level `PORT`, and VS Code's Python extension (`python.terminal.useEnvFile`) once injected `.env`'s `PORT=5000` into integrated terminals, which made Next bind to the backend's port.

### Frontend (`src/`)
- **`app/`**: App Router pages. `layout.tsx` does NOT include `<Navbar />`; each page imports and renders it.
- **`components/shop/`**: `ProductCard`, `CartItem`, `DemoDisclaimerModal`.
- **`stores/cartStore.js`**: Zustand store with `persist` (localStorage key `cart-storage`). `getItemCount` and `getOrderTotal` are **functions** on the store; call them (`state.getItemCount()`). It is untyped JS, which currently breaks `pnpm build` (see Known issues).
- Prices arrive as `priceCents` (integer) and are converted to a dollar string only when rendering.

### Backend (`backend/`)
TypeScript, ESM, run directly with `tsx` (no build step), organized **by feature**. File names are dot-separated: `<feature>.<concern>.ts`.

```
server.ts                       Express 5 entry. CORS allows only http://localhost:3000. errorHandler is mounted LAST.
config/env.config.ts            zod-validated env (MONGO_URI required, PORT default 5000). Calls dotenv itself so it stays
                                correct regardless of import order. Fails at boot on a bad env; no try/catch on purpose.
config/db.config.ts             connectDB(); logs and process.exit(1) on failure.
shared/errors/error.types.ts    CustomError (abstract) + NotFoundError (404) + ValidationError (400); err.respondWith(res).
shared/errors/error.handler.ts  errorHandler: CustomError -> ZodError -> mongoose ValidationError -> generic 500 (logged).
shared/http/http.response.ts    ApiResponse<T> discriminated union.
shared/testing/mongo.harness.ts Test-only: real replica set (mongodb-memory-server) for integration tests. Never imported by app code.
features/products/              model, schema (zod DTOs), service, controller, routes, stock helper, constants, 4 test files.
features/orders/                order.model.ts only: no service, controller or routes yet.
```

**Layering: routes -> controller -> service -> model.**
- **Controller** handles HTTP shape only: `mongoose.Types.ObjectId.isValid(id)` (throw `ValidationError`), `schema.parse(req.body)`, call exactly one service function, format the `ApiResponse`. No Mongoose, no `NotFoundError`.
- **Service** owns every Mongoose call and throws `NotFoundError` itself, so its functions return non-nullable values. It has no HTTP knowledge. Parameter types come from the schemas (`z.infer<typeof createProductSchema>`), not from `IProduct`.
- Validate the route param **before** parsing the body.

**Errors.** Throw; never format an error response in a handler. Express 5 forwards rejected promises to `next(err)` natively, so there is no async wrapper and no try/catch in handlers. Only `errorHandler` writes error responses.

**Response envelope** (checkout spec decision 5). Type each handler's `res` as `Response<ApiResponse<T>>` so the compiler checks every `res.json(...)`.
```
success: { success: true,  data: T, timestamp }
error:   { success: false, error: [{ field?, code, message }], timestamp }   // `field` is a dotted path, omitted when not field-scoped
```

**Validation split.** zod owns shape, type and business thresholds at the request boundary. Mongoose keeps only structural constraints (`required`, `unique`, indexes). System-managed fields (`depletedAt`, timestamps) are never in the DTOs. The update DTO is built from shared field constants *without* `.default()` and then `.partial().refine(non-empty)`, because `.partial()` over a defaulted field would silently backfill the default into every PATCH.

**Money.** Integer cents everywhere (`priceCents`, `unitPriceCents`, `subtotalCents`, `totalCents`); dollars exist only at render time.

**Stock.** Out-of-stock heals lazily: `restockDepletedProducts(now)` (`product.stock.ts`) is called by the service before product reads. `DEFAULT_STOCK` (127), `RESTOCK_DELAY_MS` (25 000) and `MAX_STOCK` (255, the ceiling for admin-set stock and for restores) live in `products.constants.ts`. `depletedAt` is set only by the future order reservation, never by an admin PATCH.

**Mongoose gotcha.** `required: true` is inert next to a `default` (the default is applied first). Only give a field a default when that default is always a correct value.

### Styling
Tailwind CSS (primary) + PrimeReact components + PrimeFlex. Dark mode uses `dark:` Tailwind variants.

## Testing

- ESM throughout (`"type": "module"`); Jest uses the `ts-jest` ESM preset. `testMatch` covers `.test.ts`/`.test.tsx` only. ts-jest prints deprecation warnings about `globals`/`isolatedModules`; that noise is harmless.
- Mock with `jest.unstable_mockModule()`, then **dynamically `await import()`** the code under test *after* the mocks are declared.
- Four layers for products: `product.test.ts` (HTTP through supertest, model mocked, real controller/service/stock/error handler), `product.service.test.ts` (service in isolation, `./product.stock.js` mocked), `product.stock.test.ts` (restock helper with an injected clock, model mocked), `product.stock.int.test.ts` (the same helper and the service read paths against a real database).
- `Product` is used as both a constructor and a static-method holder; mock it with a function that returns an object (`Object.assign(jest.fn(makeDocument), { find, ... })`). `jest.resetAllMocks()` also wipes `jest.fn(impl)` implementations, so re-install constructor mocks in `beforeEach`.
- **Mocks cannot prove database behavior** (atomic decrements, transactions, TTL indexes, `$lte`/`null` semantics). Anything that depends on those is an **integration test**, named `*.int.test.ts`, running on a real in-process single-node replica set (`mongodb-memory-server`, MongoDB 8.2) through `backend/shared/testing/mongo.harness.ts`: `beforeAll(startMongo, STARTUP_TIMEOUT_MS)`, `afterAll(stopMongo, ...)`, `beforeEach(clearDatabase)`. Each test file gets its own isolated instance; `clearDatabase` empties collections but keeps indexes. Use the real models there, no mocks. Reference: `product.stock.int.test.ts` and `mongo.harness.int.test.ts` (transactions commit/roll back).
- The `mongod` binary (~120 MB) is downloaded by `mongodb-memory-server`'s postinstall (allowed in `pnpm-workspace.yaml` `allowBuilds`) into `node_modules/.cache/mongodb-memory-server/`. `pnpm install` therefore needs network the first time, and CI downloads it each run.
- Verify a new test can fail: temporarily break the code it guards and confirm it goes red (done for the lazy-restock gate).
- Mongoose gotcha for transactions: with a `session`, `Model.create([...], { session })` takes an **array**, and several documents additionally need `ordered: true`.
- Frontend tests are scaffolded (`@testing-library/react`) but there are none, and `jest.config.js` is not set up for a DOM (`testEnvironment: 'node'`, no `jest-environment-jsdom`).

## Environment

`.env` at the project root (loaded by `env.config.ts`): `MONGO_URI` (required; boot fails immediately without it) and `PORT` (default 5000). It also holds `STRIPE_SECRET_KEY`, `STRIPE_PUB_KEY`, `STRIPE_WEBHOOK_SECRET` and `GITHUB_PAT`, which no code reads or validates yet; add the Stripe keys to the zod schema when the Stripe task lands, and rename `STRIPE_PUB_KEY` with the `NEXT_PUBLIC_` prefix (checkout spec §3).

`.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000` (frontend).

The backend's `dotenv.config()` reads only `.env`; Next reads `.env.local` and `.env`. A real shell environment variable always beats either file.

## Known issues (verified 2026-11-23)

Backend `typecheck` and `test` are green. CI is still red on pre-existing frontend problems (details in checkout spec §9): `pnpm lint` crashes inside ESLint 10 on any plain `.js` file and also reports 3 real `react-hooks` errors in `src/app/shop/` (a synchronous `setState` inside an effect in `page.tsx`, and fetch functions used inside effects before their declaration in `page.tsx` and `[id]/page.tsx`); `pnpm build` fails with TS7006 in `src/app/shop/cart/page.tsx` because `cartStore.js` is untyped. `interface Product` is declared three times in the frontend (`shop/page.tsx`, `[id]/page.tsx`, `ProductCard.tsx`) and shares nothing with the backend; `next.config.mjs` is empty (no `images.remotePatterns`).

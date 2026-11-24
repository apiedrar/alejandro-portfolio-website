# Alex's Portfolio Website
## Project Description
This repository is a production portfolio site plus an in-progress Sandbox (Stripe Test Mode) E-commerce Backend, sharing the same Next.js codebase. The deployed portfolio is the public-facing hub, while the e-commerce work takes place on the `dev-sandbox-e-commerce` branch as intentional practice ground for Spec-Driven Development, Payment-Flow Engineering, and Backend Architecture.

### ROI Calculator
Production-deployed investment scenarios calculator built into the portfolio. Users input: an initial deposit, recurring contributions (with frequency radio buttons: annual, monthly, weekly, or daily), investment term (1-65 years via slider), and average annual return percentage. The calculator computes compound growth over the term and renders a year-by-year stacked bar chart showing return (top) and investment (bottom) from the current year through the end of the term.

Inputs are bounded, validated, and automatically formatted:
- Initial Deposit: US $10 through 10,000,000
- Contributions: US $1 through 100,000
- Term: 1 through 65 years
- Average Annual Return: 1 through 130%

Live at [alejandropiedra.com](https://www.alejandropiedra.com)

### Sandbox E-commerce
An in-progress full-stack e-commerce demo built on the same Next.js codebase, with a Node.js + Express backend and MongoDB persistence. This Project serves practice purposes for three main aspects: **Spec-Driven Development** (writing structured specs before implementation), **Payment-Flow Engineering** (idempotent processing, webhook handling, retry logic via Stripe Test API), and **Backend Architecture** (layered structure with routes, controllers, services, models, and tests). The contract the work is built against is [checkout.spec.md](./specs/checkout.spec.md).
**Currently working**:
- Product Catalog: model, zod-validated DTOs, service layer, thin controllers, routes, lazy out-of-stock restock, and unit + HTTP-level backend tests
- Centralized error handling with a typed `ApiResponse<T>` envelope
- Environment validated with zod at boot (a bad config fails immediately, not at the first request)
- Cart with Zustand state management and `localStorage` persistence
- Product detail pages
- Demo disclaimer modal

**Deliberate WIP**:
- Orders: `order.model.ts` is done (integer-cent amounts, hashed retrieval token, TTL retention for unpaid orders); the order service and routes, payments, and webhooks are next, in the order given by [checkout.spec.md](./specs/checkout.spec.md) §9
- Frontend tests scaffolded with `@testing-library/react`, implementation pending
- `Navbar.tsx` currently imported per-page; planned move to `layout.tsx`
- CI: `lint` and `build` are red on pre-existing frontend issues (see Areas For Improvement); backend `typecheck` and `test` are green

Backend will merge to `main` once order routes are wired up and end-to-end checkout works.

## The 'Why?' Answered
Most full-stack roles require an engineer who can move across the stack and reason about system design, not just describe it. This project exists to show instead of just tell. My resume lists TypeScript and Payment-Systems experience; this repo is where these materialize: a backend I architected, payment flows wired to the Stripe Test API, and every architectural decision documented and owned, including the lines Claude Code assisted with (test scaffolding, boilerplate), which are mine to defend.

Given this is a sandbox by design, physical inventory or shipping logistics aren't needed to showcase the engineering that matters, and a self-contained sandbox gives me total control over the surface, meaning I can build the exact patterns worth showing without a real product's incidental complexity in the way: idempotent payment processing, webhook handling, retry logic, a cleanly layered backend. Full ownership and accountability for every line and every decision is deliberate. And the catalog is the tell! You've seen plenty of e-commerce demos, but this one will be built around DSA primitives (abstract data-structure "products") alongside two fictional-brand categories. The domain is a wink, the underlying engineering isn't.

The deployed ROI Calculator shows I ship to production; this sandbox shows the engineering depth underneath.

## Design Decisions
### Architecture

- **Monorepo for portfolio + e-commerce**: My portfolio site functions as a hub linking to my most relevant work. Keeping the e-commerce sandbox on a branch of the same Next.js codebase lets me reuse the design system, routing, and component patterns rather than maintaining two separate projects.
- **Two-process local development**: The frontend (`:3000`) and backend (`:5000`) run as independent processes, each independently deployable, with a one-directional dependency: the frontend consumes the backend's API contract, not the other way around. In `dev` they communicate cross-origin with CORS configured on the backend, deliberately mirroring a production topology where the API is a separately deployed service. A single-origin setup via Next.js `rewrites()` is the alternative, but cross-origin was chosen to keep the dev environment faithful to how the services will be deployed.
- **Express + Mongoose Backend**: The e-commerce sandbox exists in part to showcase MERN stack engineering. Using `Next.js API routes` would have collapsed the backend into the frontend part of the project and undermined that purpose. Keeping Express as a separate service also makes the backend independently  deployable and testable, which matters for the payment-flow patterns this project is planned to implement.
- **Feature-sliced modular monolith**: The backend is a feature-sliced modular monolith. The frontend/backend split is a tier boundary, and a single data store enables the order write path to use real multi-document ACID transactions instead of compensating transactions across distinct services and data stores (saga pattern) since at this scale distributed-transaction complexity would be cost with no benefit. The feature boundaries are where a later decomposition would start if load and/or traffic eventually called for a microservice architecture.
- **Layered, feature-sliced backend**: Each feature owns its model, zod schemas, service, controller, routes and tests in one folder. Controllers handle HTTP only (param, body and DTO validation, response formatting), while services own persistence and throw domain errors, so a service function either returns a value or throws, never `null`.
- **Centralized error handling and a typed envelope**: Express 5 forwards rejected promises natively, which is why there is no async wrapper (verified in `router@2.2.0/lib/layer.js`) and no need for try/catch in handlers. Every error leaves through one middleware in the same `{ success: false, error: [{ field?, code, message }] }` shape, an envelope that I deliberately decided to amend from a flat message for consistency with the per-field shape of `zod` issues.
- **Money is integer cents everywhere (in the backend)**: All money has been defined as integer cents for consistency because floats cannot represent currency exactly, Stripe takes minor units, and `product.price` feeds the order total; so I deemed the price shown to the user (in the frontend) as the only place where a conversion boundary makes sense.
- **zod + Mongoose team-up validation**: `zod` owns shape, types, and threshold validation while Mongoose owns structural constraints. A clearer way to illustrate this is that duplicating a threshold in both schemas risks silent drift in the future, while Mongoose owning `required` and `unique` constraints works as the persistence-boundary safety net for code paths that never pass through HTTP DTOs.
- **Stock simulation and lazy-healing**: Whenever a product's stock reaches `0` or an order reservation exceeds the existing stock, an automatic lazy heal of 25 seconds steps in on read via one conditional write instead of a timer so it survives server restarts and can be tested with an injected clock.
### Stack & Tooling
- **Next.js App Router over Pages Router**: App Router is the modern convention for Next.js and provides better support for server components, layouts, and parallel routes; thus being the most efficient option to work with on projects beyond static web pages.
- **Zustand - State Management**: Zustand fits the scope: minimal setup, no Provider Tree, persistence to `localStorage` via the `persist` middleware out of the box. Redux would add overhead disproportionate to the cart's complexity, and Context API tends to cause unnecessary re-renders when state changes frequently. For a sandbox demonstrating MERN stack proficiency, Zustand keeps the focus on backend and payment-flow engineering rather than on state-management ceremony.
- **MongoDB single datastore rationale**: Document storage fits the catalog naturally: products are polymorphic and carry category-specific specs (storage, color, RAM) that map cleanly to flexible  schemas, and orders will use MongoDB's Multi-Document ACID Transactions. I considered a polyglot split: MongoDB for the catalog, a relational database like PostgreSQL for orders and payments where referential integrity and constraints are enforced at the storage layer rather than in application code. For a production payments system that would make the most sense, but for a sandbox scope it adds operational overhead that would ultimately defeat the purpose. Deciding on MongoDB as the sole datastore here is a deliberate scope decision, not a default.
- **TypeScript end-to-end**: Backend is entirely TypeScript, while the frontend has exactly one file left for conversion. The next phase is typing the cart store and then deriving frontend types from backend Zod schemas via `z.infer` so one definition serves as a single source of truth for domain-model validation (`Product` and `Order` for now) shared across `client` and `server`, enforcing the API contract at compile time on both ends.
- **ESM throughout + Jest**: ESM is the current standard for Node.js and the module system I've used most professionally. The project uses `"type": "module"` in `package.json` and ESM-compatible patterns throughout, including `jest.unstable_mockModule()` for test mocking. That being said: Jest is setup with the `ts-jest` ESM Preset. The test file extension is `.test.ts` per `testMatch` configuration. The ESM mocking pattern requires imports to come after mock declarations, a known 'gotcha' properly documented in `CLAUDE.md` for anyone handling this codebase. Working with ESM matches how I build production Node.js services.
- **Zod over Joi and Yup**: This is a full-stack TypeScript project I'm building from scratch, so one schema serving as the single source of truth for both runtime validation and static types makes perfect sense. Zod infers the type from the schema (`z.infer`), so the validator and the type can't drift. In comparison, Joi is JS-first with no real native inference, and Yup's is retrofitted and weaker. With either I'd maintain the type separately from the validator, the exact drift I've decided to avoid elsewhere. The axes where Yup and Joi historically win (async validation maturity and bundle size) are frontend and form concerns, unrelated to synchronous backend DTO validation.
### Domain-specific choices
- **Stripe Test API**: This is a demonstrative purpose sandbox project, not a real payment system. Stripe's Test API provides realistic payment flow behavior (success, failure, refunds, webhooks) without handling real funds or PCI compliance concerns. Production migration would imply switching API keys and adding production-grade error handling, monitoring, and reconciliation processes.
- **Lazy out-of-stock restock**: A product whose stock hits zero heals back to the default (127) 25 seconds later, to simulate replenishment in a sandbox. It is done with one conditional write executed before product reads rather than with a timer, so it survives restarts, cannot double-apply under concurrency, and is testable with an injected clock.
- **PrimeReact + Tailwind + PrimeFlex (three styling layers)**: The original ROI Calculator was a challenge extended to me by my brother-in-law as a way to showcase the most important topics from my bootcamp with a real project. He deliberately chose the styling stack for me to practice handling real-world decisions made by someone else, exactly the kind of constraint engineers encounter on real teams. I kept the stack as I extended the portfolio because consistency with the original work matters more than swapping it for personal preference.
- **`Navbar.tsx` imported per-page (WIP)**: Currently `Navbar.tsx` lives in `src/app/` and is imported by each page individually rather than mounted once in `layout.tsx`. This is a by-product of how the project evolved, not a deliberate pattern. The planned refactor is to move `Navbar` into `components/` and render it once in `layout.tsx`. Tracked as a next step once the E-commerce backend is further along.

## API Endpoints

Base URL: `http://localhost:5000`

Only the **Products** routes are currently registered (`server.ts` → `app.use("/api/products", productRoutes)`). Every response is JSON and uses one of two envelopes:

```jsonc
// success
{ "success": true, "data": { /* payload */ }, "timestamp": "2026-10-20T18:00:00.000Z" }

// error: always an array, even for a single error
{ "success": false, "error": [{ "field": "priceCents", "code": "too_small", "message": "..." }], "timestamp": "..." }
```

`field` is a dotted path (`specifications.color`) and is omitted when an error isn't tied to a single input.

### Products — `/api/products`

| Method | Path   | Description                  | Body |
| ------ | ------ | ---------------------------- | ---- |
| GET    | `/`    | List all products            | —    |
| GET    | `/:id` | Get a single product by ID   | —    |
| POST   | `/`    | Create a product             | Product object |
| PATCH  | `/:id` | Update a product (partial)   | Partial product object |
| DELETE | `/:id` | Delete a product             | —    |

`GET /` and `GET /:id` first restock any product whose stock hit zero at least 25 seconds ago.

**Product request body** (POST/PATCH):

```json
{
  "name": "Binary Search Tree",
  "priceCents": 4999,
  "image": "/products/bst.png",
  "description": "Self-balancing, sold by the node.",
  "category": "Data Structures",
  "tags": ["tree", "logarithmic"],
  "brand": "Acme DSA",
  "stock": 127,
  "specifications": { "storage": "O(n)", "color": "Red-Black", "ram": "8GB" },
  "onSale": false,
  "isActive": true
}
```

Validated with zod at the request boundary:
- **Required on POST:** `name` (≤30 chars), `priceCents` (integer ≥ 99, i.e. $0.99; all prices are integer cents), `image`, `category` (one of `Data Structures`, `Audio Gear`, `Eyewear`), `tags`, `brand`, and `specifications` (keys: letters, `_` or `-`; values: anything).
- **Optional on POST:** `description`; `stock` (non-negative integer, defaults to `127`), `onSale` (defaults to `false`), `isActive` (defaults to `true`).
- **PATCH** accepts any subset of those fields but at least one, and never applies defaults to a partial update.
- `depletedAt` is system-managed and cannot be set through the API.

**Success responses**

```jsonc
// GET /            → 200
{ "success": true, "data": [ /* products */ ], "timestamp": "..." }

// GET /:id         → 200
{ "success": true, "data": { /* product */ }, "timestamp": "..." }

// POST /           → 201
{ "success": true, "data": { /* created product */ }, "timestamp": "..." }

// PATCH /:id       → 200
{ "success": true, "data": { /* updated product */ }, "timestamp": "..." }

// DELETE /:id      → 200 (returns the deleted product)
{ "success": true, "data": { /* deleted product */ }, "timestamp": "..." }
```

**Error responses**

```jsonc
// Malformed id → 400
{ "success": false, "error": [{ "field": "id", "code": "InvalidParam", "message": "Invalid id: <id> format is invalid. Verify and try again" }], "timestamp": "..." }

// Well-formed id that doesn't exist → 404
{ "success": false, "error": [{ "field": "id", "code": "NotFoundError", "message": "id not found: Product <id> does not exist" }], "timestamp": "..." }

// Invalid body → 400 (one item per failing field)
{ "success": false, "error": [{ "field": "name", "code": "too_big", "message": "..." }, { "field": "category", "code": "invalid_value", "message": "..." }], "timestamp": "..." }

// Empty PATCH body → 400 (no `field`: the rule is about the whole body)
{ "success": false, "error": [{ "code": "custom", "message": "At least one field must be provided" }], "timestamp": "..." }

// Unexpected failure → 500 (details are logged, never returned)
{ "success": false, "error": [{ "code": "ServerError", "message": "Something went wrong on our end" }], "timestamp": "..." }
```

### Orders — *Not yet wired up*

`backend/features/orders/order.model.ts` is done: `orderNumber`, `tokenHash` (only a SHA-256 digest of the retrieval token is stored, never the token), `customerName`, `items` (price snapshots in integer cents), `totalCents`, `currency`, `status`, `reservationExpiresAt`, plus a partial TTL index that expires unpaid orders. No order routes are registered in `server.ts` yet; the planned endpoints are specified in [checkout.spec.md](./specs/checkout.spec.md) §6 and will be documented here once they land.

## Setup Instructions

### Prerequisites

- **Node.js** 24.x (matches `engines` in `package.json`)
- **pnpm** (`npm install -g pnpm`, or enable via `corepack enable`)
- **MongoDB**: a running instance (local `mongod` or a MongoDB Atlas connection string). The upcoming order write path uses multi-document transactions, which need a replica set: Atlas provides one, a bare local `mongod` does not.

> Backend code and the e-commerce work live on the `dev-sandbox-e-commerce` branch.

### 1. Clone & install

```bash
git clone https://github.com/apiedrar/alejandro-portfolio-website.git
cd alejandro-portfolio-website
git checkout dev-sandbox-e-commerce
pnpm install
```

### 2. Configure the backend env

Create a `.env` file in the project root:

```bash
# .env
MONGO_URI=mongodb://localhost:27017/alejandro-portfolio-website   # or your Atlas URI
PORT=5000                                                         # optional, defaults to 5000
```

The backend validates its environment with zod at boot: a missing or invalid `MONGO_URI` stops the server immediately with a named error instead of failing later at the first request.

### 3. Configure the frontend env

Create `.env.local` so the frontend knows where the API lives:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The frontend has no fallback for this variable. Next.js inlines `NEXT_PUBLIC_*` values at compile time, so restart `pnpm dev-client` after changing it.

### 4. Run the dev environment

The frontend and backend are two independent processes — run each in its own terminal:

```bash
pnpm dev-client   # Next.js frontend → http://localhost:3000
pnpm dev-server   # Express backend  → http://localhost:5000
```

`dev-client` pins port 3000 explicitly: Next.js honors a shell-level `PORT`, so an exported `PORT=5000` would otherwise make it collide with the backend.

### 5. Build for production

```bash
pnpm build        # Next.js production build
pnpm start        # Serve the built frontend (port 3000)
```

> `pnpm build` builds the Next.js frontend only; the Express backend is deployed as a separate service.

## How To Run Tests

Tests run on Jest with the `ts-jest` ESM preset (`NODE_OPTIONS=--experimental-vm-modules`). Test files use the `.test.ts` extension and sit next to the code they cover.

```bash
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # Run with a coverage report
pnpm typecheck       # Type-check the backend (tsc, no emit)
```

Products are tested on four layers: `product.test.ts` (HTTP through supertest with the model mocked), `product.service.test.ts` (service in isolation), `product.stock.test.ts` (the lazy restock with an injected clock), and `product.stock.int.test.ts`, an integration test that runs the same logic against a real MongoDB replica set started in-process by `mongodb-memory-server`. Integration tests are named `*.int.test.ts` and need no database from you; the first `pnpm install` downloads a ~120 MB `mongod` binary for them.

Run a single test file (ESM-compatible invocation):

```bash
NODE_OPTIONS=--experimental-vm-modules pnpm exec jest backend/features/products/product.service.test.ts
```

> Unit tests mock the Mongoose model; database-level behavior is covered by the integration tests above (so far the lazy out-of-stock restock, plus a harness smoke test for transactions). The order flow's gates (atomic oversell protection, reservation release, idempotency) will be added there. Frontend tests are scaffolded with `@testing-library/react` but not yet implemented.

## Areas For Improvement
- `Navbar.tsx` imported per-page
- CI is red on the frontend half: `pnpm lint` crashes inside ESLint 10 on plain `.js` files and reports 3 `react-hooks` errors in `src/app/shop/`, and `pnpm build` fails type-checking because `src/stores/cartStore.js` is untyped (TS7006 in `cart/page.tsx`)
- No domain types shared between frontend and backend (`Product` is declared three times in the frontend)
- Integration tests exist only for the lazy restock so far; the oversell, reservation-release and idempotency gates in checkout.spec.md §10 arrive with the order flow

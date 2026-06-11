# Alex's Portfolio Website
## Project Description
This repository is a production portfolio site plus an in-progress Sandbox (Stripe Test Mode) E-commerce Backend, sharing the same Next.js codebase. The deployed portfolio is the public-facing hub, while the e-commerce work takes place on the `mern-makeover` branch as intentional practice ground for Spec-Driven Development, Payment-Flow Engineering, and Backend Architecture.

### ROI Calculator
Production-deployed investment scenarios calculator built into the portfolio. Users input: an initial deposit, recurring contributions (with frequency radio buttons: annual, monthly, weekly, or daily), investment term (1-65 years via slider), and average annual return percentage. The calculator computes compound growth over the term and renders a year-by-year stacked bar chart showing return (top) and investment (bottom) from the current year through the end of the term.

Inputs are bounded, validated, and automatically formatted:
- Initial Deposit: US $10 through 10,000,000
- Contributions: US $1 through 100,000
- Term: 1 through 65 years
- Average Annual Return: 1 through 130%

Live at [alejandropiedra.com](https://www.alejandropiedra.com)

### Sandbox E-commerce
An in-progress full-stack e-commerce demo built on the same Next.js codebase, with a Node.js + Express backend and MongoDB persistence. This Project serves practice purposes for three main aspects: **Spec-Driven Development** (writing structured specs before implementation), **Payment-Flow Engineering** (idempotent processing, webhook handling, retry logic via Stripe Test API), and **Backend Architecture** (layered structure with routes, controllers, services, models, and tests).
**Currently working**:
- Product Catalog (model, controller, routes, backend tests)
- Cart with Zustand state management and `localStorage` persistence
- Product detail pages
- Demo disclaimer modal

**Deliberate WIP**:
- `order.model.js` exists; order routes pending registration in `server.js`
- Frontend tests scaffolded with `@testing-library/react`, implementation pending
- `Navbar.tsx` currently imported per-page; planned move to `layout.tsx`

Backend will merge to `main` once order routes are wired up and end-to-end checkout works.

## The 'Why?' Answered
Most full-stack roles require an engineer who can move across the stack and reason about system design, not just describe it. This project exists to show instead of just tell. My resume lists TypeScript and Payment-Systems experience; this repo is where these materialize: a backend I architected, payment flows wired to the Stripe Test API, and every architectural decision documented and owned, including the lines Claude Code assisted with, which are mine to defend.

Given this is a sandbox by design, real inventory or shipping logistics aren't needed to showcase the engineering that matters, and a self-contained sandbox gives me total control over the surface, meaning I can build the exact patterns worth showing without a real product's incidental complexity in the way: idempotent payment processing, webhook handling, retry logic, a cleanly layered backend. Full ownership and accountability for every line and every decision is deliberate. And the catalog is the tell! You've seen plenty of e-commerce demos, but this one will be built around DSA primitives (abstract data-structure "products") alongside two fictional-brand categories. The domain is a wink, the underlying engineering isn't.

The deployed ROI Calculator shows I ship to production; this sandbox shows the engineering depth underneath.

## Design Decisions
### Architecture

- **Monorepo for portfolio + e-commerce**: My portfolio site functions as a hub linking to my most relevant work. Keeping the e-commerce sandbox on a branch of the same Next.js codebase lets me reuse the design system, routing, and component patterns rather than maintaining two separate projects.
- **Two-process local development**: The frontend (`:3000`) and backend (`:5000`) run as independent processes, each independently deployable, with a one-directional dependency: the frontend consumes the backend's API contract, not the other way around. In `dev` they communicate cross-origin with CORS configured on the backend, deliberately mirroring a production topology where the API is a separately deployed service. A single-origin setup via Next.js `rewrites()` is the alternative, but cross-origin was chosen to keep the dev environment faithful to how the services will be deployed.
- **Express + Mongoose Backend**: The e-commerce sandbox exists in part to showcase MERN stack engineering. Using `Next.js API routes` would have collapsed the backend into the frontend part of the project and undermined that purpose. Keeping Express as a separate service also makes the backend independently  deployable and testable, which matters for the payment-flow patterns this project is planned to implement.
### Stack & Tooling
- **Next.js App Router over Pages Router**: App Router is the modern convention for Next.js and provides better support for server components, layouts, and parallel routes; thus being the most efficient option to work with on projects beyond static web pages.
- **Zustand - State Management**: Zustand fits the scope: minimal setup, no Provider Tree, persistence to `localStorage` via the `persist` middleware out of the box. Redux would add overhead disproportionate to the cart's complexity, and Context API tends to cause unnecessary re-renders when state changes frequently. For a sandbox demonstrating MERN stack proficiency, Zustand keeps the focus on backend and payment-flow engineering rather than on state-management ceremony.
- **MongoDB single datastore rationale**: Document storage fits the catalog naturally: products are polymorphic and carry category-specific specs (storage, color, RAM) that map cleanly to flexible  schemas, and orders will use MongoDB's Multi-Document ACID Transactions. I considered a polyglot split: MongoDB for the catalog, a relational database like PostgreSQL for orders and payments where referential integrity and constraints are enforced at the storage layer rather than in application code. For a production payments system that would make the most sense, but for a sandbox scope it adds operational overhead that would ultimately defeat the purpose. Deciding on MongoDB as the sole datastore here is a deliberate scope decision, not a default.
- **TypeScript migration**: The frontend is already TypeScript, while the Express backend's migration is planned as a discrete reviewable change. The point here is a single source of truth for domain models (`Product` and `Order`) shared across `client` and `server`, so the API contract is enforced at compile time on both ends. Until that lands the backend remains ESM JavaScript (see Areas for Improvement).
- **ESM throughout + Jest**: ESM is the current standard for Node.js and the module system I've used most professionally. The project uses `"type": "module"` in `package.json` and ESM-compatible patterns throughout, including `jest.unstable_mockModule()` for test mocking. That being said: Jest is setup with the `ts-jest` ESM Preset. The test file extension is `.test.js` per `testMatch` configuration. The ESM mocking pattern requires imports to come after mock declarations, a known 'gotcha' properly documented in `CLAUDE.md` for anyone handling this codebase. Working with ESM matches how I build production Node.js services.
### Domain-specific choices
- **Stripe Test API**: This is a demonstrative purpose sandbox project, not a real payment system. Stripe's Test API provides realistic payment flow behavior (success, failure, refunds, webhooks) without handling real funds or PCI compliance concerns. Production migration would imply switching API keys and adding production-grade error handling, monitoring, and reconciliation processes.
- **PrimeReact + Tailwind + PrimeFlex (three styling layers)**: The original ROI Calculator was a challenge extended to me by my brother-in-law as a way to showcase the most important topics from my bootcamp with a real project. He deliberately chose the styling stack for me to practice handling real-world decisions made by someone else, exactly the kind of constraint engineers encounter on real teams. I kept the stack as I extended the portfolio because consistency with the original work matters more than swapping it for personal preference.
- **`Navbar.tsx` imported per-page (WIP)**: Currently `Navbar.tsx` lives in `src/app/` and is imported by each page individually rather than mounted once in `layout.tsx`. This is a by-product of how the project evolved, not a deliberate pattern. The planned refactor is to move `Navbar` into `components/` and render it once in `layout.tsx`. Tracked as a next step once the E-commerce backend is further along.

## API Endpoints

Base URL: `http://localhost:5000`

Only the **Products** routes are currently registered (`server.js` → `app.use("/api/products", productRoutes)`). All responses are JSON and follow a `{ success, data | message }` envelope.

### Products — `/api/products`

| Method | Path   | Description                  | Body |
| ------ | ------ | ---------------------------- | ---- |
| GET    | `/`    | List all products            | —    |
| GET    | `/:id` | Get a single product by ID   | —    |
| POST   | `/`    | Create a product             | Product object |
| PATCH  | `/:id` | Update a product (partial)   | Partial product object |
| DELETE | `/:id` | Delete a product             | —    |

**Product request body** (POST/PATCH):

```json
{
  "name": "Binary Search Tree",
  "price": 49.99,
  "image": "https://example.com/bst.png",
  "description": "Self-balancing, sold by the node.",
  "category": "Data Structures",
  "tags": ["tree", "logarithmic"],
  "brand": "Acme DSA",
  "stock": 42,
  "specifications": { "storage": "O(n)", "color": "Red-Black", "ram": "8GB" },
  "onSale": false,
  "isActive": true
}
```

Required: `name` (≤30 chars), `price` (≥0.99), `image`, `category`, `tags`, `brand`, and `specifications`. `stock`, `description`, `onSale`, `isActive` are optional (`onSale`/`isActive` default to `false`/`true` respectively).

**Success responses**

```jsonc
// GET /            → 200
{ "success": true, "data": [ /* products */ ] }

// GET /:id         → 200
{ "success": true, "data": { /* product */ } }

// POST /           → 201
{ "success": true, "data": { /* created product */ } }

// PATCH /:id       → 200
{ "success": true, "data": { /* updated product */ } }

// DELETE /:id      → 200
{ "success": true, "message": "Product <name> deleted" }
```

**Error responses**

```jsonc
// Invalid/unknown ID → 404
{ "success": false, "message": "Product not found, check the ID and try again" }

// Server/validation error → 500
{ "success": false, "message": "Server error" }
```

### Orders — *Not yet wired up*

`backend/models/order.model.js` exists (schema includes `orderNumber`, `items`, `totalAmount`, `status`, and Stripe session/payment-intent fields), but no order routes are registered in `server.js` yet. Endpoints will be documented here once the checkout flow lands.

## Setup Instructions

### Prerequisites

- **Node.js** 20.9+ (Next.js 16 requirement)
- **pnpm** (`npm install -g pnpm`, or enable via `corepack enable`)
- **MongoDB** — a running instance (local `mongod` or a MongoDB Atlas connection string)

> Backend code and the e-commerce work live on the `mern-makeover` branch.

### 1. Clone & install

```bash
git clone https://github.com/apiedrar/alejandro-portfolio-website.git
cd alejandro-portfolio-website
git checkout mern-makeover
pnpm install
```

### 2. Configure the backend env

Create a `.env` file in the project root:

```bash
# .env
MONGO_URI=mongodb://localhost:27017/alejandro-portfolio-website   # or your Atlas URI
PORT=5000
```

### 3. (Optional) Configure the frontend env

The frontend defaults to `http://localhost:3000`. To point it elsewhere, create `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Run the dev environment

The frontend and backend are two independent processes — run each in its own terminal:

```bash
pnpm dev-client   # Next.js frontend → http://localhost:3000
pnpm dev-server   # Express backend  → http://localhost:5000 (nodemon)
```

### 5. Build for production

```bash
pnpm build        # Next.js production build
pnpm start        # Serve the built frontend
```

> `pnpm build` builds the Next.js frontend only; the Express backend is deployed as a separate service.

## How To Run Tests

Tests run on Jest with the `ts-jest` ESM preset (`NODE_OPTIONS=--experimental-vm-modules`). Test files use the `.test.js` extension.

```bash
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # Run with a coverage report
```

Run a single test file (ESM-compatible invocation):

```bash
NODE_OPTIONS=--experimental-vm-modules jest backend/__tests__/product.controller.test.js
```

> Frontend tests are scaffolded with `@testing-library/react` but not yet implemented — planned after the order routes are completed.

## Areas For Improvement
- `Navbar.tsx` imported per-page
- Resctructure backend layers from 'group by file type' to 'group by feature'
- Migrate backend from ESM JavaScript to TypeScript
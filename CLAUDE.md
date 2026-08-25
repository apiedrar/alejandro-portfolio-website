# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project requires two separate processes running concurrently:

```bash
pnpm dev-client     # Next.js frontend on http://localhost:3000
pnpm dev-server     # Express backend on http://localhost:5000 (via tsx watch)
```

```bash
pnpm build          # Production build (Next.js only)
pnpm lint           # ESLint
pnpm typecheck      # Type-check backend (tsc -p backend/tsconfig.json, no emit)
pnpm test           # Run all tests (Jest + ESM)
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

Run a single test file:
```bash
NODE_OPTIONS=--experimental-vm-modules jest backend/features/products/product.test.ts
```

## Architecture

### Two-process setup
The frontend (Next.js 16, port 3000) and backend (Express 5, port 5000) run as independent processes. The frontend fetches from the backend using `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`. Set `NEXT_PUBLIC_API_URL` in `.env.local` for production.

### Frontend (`src/`)
- **`app/`** — Next.js App Router pages. `layout.tsx` does NOT include `<Navbar />`; each page imports and renders it directly.
- **`components/`** — Shared UI components (e.g. `ProductCard`, `CartItem`) organized under `shop/`.
- **`stores/cartStore.js`** — Zustand store with `persist` middleware (localStorage key: `cart-storage`). `getItemCount` and `getOrderTotal` are **functions** on the store, not computed values — access via `state.getItemCount()`.

### Backend (`backend/`)
TypeScript throughout (ESM, run directly via `tsx` — no build step), organized by feature rather than by layer.
- **`server.ts`** — Express 5 entry point. CORS allows `localhost:3000`. Reads `MONGO_URI` and `PORT` from `.env`.
- **`config/db.ts`** — `connectDB()`.
- **`features/products/`** — `product.model.ts` (requires `name` ≤30 chars, `price` ≥0.99, `image`, `category`, `tags`, `brand`, `specifications`; `stock` defaults to 99 and is optional), `product.controller.ts`, `product.routes.ts` (registered at `/api/products`), `product.test.ts`.
- **`features/orders/`** — `order.model.ts` exists but order routes are not yet wired up.

### Styling
Tailwind CSS (primary) + PrimeReact components + PrimeFlex. Dark mode uses `dark:` Tailwind variants.

## Testing

- All tests use **ESM** (`"type": "module"` in `package.json`). The Jest config uses `ts-jest` ESM preset.
- `testMatch` covers `.test.ts`/`.test.tsx` — test files must use the `.test.ts` extension, not `.test.js`.
- Backend tests use `jest.unstable_mockModule()` for ESM-compatible mocking. Imports that depend on mocked modules must come **after** the mock declarations (see `backend/features/products/product.test.ts`).
- Frontend tests scaffolded with `@testing-library/react` but not yet implemented. Planned after order route completion.

## Environment

`.env` (already exists at project root) must contain:
```
MONGO_URI=<mongodb connection string>
PORT=5000
```

For frontend env vars, use `.env.local` with the `NEXT_PUBLIC_` prefix.

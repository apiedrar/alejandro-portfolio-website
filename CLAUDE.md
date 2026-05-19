# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project requires two separate processes running concurrently:

```bash
pnpm dev-client     # Next.js frontend on http://localhost:3000
pnpm dev-server     # Express backend on http://localhost:9999 (via nodemon)
```

```bash
pnpm build          # Production build (Next.js only)
pnpm lint           # ESLint
pnpm test           # Run all tests (Jest + ESM)
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

Run a single test file:
```bash
NODE_OPTIONS=--experimental-vm-modules jest backend/__tests__/product.controller.test.js
```

## Architecture

### Two-process setup
The frontend (Next.js 16, port 3000) and backend (Express 5, port 9999) run as independent processes. The frontend fetches from the backend using `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999'`. Set `NEXT_PUBLIC_API_URL` in `.env.local` for production.

### Frontend (`src/`)
- **`app/`** — Next.js App Router pages. `layout.tsx` does NOT include `<Navbar />`; each page imports and renders it directly.
- **`components/`** — Shared UI components (e.g. `ProductCard`, `CartItem`) organized under `shop/`.
- **`stores/cartStore.js`** — Zustand store with `persist` middleware (localStorage key: `cart-storage`). `getItemCount` and `getOrderTotal` are **functions** on the store, not computed values — access via `state.getItemCount()`.

### Backend (`backend/`)
- **`server.js`** — Express 5 entry point. CORS allows `localhost:3000` and `localhost:3001`. Reads `MONGO_URI` and `PORT` from `.env`.
- **`models/`** — Mongoose schemas. `product.model.js` requires `name`, `price`, `image`, `category`, `brand`, `stock`, and `specifications` (storage, color, ram). `order.model.js` exists but order routes are not yet wired up.
- **`routes/`** — Only `product.route.js` is currently registered (`/api/products`).

### Styling
Tailwind CSS (primary) + PrimeReact components + PrimeFlex. Dark mode uses `dark:` Tailwind variants.

## Testing

- All tests use **ESM** (`"type": "module"` in `package.json`). The Jest config uses `ts-jest` ESM preset.
- `testMatch` only covers `**/*.test.js` — test files must use the `.test.js` extension, not `.test.ts`.
- Backend tests use `jest.unstable_mockModule()` for ESM-compatible mocking. Imports that depend on mocked modules must come **after** the mock declarations (see `backend/__tests__/product.controller.test.js`).
- Frontend tests scaffolded with `@testing-library/react` but not yet implemented. Planned after order route completion.

## Environment

`.env` (already exists at project root) must contain:
```
MONGO_URI=<mongodb connection string>
PORT=9999
```

For frontend env vars, use `.env.local` with the `NEXT_PUBLIC_` prefix.

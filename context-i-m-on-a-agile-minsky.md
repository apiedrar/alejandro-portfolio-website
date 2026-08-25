# Backend ESM JS → TypeScript Migration

## Context

The backend (`backend/`, Express 5 + Mongoose 8, ESM) is plain JavaScript while the frontend is already TypeScript. On the `ts-migration` branch we convert the **existing, implemented** backend files to TypeScript with **zero behavior changes**, so the whole project speaks one language and gains compile-time safety (typed Express handlers and Mongoose models). Layers are already reorganized by feature; service-layer files and any new/unwired features are out of scope.

This is a **strict, behavior-preserving** conversion: no refactors or "improvements" are applied during the migration. Improvement ideas are collected in a separate list at the bottom for later. The repo already ships most of the toolchain (TypeScript 6, ts-jest ESM preset, `@types/node`, `@types/jest`, `@types/supertest`); only a few config additions are needed, done as the first step before any file is converted.

Decisions confirmed with the user:
- **Run strategy:** `tsx` for both dev and prod (no build step / no `dist/`); `tsc` is type-check-only.
- **Express 5 handler returns:** split the 4 guard-clause `return res.json(...)` into `res.json(...); return;` (canonical Express+TS idiom, no casts).
- **`order.model.js`:** convert it now (it's a complete, existing model file).

## Scope

In scope (existing, implemented files):
- [backend/config/db.js](backend/config/db.js)
- [backend/features/products/product.model.js](backend/features/products/product.model.js)
- [backend/features/orders/order.model.js](backend/features/orders/order.model.js)
- [backend/features/products/product.controller.js](backend/features/products/product.controller.js)
- [backend/features/products/product.routes.js](backend/features/products/product.routes.js)
- [backend/features/products/product.test.js](backend/features/products/product.test.js)
- [backend/server.js](backend/server.js)

Out of scope: service-layer files, unwired/new features (beyond `order.model`), any frontend changes.

---

## Step 0 — Config / toolchain (first commit, before any file conversion)

Feasibility verified against the repo. Required changes:

**1. Add devDependencies** (then run `pnpm install` so `pnpm-lock.yaml` updates — CI uses `--frozen-lockfile`):
- `tsx` — run TS directly (NodeNext ESM, resolves `.js`→`.ts` specifiers).
- `@types/express` — must resolve to **v5** (matches `express@^5.2.1`).
- `@types/cors` — `cors` ships no types; `server.ts` uses `CorsOptions`.
- Already present and sufficient: `typescript@6`, `@types/node`, `@types/jest`, `@types/supertest`, `ts-jest`. Mongoose and dotenv ship their own types.

**2. New file `backend/tsconfig.json`** (ESM + strict, type-check only):
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,            // tsx runs the source; tsc only type-checks
    "types": ["node"]          // test imports @jest/globals + supertest as modules
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

**3. Edit root [tsconfig.json](tsconfig.json)** — add `"backend"` to `exclude` so the Next/frontend build and `pnpm build` ignore backend `.ts` (preserves today's behavior where backend is not in the frontend program; keeps `pnpm build` in CI green). ts-jest is unaffected (it uses `compilerOptions`, not `include`/`exclude`).

**4. Edit [jest.config.js](jest.config.js)** (only two lines):
- `testMatch` → `['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)']`
- `collectCoverageFrom`: `'backend/**/*.js'` → `'backend/**/*.ts'`
- Keep as-is (already correct): `ts-jest/presets/default-esm`, `extensionsToTreatAsEsm`, the `^.+\.tsx?$` transform, and the `'^(\\.{1,2}/.*)\\.js$': '$1'` mapper that strips `.js` so `.js` specifiers resolve to `.ts`.

**5. Add `package.json` script** in this commit:
- `"typecheck": "tsc -p backend/tsconfig.json"`
- (The `dev-server`/`start-server` script changes are deferred to the **server.ts** step so `dev-server` is never pointed at a non-existent `server.ts` mid-migration.)

**6. ESLint** — no change expected. `eslint.config.js` uses `eslint-config-next/core-web-vitals`, which bundles `@typescript-eslint` parser/plugin and lints `.ts`. Verify with `pnpm lint` after the first file; if backend-specific noise appears, add a targeted flat-config block for `backend/**/*.ts` (contingency only).

**Tests approach (confirmed):** convert the single test to `.test.ts` (assertions unchanged), driven by ts-jest — no mixing of `.test.js` with `.ts` sources. `testMatch` updated above.

**Step 0 verification:** `pnpm test` stays green (tests still `.test.js` importing `.js`, all unchanged) and `pnpm lint` green. `pnpm typecheck` becomes meaningful from the first `.ts` file (with zero `.ts` files tsc reports "no inputs"), so it is run from Step 1 onward.

---

## Conversion order (bottom-up / leaf-first)

Each `.ts` only imports already-converted `.ts` modules, so `tsc` stays green at every step and no `.ts`→`.js` import ever occurs. For each file: write the `.ts`, **delete the old `.js`** (never keep both — ambiguous resolution), run `pnpm typecheck` **and** `pnpm test`, then commit when green. Keep `.js` extensions in all relative import specifiers (NodeNext requirement).

1. **`config/db.ts`** — exports `connectDB`: `mongoose.connect(process.env.MONGO_URI)`, logs host, `process.exit(1)` on error. Type as `(): Promise<void>`. (Not in the test graph → test trivially green.)
2. **`features/products/product.model.ts`** — `productSchema` + `Product` model. Add `interface IProduct`, use `new Schema<IProduct>(...)` and `model<IProduct>(...)`. (Mocked in the test → test green.)
3. **`features/orders/order.model.ts`** — `orderSchema` + `Order` model. Add `interface IOrder` (+ `IOrderItem`); `status` as a string-literal union; `productId: mongoose.Types.ObjectId`. Leaf, unrelated to test graph.
4. **`features/products/product.controller.ts`** — 5 CRUD handlers. Type as `(req: Request, res: Response)`. Apply the guard-return split (4 spots) and the catch pattern (below).
5. **`features/products/product.routes.ts`** — `express.Router()` wiring the 5 handlers. Typed `Router`; handlers assign cleanly after the guard-return split.
6. **`features/products/product.test.ts`** — convert from `.test.js`; assertions unchanged; type the `jest.fn()` mocks (below).
7. **`server.ts`** — entry point. Type `app: Express`, `corsOptions: CorsOptions`. In this same commit, repoint scripts: `"dev-server": "tsx watch backend/server.ts"`, add `"start-server": "tsx backend/server.ts"`. (Optional: remove now-unused `nodemon` devDep — also updates the lockfile.)

What each file does is captured inline above; the controller’s handlers are the standard find/findById/create/findByIdAndUpdate/findByIdAndDelete returning `{ success, data | message }`.

---

## Behavior-preserving typing patterns (apply consistently)

- **Catch blocks** (strict makes `catch (e)` → `unknown`): use `(error as Error).message`. A cast to a concrete `Error` (not `any`), reproduces the exact JS log output. Used in `db.ts` and the controller catches.
- **`MONGO_URI`** (`process.env.MONGO_URI` is `string | undefined`): `mongoose.connect(process.env.MONGO_URI!)` — non-null assertion preserves the original code's assumption and runtime behavior (matches CLAUDE.md's required `.env`).
- **Express 5 guard returns** (chosen): `return res.status(404).json(...)` → `res.status(404).json(...); return;` at controller lines 18, 50, 66, 72. Behavior identical. (Success/catch paths already don't return a value, so they need no change.)
- **Mongoose Map**: `specifications` typed `Map<string, unknown>` with the schema's `{ type: Map, required: true }` left unchanged (no `of` added). Watch-point: if `Schema<IProduct>` rejects it, the fallback is a looser non-`any` field type — without altering the runtime schema.
- **`req.body`** is `any` under `@types/express`, so `const product = req.body` stays as-is (inferred, not an explicit `any`; lint-clean). Watch-point only if v5 types it `unknown`.
- **Test mocks** (ts-jest type-checks `.test.ts`): type the four `jest.fn()` so `mockResolvedValue`/`mockRejectedValue` are available, e.g. `const mockFind = jest.fn<() => Promise<unknown>>();`. This is a typing addition only — **assertions are unchanged**.

## Watch-points / risks

- **Mixed module graph at steps 4–5:** the still-`.js` test imports the newly-`.ts` controller/routes (model is mocked, so its real code never loads). Jest ESM links transformed + native modules fine; expected to pass. **Fallback** if a step can't go green alone: convert controller+routes+test (4–6) in one commit.
- **`@types/express` v5** return-type strictness is the reason for the guard-return split; already handled.

---

## Verification

- **Per file:** `pnpm typecheck` green **and** `pnpm test` green (assertions identical) → commit. (Step 0 commit verifies via `pnpm test` + `pnpm lint` only.)
- **After the last file:**
  - `pnpm lint` green (backend `.ts` linted by eslint-config-next).
  - `pnpm build` green (frontend; backend excluded from root tsconfig).
  - **Smoke test the server:** `pnpm dev-server` (now `tsx watch backend/server.ts`) boots, connects to MongoDB, and `curl http://localhost:5000/api/products` returns `{ success: true, data: [...] }`; `pnpm dev-client` unaffected.
- **CI parity** (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile` (lockfile committed in Step 0), `pnpm lint`, `pnpm build` — all green.

---

## Improvement ideas (OUT OF SCOPE — do not apply during conversion)

- Shared `ApiResponse<T>` type for `{ success, data?, message? }`.
- Centralize the repeated try/catch via an async-handler wrapper + Express error middleware.
- Validate env at startup (e.g. zod) instead of `MONGO_URI!`.
- Validate/type `req.body` with a DTO instead of relying on `any`.
- Replace `console.log`/`console.error` with a logger.
- Consider `InferSchemaType` to derive model types from the schema (DRY).
- `getProductById` returns 200 with `data: null` when not found (no 404) — possible bug; preserved for now.
- Move `tsx` to `dependencies` if prod deploys actually run it; optionally drop `nodemon`.
- Backend-specific (type-aware) ESLint config block.

---

## Execution notes / deviations (what actually shipped)

Status: **complete.** All 7 files converted bottom-up, one commit per file (8 commits total, `46bb002`→`0c86928`). `pnpm typecheck` green; `pnpm test` 2/2 green with assertions unchanged; backend lints clean; server boots via tsx, connects to MongoDB, and `GET /api/products` returns `200` with real data.

Deviations from the approved plan — all necessary, discovered during execution:

- **jest.config `testMatch`/`collectCoverageFrom` moved from Step 0 to the test-conversion commit (Step 6).** Flipping `testMatch` to `.ts` while the test was still `product.test.js` made Jest find *no* tests (a failure), so these edits had to land together with the `.js`→`.ts` rename to keep the suite green at every step.
- **ts-jest pointed at `backend/tsconfig.json`** (added `tsconfig: 'backend/tsconfig.json'` to the transform in `jest.config.js`, during Step 4). Once the root tsconfig excludes `backend`, ts-jest compiling the first real backend `.ts` hit `TS5011` (rootDir) using the root config; pointing it at the backend config resolves it.
- **`Request<{ id: string }>` on the three handlers that read `req.params.id`** (controller). In `@types/express` v5, `req.params` values are typed `string | string[]`, so a plain destructured `id` isn't a `string` for `ObjectId.isValid`/`findById`. Typing the route params (not casting) fixes it properly.
- **Added `@jest/globals` as a direct devDependency.** The test imports it (existing behavior); Jest virtualizes it at runtime, but under pnpm's strict node_modules it isn't linked at the root, so `tsc` couldn't resolve it (`TS2307`). Adding it as a direct dep makes the type resolution work.
- **Typed mocks widened to `jest.fn<(...args: unknown[]) => Promise<unknown>>()`** (test), rather than the `() => Promise<unknown>` shown in the plan — the mocks are called with arguments (`find({})`, etc.), and `toHaveBeenCalledWith({})` needs the signature to accept them. Assertions unchanged.
- **`esbuild` build script approved** in `pnpm-workspace.yaml` (`allowBuilds`). tsx depends on esbuild; pnpm flagged its ignored postinstall. Matches how the repo already handles `sharp`/`unrs-resolver`. (tsx runs even without it, via esbuild's optional platform binary — this just clears the warning.)
- **`nodemon` left in place** (now unused after the `dev-server` → `tsx watch` switch). Removing it is a trivial follow-up, deferred to keep the change focused.

Out of scope but worth flagging: **`pnpm lint` and `pnpm build` are red on pre-existing frontend issues**, not the backend. Verified identical failures at the pre-migration commit `1312ea8` (`src/app/shop/cart/page.tsx:23` — `sum` implicitly `any`, from the untyped JS cart store; plus 3 frontend ESLint errors under `src/app/shop/`). CI (`pnpm lint`/`pnpm build`) is therefore currently failing on the frontend and warrants a separate pass.

# SPEC: Guest Checkout — Orders & Payments

## Context
This spec covers **guest checkout** for the e-commerce sandbox: foundations, orders, payments, and inventory. It is an addition to the pre-existing Next.js home page and ROI calculator, built on the existing product catalog (`backend/features/products/`).

A visitor browses products, builds a cart, checks out through a Stripe **test-mode** payment, and later retrieves their order with an unguessable token. The deliverable demonstrates clean API design; SOLID, SoC, DRY and KISS; idempotent payment processing; webhook handling; retry logic; a layered backend routes → controllers → services → models, with tests per feature; centralized error handling; input and `env` validation; automated unit and integration testing with CI gates; and logging.

Accounts, email delivery, and admin tooling are **deliberately out of scope** and specified separately (§11). That is a scoping decision, not an omission: this spec is a verification gate, and a gate only means something if it is narrow enough to close. [Standing project context](./CLAUDE.md)

---

## 1. Outcomes (done = ?)
- A visitor can browse products, filter by category, price range and brand, and build a cart (add, modify, remove) with a maximum of **5 units per line item**, enforced server-side and surfaced in the UI.
- A visitor can submit checkout, complete a Stripe test payment, and receive a one-time retrieval token; presenting that token later returns their full order details in the UI.
- A failed or declined card produces a modal with a user-facing message and the required action (e.g. "Your card was declined for insufficient funds — try a different card"), derived from Stripe's `decline_code`.
- A duplicate form submission or a replayed webhook creates **no** second order and **no** second charge.
- Every completed purchase decrements inventory by the ordered quantity, atomically, so concurrent checkouts cannot oversell the last unit.
- A visitor attempting to buy an out-of-stock product gets a modal stating it is out of stock and retryable shortly; stock heals back to the default of 99 **25 seconds** after depletion.
- An abandoned or expired checkout releases its reserved stock automatically, without operator action.
- A late or out-of-order webhook never corrupts order state: every event either drives a defined transition or is recorded and ignored.

## 2. Scope
### In scope
- **Foundations**: error middleware + async wrapper, `ApiResponse<T>` envelope, zod `env` validation, zod body validation (DTOs), service layer
- **Orders**: create, retrieve-by-token, server-derived totals, state transitions, retention
- **Payments**: Stripe PaymentIntents + Elements test-mode flow, webhook handling, idempotency, retry
- **Inventory**: reservation, atomic decrement, expiry sweeper, lazy out-of-stock reset
- **CI gates**: repair the workflow so the above are actually enforced

### Out of scope
- **Authentication / user accounts** → own spec (§11). Guest-only here.
- **Email / confirmation delivery** → own spec (§11).
- **Admin / fulfillment UI** → own spec (§11).
- **Downloadable PDF receipt** → deferred (§11); token + order-details UI already satisfies retrieval.
- **Refunds** — no real money in play, so a user could not confirm the outcome.
- Discounts / coupons, multi-currency, shipping calculation, tax.

## 3. Constraints & Assumptions
- **Architecture**: Modular monolith with feature-sliced boundaries and a separately deployed API. Single datastore is a deliberate choice enabling the `order` write path to use real multi-document transactions instead of a saga pattern (see Single datastore below). At this scale, distributed-transaction complexity is over-engineering. If needed, the feature boundaries lay the groundwork for decomposition (e.g., Strangler Fig Pattern: domain decomposition + branch-by-abstraction).
- **Stack**: Express 5, Mongoose 8, TypeScript/ESM, `tsx` runtime, Jest + ts-jest + supertest. New dependencies: `zod`, `stripe`.
- **Stripe TEST mode only** — PaymentIntents + Elements. No real funds, no PCI scope. Pin the Stripe API version explicitly in the SDK constructor so upstream changes cannot silently alter behavior.
- **No real PII is stored.** Guest identity is the fixed non-PII placeholder "John Doe" with a mock address. This keeps the project outside GDPR / LFPDPPP scope; it is a constraint that must be re-evaluated the moment the auth spec lands.
- **Single datastore**: MongoDB. The order write path uses multi-document transactions (requires a replica set — Atlas provides this; a bare local `mongod` does not).
- **Currency**: USD only. **Every monetary value in the system is an integer, in minor units (cents) — no exceptions, no dollar-denominated field anywhere, including the catalog.** `product.price` is `priceCents` (int). Order and Payment follow the same convention (`totalCents`, `unitPriceCents`, `subtotalCents`). Binary floating point is not safe for money, and Stripe transacts exclusively in integer minor units — a single consistent representation removes the conversion boundary entirely rather than documenting where it's allowed to happen. Conversion to a dollar string is a presentation-layer concern only, done at render time, never stored. *Revised from an earlier draft that kept the catalog in dollars; reversed after tracing that `product.price` is a direct input to the server-derived order total, not a display-only value — the inconsistency it created wasn't worth defending.*
- **New env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and a browser-exposed publishable key. The existing `.env` has `STRIPE_PUB_KEY`, which lacks the `NEXT_PUBLIC_` prefix Elements requires client-side — it must be renamed.

## 4. Decisions Already Made
1. **Guest checkout only; no accounts in this phase.**
2. **Authorization boundary, documented deliberately**: the retrieval token is a *capability*, not per-user authorization. Anyone holding it can read that order. In production, ID-based retrieval without an ownership check is IDOR; the token mitigates enumeration but is not authZ. Real authorization arrives with the auth spec.
3. Fixed non-PII identity ("John Doe"); no real emails or addresses persisted.
4. Order retrieval by unguessable token, never by raw `_id`.
5. **Response envelope, amended during error-middleware implementation**: success responses are `{ success: true, data: T }`. Error responses are `{ success: false, error: [{ field?: string, code: string, message: string }] }` — structured rather than a flat `message` string, because zod's `ZodError.issues` (task 4) are naturally `{ path, code, message }` triples per field, and a flat string can't carry that back to a client without becoming unparseable free text. `code` is a stable machine-readable slug (e.g. `invalid_parameter`); `message` is the human-facing text; `field` names the offending input when the error is field-scoped, omitted otherwise.
6. **The webhook is the source of truth** for payment status — never the client redirect.
7. **Idempotency**: processed Stripe event IDs are recorded in a `ProcessedWebhookEvent` collection and re-delivery is a no-op.
8. Stripe test cards (success / decline) surfaced in the UI via their respective modals.
9. Foundations are built first as substrate; features conform to them from line one.
10. **Stripe shape: PaymentIntents + Elements** (custom flow). Chosen over hosted Checkout because the client-secret handoff, confirmation, `requires_action`/3DS and the wider webhook surface are the payment engineering worth showing. *Consequence: `order.model.ts` must drop its required `stripeSessionId`, which belongs to the hosted Checkout flow and is incompatible with this decision.*
11. **Oversell prevention: reserve at order creation, expire by TTL.** Order creation runs a multi-document transaction that decrements stock and records a reservation; the webhook confirms it; a sweeper releases expired reservations.
12. **Out-of-stock reset: lazy, on read.** Persist `depletedAt`; any read or write heals the row once 25 s have elapsed. No background job, survives restarts, deterministic under test via an injected clock.
13. **`isActive` and `stock` are distinct concepts.** `isActive` is catalog visibility (discontinued/hidden, operator-controlled); `stock === 0` is transient availability. The out-of-stock flow keys off `stock`, never off `isActive`.
14. **Payment state lives in its own collection**, one document per PaymentIntent attempt, so a decline-then-retry preserves both attempts and retry logic is demonstrable rather than asserted.
15. **Two endpoints, not one**: `POST /api/orders` runs the reservation transaction; `POST /api/payments/intents` creates the PaymentIntent. This keeps the Stripe network call *outside* the database transaction — a transaction is never held open across external I/O — and lets intent creation be retried without re-reserving stock.
16. **Retrieval token stored as a SHA-256 digest**, unique-indexed; the plaintext is returned exactly once, at creation. A fast hash is deliberate: slow KDFs (bcrypt/argon2) exist to frustrate brute force against low-entropy human-chosen passwords and buy nothing against a 256-bit random value.
17. **Retention**: only paid orders persist. All other states carry a TTL, so abandoned checkouts are reclaimed without deleting records a real system must keep.
18. **Separate Order and Payment lifecycles** (§7). The domain model never learns what 3DS is.
19. **Card declines map to HTTP 402**, mirroring Stripe's own API.
20. **Webhook testing uses both mechanisms**: constructed signed payloads drive the CI gates; Stripe CLI forwarding is a documented local-dev step.

## 5. Data Models

### Order
| Field | Type | Notes |
| --- | --- | --- |
| `orderNumber` | `string` | Human-facing display id, `APR-YYYYMMDD-NNNN`, unique. **Guessable by design — not a credential.** |
| `tokenHash` | `string` | SHA-256 of the retrieval token. Unique index. Plaintext never stored. |
| `customerName` | `string` | Fixed `"John Doe"` (§3). |
| `items` | `IOrderItem[]` | Price snapshot at purchase — see below. |
| `totalCents` | `int` | **Server-derived** from authoritative product data. Client-sent prices are never read. |
| `currency` | `'usd'` | Literal, for forward compatibility. |
| `status` | enum | `pending_payment` \| `paid` \| `fulfilled` \| `expired` \| `canceled` \| `paid_unfulfillable` |
| `reservationExpiresAt` | `Date` | The reservation *is* the order (decision 11). Drives the sweeper. |
| `createdAt` / `updatedAt` | `Date` | `timestamps: true` |

**Line item** (`IOrderItem`): `productId` (ref `Product`), `productName`, `unitPriceCents`, `quantity` (1–5), `subtotalCents`. Name and price are snapshotted so later catalog edits never rewrite history.

**Indexes**
- `tokenHash` — unique.
- `orderNumber` — unique.
- Retention TTL on `createdAt` with `partialFilterExpression: { status: { $in: ['pending_payment', 'expired', 'canceled'] } }`. **The TTL window must be strictly longer than `reservationExpiresAt`**, or an order could be deleted out from under an active checkout.

### Payment
One document per PaymentIntent attempt.

`orderId` (ref `Order`, indexed) · `stripePaymentIntentId` (indexed) · `status` mirroring Stripe (`requires_payment_method`, `requires_action`, `processing`, `succeeded`, `canceled`) · `amountCents` · `declineCode?` · `failureMessage?` · `attemptNumber` · timestamps.

### ProcessedWebhookEvent
`eventId` (**unique index** — this is the idempotency guard) · `type` · `receivedAt` · TTL long enough to outlive Stripe's retry window (Stripe retries for roughly three days; 30 days is a safe margin).

### Product (additions)
`depletedAt: Date | null` — set when stock hits 0, consumed by the lazy reset (decision 12). `stock` and `isActive` keep their existing meanings and stay independent (decision 13).

## 6. API Contract
All responses use `ApiResponse<T>`. All request bodies are zod-validated; `env` is validated at startup.

### `POST /api/orders`
Creates an order and reserves stock in one transaction.

**Request** — `{ items: [{ productId: string, quantity: int 1..5 }] }`. **No prices, names, or totals are accepted**; the client cart persists a price in `localStorage` and is therefore untrusted input.

- `201` → `{ success: true, data: { orderNumber, token, totalCents, reservationExpiresAt } }` — **the only time the plaintext token is ever returned.**
- `400` validation · `404` unknown product · `409` insufficient stock (body names the offending line) · `500`.

### `POST /api/payments/intents`
**Request** — `{ token: string }`. Creates (or returns the existing) PaymentIntent for that order.

- `201` → `{ success: true, data: { clientSecret, paymentIntentId } }`
- `404` unknown token · `409` order not in `pending_payment` · `410` reservation expired · `500`.

### `GET /api/orders/:token`
- `200` → `{ success: true, data: { order } }` · `404` unknown token.

> **Documented tradeoff**: a bearer credential in a URL path reaches access logs, browser history and `Referer` headers. Hashing protects it at rest, not in transit through logging. Mitigation: do not log full request URLs. Moving to a header or a POST lookup remains available and is the stricter choice.

### `POST /api/webhooks/stripe`
Mounted with `express.raw({ type: 'application/json' })` **before** the global `express.json()`, since signature verification needs the unparsed body.

- `200` on success **and on a replayed event** (acknowledged, no-op).
- `400` invalid signature. Never `5xx` for a business-logic failure Stripe cannot fix by retrying.

## 7. Key Flows

### Checkout → payment → order
1. Client `POST /api/orders` with product ids and quantities.
2. Server opens a transaction: re-reads authoritative prices, derives `totalCents`, atomically decrements each product's stock guarded on `stock >= quantity`, writes the Order as `pending_payment` with `reservationExpiresAt`. Commit.
3. Server returns the plaintext token once.
4. Client `POST /api/payments/intents`; server creates the PaymentIntent (outside any transaction) and a `Payment` row, returns `clientSecret`.
5. Client confirms via Stripe Elements. 3DS, if required, happens entirely between client and Stripe.
6. Stripe delivers `payment_intent.succeeded`; the webhook is the source of truth and transitions the Order to `paid`.

### Order state machine
| State | Trigger | Next |
| --- | --- | --- |
| `pending_payment` | `payment_intent.succeeded` | `paid` (reservation confirmed) |
| `pending_payment` | `payment_intent.payment_failed` | `pending_payment` (retry allowed; new `Payment` row) |
| `pending_payment` | sweeper: `reservationExpiresAt` passed | `expired` (stock restored in a transaction) |
| `pending_payment` | client cancels | `canceled` (stock restored) |
| `paid` | `payment_intent.succeeded` (replay) | `paid` — no-op |
| `paid` | fulfillment (out of scope; manual) | `fulfilled` |
| `expired` | `payment_intent.succeeded` (**late webhook**) | re-acquire stock atomically → `paid`; if unavailable → `paid_unfulfillable` |
| any | unknown / unhandled event type | recorded, ignored |

### Failure / edge paths
- **Declined card** — `payment_intent.payment_failed` writes a `Payment` row with `declineCode`; the order stays `pending_payment` so the reservation survives and the customer can retry within the window. API surfaces `402` with a mapped message.
- **Abandoned / expired intent** — the sweeper expires the order and restores stock. Idempotent: re-running it over an already-expired order changes nothing.
- **Duplicate webhook** — `ProcessedWebhookEvent.eventId`'s unique index rejects the second insert; the handler returns `200` without re-applying effects.
- **Out-of-order webhook** — `payment_failed` arriving after `succeeded` must not un-pay a paid order. Transitions are guarded on current state, never applied blindly.
- **Expiry racing a late success** — the hard case, and the one worth discussing: the order expired and stock was released, then payment succeeded. The handler re-attempts an atomic stock acquisition; success → `paid`, failure → `paid_unfulfillable`, logged loudly. In this sandbox the 25 s stock reset means re-acquisition nearly always succeeds; in production this is precisely where a refund path would attach.

## 8. Error Handling & Validation
| Error | HTTP | Notes |
| --- | --- | --- |
| Validation (zod) | `400` | Field-level detail in `message`. |
| Not found | `404` | Unknown product, unknown token. |
| Card declined | `402` | Mirrors Stripe; `decline_code` → user-facing action. |
| Insufficient stock | `409` | Names the offending line item. |
| Reservation expired | `410` | Semantically distinct from 404 — it *did* exist. |
| Invalid webhook signature | `400` | Never leak why. |
| Idempotent replay | `200` | Success, no effect. |
| Unexpected | `500` | Generic message outward, full detail logged. |

All errors pass through the centralized error middleware and leave as `ApiResponse`. No handler formats its own error response. zod validates every request body, and `env` at startup — a missing `STRIPE_SECRET_KEY` must fail loudly at boot, not at first checkout.

## 9. Task Breakdown (ordered; foundations first)
1. [x] **Repair CI** — `pnpm ci` is not a pnpm command, so lint and build never run today. Replace with `pnpm install --frozen-lockfile`; add `pnpm test` and `pnpm typecheck` steps. Everything below depends on gates that actually execute.
2. [x] Error middleware. **No async wrapper** — verified in `router@2.2.0/lib/layer.js`: Express 5 forwards a rejected promise returned by a handler to `next(err)` natively, so the Express 4 `asyncHandler` pattern is dead weight in this stack.
3. [x] `ApiResponse<T>` envelope type.
4. [x] zod `env` validation at startup.
5. [x] zod body validation (DTOs) — `createProductSchema`/`updateProductSchema`, shared field definitions, routed through the `ZodError` branch in `errorHandler.ts`.
6. [ ] The service layer the backend does not yet have.
7. [ ] Rewrite `order.model.ts` per §5 (drop `stripeSessionId`, add `tokenHash`, reservation, new status set, integer cents).
8. [ ] `Payment` and `ProcessedWebhookEvent` models.
9. [ ] Product additions (`depletedAt`) + lazy-reset helper with injectable clock.
10. [ ] Order service + routes: create (transactional reservation), retrieve-by-token.
11. [ ] Reservation expiry sweeper.
12. [ ] Payment service + Stripe integration (PaymentIntents).
13. [ ] Webhook receiver + idempotency store + state machine.
14. [ ] Frontend: checkout page (`/shop/checkout` is currently a dead link), Elements integration, decline and out-of-stock modals, order-retrieval UI.

Steps 2–6 are strictly sequential substrate. 7–8 are independent of each other and parallelizable. 14 depends only on the §6 contract, so it can proceed against a stubbed API once that contract is frozen.

## 10. Verification Criteria
Each gate is an automated test unless marked manual.

- **Idempotency gate** — replaying an identical `payment_intent.succeeded` event produces exactly one `paid` order, one `Payment` row, and one stock decrement.
- **Totals gate** — a request with a tampered price field is ignored; `totalCents` matches the database-derived sum. Explicitly assert the client cannot influence money.
- **Oversell gate** — N concurrent orders against stock of 1 yield exactly one `201` and N−1 `409`s.
- **Reservation-release gate** — an order past `reservationExpiresAt` is expired by the sweeper and its stock is restored exactly once, even if the sweeper runs repeatedly.
- **Late-webhook gate** — `succeeded` arriving for an `expired` order lands in `paid` or `paid_unfulfillable`, never silently lost.
- **Out-of-order gate** — `payment_failed` after `succeeded` leaves the order `paid`.
- **Signature gate** — a payload with an invalid signature is rejected `400` and mutates nothing.
- **Lazy-reset gate** — with an injected clock, stock heals at 25 s, not before.
- **Quantity gate** — `quantity: 6` is rejected `400` server-side regardless of client state.
- **Env gate** — boot with a missing Stripe key fails immediately with a named error.
- **Manual** — Stripe CLI forwarding against a real test payment, covering success, decline, and 3DS.

## 11. Future (explicitly deferred)
- **Auth spec** — accounts (email/password + OAuth), password reset, per-user authorization replacing the token capability, plus the privacy-policy page and consent copy that persisting real email addresses requires. Re-opens the GDPR/LFPDPPP question closed in §3. *Committed, not abandoned.*
- **Email spec** — order confirmation delivery. *Committed.*
- **Admin / fulfillment spec** — the surface that drives `paid → fulfilled`, currently a manual transition.
- **PDF receipt** — server-rendered, so it cannot be forged client-side.
- **Refunds** — the natural home for the `paid_unfulfillable` recovery path.
- Discounts/coupons, multi-currency, shipping, tax.

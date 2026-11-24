# SPEC: Authentication & Authorization

**Status:** Draft — Implementation not started. Nothing below is claimed as built.
**Last updated:** 2026-11-20
**Scope of this file:** the auth phase only. It sits right after the guest-checkout `checkout.spec.md` is shipped, and does not replace it.

> **How much spec is enough here.** Kept from spec-driven development: outcomes, scope boundaries, constraints, decisions already made (with the *why*), task breakdown, and verification criteria. Skipped on purpose: spec-enforcing CI tooling, multi-agent verifiers, and a "constitution" file. They pay off at team scale, not for one dev and one repo. The verification table in section 7 doubles as the test plan.
>
> **Working agreement:** this spec says *what*, *shape*, and *where*. The code is hand-written. Agents may review against section 7, not generate the implementation.

---

## 1. Outcomes (done = all true)

- **O1.** An admin can log in, stay logged in across page refreshes, and log out. Sessions end after 15 min idle or 60 min absolute.
- **O2.** Every protected route enforces, in order: authenticated, then right role, then access to the specific resource. All checks run on the server. Hiding a button in React is UX, never a lock.
- **O3.** State-changing requests forged from another site are rejected.
- **O4.** Every defense in section 7 has an automated test, and each includes a positive control (the legitimate request succeeds).

## 2. Scope

**In**
- Email and password login for admins, with password hashing
- Server-side sessions (`express-session` + `connect-mongo`)
- Cookie flags, idle and absolute timeouts, session ID regeneration at login
- Idempotent logout
- CSRF token on state-changing routes
- Role middleware
- Uniform "not found" for resources the caller can't access
- Login rate limit and not-found burst detection
- Security logging
- Integration tests

**Out (and why)**
- OAuth, social login, NextAuth: hides the fundamentals this phase is meant to practice.
- JWT: instant revocation needs server state anyway.
- Email verification, password reset, MFA: separate feature, separate spec.
- Device fingerprinting: a signal, not a lock; revisit later.
- Dead-letter queue for failed session destroys: overkill here; log plus TTL backstop is enough (see D9).
- Customer accounts: **open**, see section 8.

**Roles:** `guest` (no session), `admin`.

## 3. Constraints and assumptions

- **Stack:** Next.js 16 frontend (port 3000), Express 5 backend (port 5000), TypeScript, Mongoose/MongoDB, pnpm, Jest/ts-jest, and `supertest`.
- **Browser calls Express directly** with `credentials: 'include'` (fetch). Any server-side Next.js call made on a user's behalf must forward the cookie explicitly (open, see section 8).
- **Same-site matters for `SameSite=Lax`.** "Site" means scheme plus registrable domain, and ports are ignored.
  - Dev: `localhost:3000` and `localhost:5000` are the same site, so Lax works.
  - Prod: if the API stays on a different registrable domain than the frontend (for example a default Render hostname), the browser will **not** send a Lax cookie on fetch calls. See D10.
- **Behind a proxy (Render):** `app.set('trust proxy', 1)`, or `secure` cookies won't be set.
- **CORS:** one explicit frontend origin from an env var, `credentials: true`. Never reflect arbitrary origins. CORS and `SameSite` are different mechanisms; don't conflate them.
- **Secrets** (`SESSION_SECRET`, DB URL) come from the environment and are never committed.
- **Safe methods** (GET/HEAD) never change state, otherwise Lax stops protecting you.
- Public docs must match the code. Use WIP markers, not aspirational claims.

## 4. Decisions already made (with the why)

| # | Decision | Why |
|---|---|---|
| D1 | Server-side sessions, not JWT | Revocation is just deleting a record. A JWT blacklist reintroduces server state. |
| D2 | Custom implementation, not NextAuth *(proposed, confirm in section 8)* | Goal includes understanding each moving part. |
| D3 | Cookie holds only a signed session ID. `userId` and `role` live in the session record. | A demotion takes effect on the next request. The client can't influence identity. |
| D4 | bcrypt, cost tuned to about 250 ms per hash on the deploy target | Slow hashing makes each guess expensive. The per-user salt is generated and stored by the library. |
| D5 | Cookie flags: `httpOnly`, `secure` (prod), `sameSite: 'lax'` | `httpOnly` stops scripts from reading it. `secure` stops plaintext sends. `Lax` blocks cross-site POSTs and still lets email-link arrivals stay logged in. |
| D6 | Idle: cookie `maxAge` 15 min with `rolling: true`. Absolute: `createdAt` stamped at login and checked each request (60 min), never refreshed. | Idle ends a walked-away session. Absolute ends one an attacker keeps alive. |
| D7 | `regenerate()` at login, carrying over only needed data | The pre-login ID is attacker-influenced, so it must not survive the privilege change. |
| D8 | CSRF: token stored in the session, fetched via `GET /api/csrf-token` after login, kept in memory (not localStorage), sent as `X-CSRF-Token`, checked on POST/PUT/PATCH/DELETE | Another origin can trigger requests but can't read the token response (same-origin policy). Use a maintained library (e.g. `csrf-sync`, check it's current) or hand-roll once as an exercise. |
| D9 | Logout is `POST`, idempotent: destroy server-side first, then clear the cookie with the **same** options. On store failure: still clear the cookie, log loudly with the session ID, return 500 (revocation unconfirmed), at most one short retry. | A cookie cleared in one browser doesn't revoke a copied session ID. The TTL is the backstop. |
| D10 | Prod API served from a subdomain of the frontend's domain (e.g. `api.<domain>`) so `Lax` works. Fallback: `SameSite=None; Secure` **plus** mandatory CSRF token. | Browsers drop Lax cookies on cross-site fetches. |
| D11 | Authorization via query filter, never fetch-then-compare. Malformed IDs are a separate validation step before the query. | One query can't distinguish "doesn't exist" from "not yours", so neither can the caller. |
| D12 | Status codes: `401` no valid session. `403` CSRF failure. `404` not found or not allowed (same status, same body shape). `429` + `Retry-After` for rate limiting. | `401` means unauthenticated. `403` means authenticated but refused. `404` avoids confirming a resource exists. |
| D13 | Error body is one shape for all failures: `{ "success": false, "error": { "code", "message", "field" }, "timestamp" }` | Any difference between failure bodies is an information leak. |
| D14 | The real reason is logged internally, with user, session, and requested ID. The client only sees the generic error. | Debuggable without leaking. |
| D15 | Demoting or removing a user destroys all of that user's sessions. | The session record is the source of truth for role. |

## 5. Data model (shape only)

- **User:** `email` (unique), `passwordHash`, `role` (`admin`).
- **Session record** (managed by the store): `userId`, `role`, `createdAt`, `csrfToken`.
- **Order (only if customer accounts are added):** `ownerId`. There is no `orders[]` array on the user, which avoids two copies drifting apart after a half-failed write.

## 6. Tasks (in order, each small)

Follow the existing feature-based layout (no repository layer): `backend/features/auth/` with routes, controller, service, middleware, model.

| # | Task | Done when |
|---|---|---|
| T1 | Session infrastructure: store, cookie options, trust proxy, CORS | A request to a protected route with no cookie gets 401, and `Set-Cookie` shows the expected flags |
| T2 | User model + hash/verify util | Two users with the same password have different stored hashes, and verify works |
| T3 | Login: validate, verify, `regenerate`, populate session, rate limit | Wrong password and unknown email return the same response |
| T4 | `authenticate` middleware: session lookup + absolute-timeout check (destroy on expiry) | Expired session gets 401 and its record is deleted |
| T5 | `requireRole` middleware | Non-admin on an admin route gets 404, no session gets 401 |
| T6 | Logout (idempotent) | Second logout still succeeds, and the old cookie gets 401 |
| T7 | CSRF endpoint + middleware | POST without token gets 403, with token succeeds |
| T8 | One real resource route using the D11 pattern | Not-found and not-allowed responses are indistinguishable |
| T9 | Not-found burst detection per user + login rate limit | Burst triggers 429 and a log entry with user and IDs |
| T10 | Integration tests for section 7, plus an "Auth" section in the README marked WIP until all pass | All section 7 rows green |

## 7. Verification (integration tests via `supertest`)

Each row needs its positive control, otherwise a route that fails everything would pass.

| Case | Sequence | Expected | Positive control |
|---|---|---|---|
| Wrong resource / token | Request an ID you don't have access to | `404`, body identical to a nonexistent ID (ignore `timestamp`) | Rightful caller or admin gets `200` |
| Malformed ID | `GET /…/banana` | Same `404`, not a `500` | n/a |
| Role bypass | Non-admin session on admin route. Then no session. | `404`. Then `401`. | Admin gets `200` |
| CSRF | Valid cookie, state-changing request, no token | `403` | Same request with token succeeds |
| CSRF cross-site (manual) | Forged form from another origin, in a browser | Cookie not sent, `401` | Same action from the real frontend works |
| Fixation | Guest request gives cookie A. Login carrying A gives cookie B. Protected route with A. Then with B. | B ≠ A. A gets `401`. B gets `200`. | B works |
| Absolute timeout | Backdate `createdAt` beyond 60 min | `401` and record deleted | Fresh session works |
| Idle timeout | No requests beyond 15 min | `401` | Active session survives |
| Logout idempotency | `POST /logout` twice | Both succeed. Cookie cleared with matching attributes. Old cookie gets `401`. | n/a |
| Logout store failure | Mock `destroy` to fail | Cookie cleared, `500`, loud log with session ID | n/a |
| Demotion | Demote admin, destroy their sessions | Next admin request gets `401` | Other users unaffected |
| Enumeration | N not-founds from one user in a window | `429` + `Retry-After`, log has user and IDs | Normal use not throttled |
| Cookie flags | Inspect `Set-Cookie` | `HttpOnly`, `SameSite=Lax`, `Secure` (prod) | n/a |
| Password storage | Compare stored hashes for identical passwords | Different. Plaintext never appears in logs. | Login still works |

## 8. Open decisions (resolve before the related task)

1. **Customer accounts in v1?** Default: no (guest checkout stays the only buyer flow). If yes, orders gain `ownerId`, and the D11 filter `{ _id, ownerId }` applies to them. Guest orders keep their existing unguessable-token retrieval, and a wrong token gets the same uniform 404.
2. **NextAuth vs custom** (D2). Confirm the custom path.
3. **Prod API domain** (D10). Decide before the first deployment.
4. **Server-side Next.js calls to Express:** do any exist, and who forwards the cookie?
5. **Rate-limit store:** in-memory is acceptable for v1 (resets on restart), or move it to the DB.

## 9. Revisit when

- Customer accounts are added: re-examine the 15 min idle and 60 min absolute limits against checkout friction, and consider re-asking the password before sensitive actions.
- The first real deployment: confirm cookie behavior across the actual domains.

## Change log

- 2026-11-20: initial draft from auth fundamentals work.

# Alex's Portfolio Website
## Project Description
This repository is a production portfolio site plus an in-progress Sandbox (Stripe Test Mode) E-commerce Backend, sharing the same Next.js codebase. The deployed porfolio is the public-facing hub, while the e-commerce work takes place on the `mern-makeover` branch as intentional practice ground for Spec-Driven Development, payment-flow engineering, and backend architecture.

### ROI Calculator
Production-deployed investment scenarios calculator built into the portfolio. Users input: an intial deposit, recurring contributions (with frequency radio buttons: annual, monthly, weekly, or daily), investment term (1-40 years via slider), and average annual return percentage. The calculator computes compound growth over the term and renders a year-by-year stacked bar chart showing return (top) and investment (bottom) from the current year through the end of the term.

Inputs are bounded, validated, and automatically formatted:
- Initial deposit: minimum US $10
- Contributions: minimum US $1
- Term: 1-40 years
- Average annual return: minimum 1%

Live at [alejandropiedra.com](https://www.alejandropiedra.com)

### Sandbox E-commerce
An in-progress full-stack e-commerce demo built on the same Next.js codebase, with a Node.js + Express backend and MongoDB persistence. This Project serves practice puroses for three main aspects: **Spec-Driven Development** (writing structured specs before implementation), **Payment-Flow Engineering** (idempotent processing, webhook handling, retry logic via Stripe Test API), and **Backend Architecture** (layered structure with routes, controllers, models, and tests).
**Currently working**:
- Product Catalog (model, controller, routes, backend tests)
- Cart with Zustand state management and localStorage persistence
- Product detail pages
- Demo disclaimer modal

**Deliberate WIP**:
- `order.model.js` exists; order routes pending registration in `server.js`
- Frontend tests scaffolded with `@testing-library/react`, implementation pending
- `Navbar.tsx` currently imported per-page; planned move to `layout.tsx`

Backend will merge to `main` once order routes are wired up and end-to-end checkout works.

## The 'Why?' Answered

## Design Decisions
### Architecture
- Monorepo for portfolio + e-commerce
My portfolio site functions as a hub linking to my most relevant work. Keeping the e-commerce sandbox on a branch of the same Next.js codebase lets me reuse the design system, routing, and component patterns rather than maintaining two separate projects.
- Two-process local development
The frontend (`:3000`) and backend (`:9999`) run as independent processes, each independently deployable, with a one-directional dependency: the frontend consumes the backend's API contract, not the other way around. In `dev` they communicate cross-origin with CORS configured on the backend, deliberately mirroring a production topology where the API is a separately deployed service. A single-origin setup via Next.js `rewrites()` is the alternative, but cross-origin was chosen to keep the dev environment faithful to how the services will be deployed.
- Express + Mongoose Backend
The e-commerce sandbox exists in part to showcase MERN stack engineering. Using `Next.js API routes` would have collapsed the backend into the frontend part of the project and undermined that purpose. Keeping Express as a separate service also makes the backend independently  deployable and testable, which matters for the payment-flow patterns this project is planned to implement.
### Stack & Tooling
- Next.js App Router over Pages Router
App Router is the modern convention for Next.js and provides better support for server components, layouts, and parallel routes; thus being the most efficient option to work with on projects beyond static web pages.
- Zustand - State Management
Zustand fits the scope: minimal setup, no Provider Tree, persistence to `localStorage` via the `persist` middleware out of the box. Redux would add overhead disproportionate to the cart's complexity (or simplicity, depends on how you want to frame it), and Context API tends to cause unnecesary re-renders when state changes frequently. For a sandbox demonstrating MERN stack proficiency, Zustand keeps the focus on backend and payment-flow engineering rather than on state-management ceremony.
- MongoDB rationale
- Plain JavaScript / TypeScript split
- ESM throughout + Jest
ESM is the current standard for Node.js and the module system I've used most professionally. The project uses `"type": "module"` in `package.json` and ESM-compatible patterns throughout, including `jest.unstable_mockModule()` for test mocking. That being said: Jest is setup with the `ts-jest` ESM Preset. The test file extension is `.test.js` per `testMatch` configuration. The ESM mocking pattern requires imports to come after mock declarations, a known 'gotcha' properly documented in `CLAUDE.md` for anyone handling this codebase. Working with ESM matches how I build production Node.js services.
### Domain-specific choices
- Stripe Test API
This is a demonstrative purpose sandbox project, not a real payment system. Stripe's Test API provides realistic payment flow behavior (success, failure, refunds, webhooks) without handling real funds or PCI compliance concerns. Production migration would imply switching API keys and adding production-grade error handling, monitoring, and reconciliation processes.
- PrimeReact + Tailwind + PrimeFlex (three styling layers)
The original ROI Calculator was a challenge extended to me by my brother-in-law ([Luis Egan](https://linkedin.com/in/luis-egan-565401127)) as a way to showcase the most important topics from my bootcamp with a real project. He deliberately chose the styling stack for me to practice handling real-world decisions made by someone else, exactly the kind of constraint engineers encounter on real teams. I kept the stack as I extended the portfolio because consistency with the original work matter more than swapping it for personal preference.
- `Navbar.tsx` imported per-page (WIP)
Currently `Navbar.tsx` lives in `src/app/` and is imported by each page individually rather than mounted once in `layout.tsx`. This is a by-product of how the project evolved, not a deliberate pattern. The planned refactor is to move `Navbar` into `components/` and render it once in `layout.tsx`. Tracked as a next step once the E-commerce backend is further along.

## API Endpoints

## Setup Instructions

## How To Run Tests

## Areas For Improvement
- `Navbar.tsx` imported per-page
- TypeScript migration
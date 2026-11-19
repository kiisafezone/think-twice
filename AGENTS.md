# AGENTS.md

## Product Identity

- Product: **THINK TWICE.**
- Category: Personal Financial Decision Companion.
- Official tagline: **Think twice today. Thank yourself tomorrow.**
- Primary language: Indonesian.
- Core systems: Purchase Decision Assessment, Financial Reality Check, and Decision Intelligence. Keep all three distinct and connected.

## Source of Truth

1. Explicit user decisions.
2. `AGENTS.md` for working rules and architecture.
3. `SPEC.md` and `docs/product/DECISION_ENGINE.md` for product behavior and deterministic rules.
4. `docs/brand/STYLE_GUIDE.md` and the other brand references for visual and verbal standards.
5. `docs/architecture/` for system boundaries and domain contracts.
6. `docs/security/` and `docs/quality/` for privacy, security, and verification expectations.
7. `TASKS.md` for roadmap and handoff.
8. Existing implementation and tests for actual runtime behavior.

## Technology Strategy: Polyglot

Choose technologies by responsibility. Do not force the product into one language, and do not install every technology before a feature needs it.

| Area | Technology | Responsibility |
|---|---|---|
| Web app | Next.js App Router + React | Routing, rendering, UX |
| Frontend and domain | Strict TypeScript | UI contracts and deterministic V1 engine |
| Styling | Tailwind CSS | Responsive design system |
| Frontend validation | Zod | Form and client-boundary validation |
| Backend services, when justified | Python + FastAPI | Concrete server-side workloads |
| Python validation | Pydantic | API request/response validation |
| Analytics, when justified | Python | Statistical analysis, not verdict authority |
| Database, when justified | PostgreSQL | Persistent server-side records |
| Python DB access | SQLAlchemy | Python persistence when needed |
| Testing | Vitest + Pytest | TypeScript and Python tests |
| V1 persistence | localStorage behind abstraction | Anonymous local decision history |
| Package managers | npm + uv | JS and Python ecosystems |

### Architecture Rules

- V1 may run entirely in Next.js/TypeScript.
- Do not create an empty Python service merely to claim a polyglot stack.
- TypeScript is the single source of truth for the V1 deterministic decision engine.
- Do not duplicate financial formulas in Python. Future cross-service contracts must be versioned, validated, and tested.
- PostgreSQL is deferred until persistent server-side data is justified.
- No mandatory authentication, banking connection, credit-bureau connection, analytics SDK, or external data transmission in V1 without approval.
- Follow [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md), [Domain Model](docs/architecture/DOMAIN_MODEL.md), and [API Contract Policy](docs/architecture/API_CONTRACTS.md).

## Engineering Rules

- TypeScript: `strict: true`; avoid `any`; prefer `unknown`, narrowing, and discriminated unions.
- Python: type public interfaces; validate API boundaries with Pydantic; separate business logic from route handlers.
- Use integer Rupiah for calculations. Never use floating-point arithmetic for money.
- Missing, unknown, not-applicable, and invalid inputs must remain distinct.
- Keep behavioral and financial results separate before combining them.
- Recommendations must be explainable from inputs, approved rules, and assumptions.
- Use `Intl.NumberFormat` for currency display.
- Keep pure domain logic independent of UI, network, and persistence.
- Never invent scoring coefficients, answer mappings, thresholds, or rounding rules.

## Product and UX Guardrails

- Never remove or dilute Purchase Decision Assessment.
- Do not turn the product into a generic budgeting dashboard, expense tracker, loan marketplace, or credit product.
- Credit limits are not income or available cash.
- Protected savings are not spendable by default.
- Do not shame users or promise guaranteed financial outcomes.
- Follow `SPEC.md` and `docs/brand/STYLE_GUIDE.md`.

## Anti-Slop Rules

- No fake features, placeholder data presented as real, dead buttons, invented APIs, or undocumented environment variables.
- No unrelated rewrites for a specific bug.
- Never claim tests, builds, integrations, audits, or deployments succeeded unless verified.
- Inspect relevant files before editing; preserve working behavior.
- Prefer the smallest coherent change and add tests for changed behavior.
- Avoid dependencies when existing/native capabilities suffice.

## Privacy and Security

- Minimize collection and retention of financial data.
- Never log sensitive financial inputs, credentials, tokens, or personal identifiers.
- Do not transmit financial data externally without explicit approval and user disclosure.
- Keep secrets out of source control.
- Treat localStorage as browser-local, not encrypted secure storage.
- Follow `docs/security/PRIVACY_AND_DATA_HANDLING.md` and `docs/security/THREAT_MODEL.md`.

## Git and Delivery

- Work on `main` unless another branch is explicitly approved.
- Do not create CI/build workflows or deployment configuration without approval.
- Do not commit secrets, caches, or local user data.
- Follow `.editorconfig`, `.gitattributes`, and `.gitignore`.
- Report changed files, tests actually run, and limitations.

## Mandatory Session Handoff

Before ending a session, update `TASKS.md` with last agent, completed work, blockers, next exact step, tests, and files changed. Never leave the next agent to infer the current state.

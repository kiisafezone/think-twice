# AGENTS.md

## Product Identity

-   Product: **THINK TWICE.**
-   Category: Personal Financial Decision Companion.
-   Official tagline: **Think twice today. Thank yourself tomorrow.**
-   Primary language: Indonesian.
-   Core systems: Purchase Decision Assessment, Financial Reality Check,
    and Decision Intelligence. Keep all three distinct and connected.

## Source of Truth

1.  Explicit user decisions.
2.  `AGENTS.md` for working rules and architecture.
3.  `SPEC.md` for product behavior and domain rules.
4.  `docs/brand/STYLE_GUIDE.md` for visual and verbal standards.
5.  `TASKS.md` for roadmap and handoff.
6.  Existing implementation and tests.

## Technology Strategy: Polyglot

Choose technologies by responsibility. Do not force the product into one
language, and do not install every technology before a feature needs it.

  ------------------------------------------------------------------------
  Area                    Technology              Responsibility
  ----------------------- ----------------------- ------------------------
  Web app                 Next.js App Router +    Routing, rendering, UX
                          React                   

  Frontend                TypeScript, strict mode UI, client logic, domain
                                                  contracts

  Styling                 Tailwind CSS            Responsive design system

  Frontend validation     Zod                     Form and client-boundary
                                                  validation

  Core decision engine    TypeScript              Deterministic
                                                  assessment, scoring,
                                                  calculations, verdicts

  Backend services        Python + FastAPI        Server-side services and
                                                  future integrations

  Python validation       Pydantic                API request/response
                                                  validation

  Analytics               Python                  Statistical/analytical
                                                  workloads, not hidden
                                                  financial verdict logic

  Database (when          PostgreSQL              Persistent accounts and
  justified)                                      decision records

  Python DB access (when  SQLAlchemy              Python persistence
  needed)                                         

  Testing                 Vitest + Pytest         TypeScript and Python
                                                  tests

  V1 persistence          localStorage behind an  Anonymous local decision
                          abstraction             history

  JS package manager      npm                     JavaScript dependencies

  Python package manager  uv                      Python dependencies

  Runtime                 Node.js LTS + supported Separate runtimes
                          Python 3.x              
  ------------------------------------------------------------------------

### Architecture Rules

-   V1 may run entirely in Next.js/TypeScript. FastAPI is the approved
    backend path when a concrete server-side or Python-specific workload
    requires it.
-   Do not create an empty Python service merely to claim a polyglot
    stack.
-   TypeScript is the single source of truth for the V1 deterministic
    decision engine.
-   Do not duplicate financial formulas in Python. Cross-service
    contracts must be versioned, validated, and tested.
-   PostgreSQL is deferred until persistent server-side data is
    justified. V1 local history uses a replaceable storage abstraction.
-   No mandatory authentication, banking connection, credit-bureau
    connection, analytics SDK, or external data transmission in V1
    without approval.

## Engineering Rules

-   TypeScript: `strict: true`; avoid `any`; prefer `unknown`,
    narrowing, and discriminated unions.
-   Python: type public interfaces; validate API boundaries with
    Pydantic; separate business logic from route handlers.
-   Use integer Rupiah for calculations. Never use floating-point
    arithmetic for money.
-   Missing or invalid inputs must be explicit; never fabricate
    financially material defaults.
-   Keep behavioral and financial results separate before combining
    them.
-   Recommendations must be explainable from inputs, rules, and
    assumptions.
-   Use `Intl.NumberFormat` for currency display.
-   Keep pure domain logic independent of UI, network, and persistence.

## Product and UX Guardrails

-   Never remove or dilute Purchase Decision Assessment.
-   Do not turn the product into a generic budgeting dashboard, expense
    tracker, loan marketplace, or credit product.
-   Credit limits are not income or available cash.
-   Do not shame users or promise guaranteed financial outcomes.
-   Follow `SPEC.md` and `docs/brand/STYLE_GUIDE.md`.

## Anti-Slop Rules

-   No fake features, placeholder data presented as real, dead buttons,
    invented APIs, or undocumented environment variables.
-   No unrelated rewrites for a specific bug.
-   Never claim tests, builds, integrations, or deployments succeeded
    unless verified.
-   Inspect relevant files before editing; preserve working behavior.
-   Prefer the smallest coherent change and add tests for changed
    behavior.
-   Avoid dependencies when existing/native capabilities suffice.

## Privacy and Security

-   Minimize collection and retention of financial data.
-   Never log sensitive financial inputs, credentials, tokens, or
    personal identifiers.
-   Do not transmit financial data externally without explicit approval
    and user disclosure.
-   Keep secrets out of source control.
-   Treat localStorage as browser-local, not encrypted secure storage.

## Git and Delivery

-   Work on `main` unless another branch is explicitly approved.
-   Do not create CI/build workflows or deployment configuration without
    approval.
-   Do not commit secrets, caches, or local user data.
-   Report changed files, tests actually run, and limitations.

## Mandatory Session Handoff

Before ending a session, update `TASKS.md` with last agent, completed
work, blockers, next exact step, tests, and files changed. Never leave
the next agent to infer the current state.

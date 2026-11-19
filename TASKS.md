# TASKS.md

## Last Session Handoff

- Last Agent Used: ChatGPT
- Completed: Repository governance files are present; brand/product documentation and polyglot architecture guidance are published. Added `docs/product/DECISION_ENGINE.md` and corrected the style-guide path in `AGENTS.md`.
- Current Bug / Blocker: Application scaffold and installed dependencies remain unverified. Affordability penalty coefficients and rationality answer scales/mappings remain unresolved release blockers.
- Next Exact Step: Inspect the full repository tree, manifests, source files, tests, and Git state on `main`. Then reconcile approved scoring parameters in `SPEC.md` and `docs/product/DECISION_ENGINE.md` before implementing numeric scores.
- Tests Run: Documentation-only review; no application tests or builds run.
- Files Changed: `AGENTS.md`, `TASKS.md`, `docs/product/DECISION_ENGINE.md`.

## Product Priorities

1.  Preserve Purchase Decision Assessment as a first-class system.
2.  Build Financial Reality Check as a separate assessment.
3.  Combine both through transparent Decision Intelligence.
4.  Keep calculations deterministic, explainable, and tested.
5.  Protect privacy and minimize financial data collection.

## Roadmap

### Phase 0 --- Repository Reconnaissance

-   [ ] Inspect repository tree and Git status.
-   [ ] Inspect existing package manifests, source files, and tests.
-   [ ] Verify whether Next.js, TypeScript, Tailwind, Zod, and Vitest
    are installed.
-   [ ] Record actual state; do not infer implementation from
    documentation.

### Phase 1 --- Application Foundation

-   [ ] Preserve existing working implementation.
-   [ ] Establish Next.js App Router and strict TypeScript only if
    absent.
-   [ ] Configure Tailwind and Zod only if needed.
-   [ ] Add Vitest and a minimal test setup.
-   [ ] Keep FastAPI/Python deferred until a concrete backend service is
    required.
-   [ ] Document the service boundary and reason before introducing
    Python.

### Phase 2 --- Domain Engine

-   [ ] Define and validate domain contracts.
-   [ ] Specify affordability penalty coefficients and edge-case
    behavior.
-   [ ] Specify rationality scoring rubrics and input scales.
-   [ ] Implement calculations with integer Rupiah.
-   [ ] Implement behavioral scoring and impulse-friction triggers.
-   [ ] Implement verdict priority and explanation output.
-   [ ] Add Vitest coverage for missing data and boundary cases.

### Phase 3 --- Assessment Experience

-   [ ] Build purchase input flow.
-   [ ] Build Purchase Decision Assessment.
-   [ ] Build Financial Reality Check.
-   [ ] Explain why each financial input is requested.
-   [ ] Handle incomplete data without fabricating scores.

### Phase 4 --- Decision Results and Local History

-   [ ] Build Decision Intelligence result card.
-   [ ] Show behavioral and financial results separately.
-   [ ] Explain verdict, factors, assumptions, and next steps.
-   [ ] Add local history behind a storage abstraction.
-   [ ] Implement privacy-safe sharing.

### Phase 5 --- Quality and Future Services

-   [ ] Test responsive layouts and accessibility.
-   [ ] Review privacy and data minimization.
-   [ ] Introduce FastAPI/Python only for an approved, concrete
    server-side workload.
-   [ ] Introduce PostgreSQL only when persistent server-side storage is
    justified.
-   [ ] Add Pytest and cross-service contract tests if Python is
    introduced.
-   [ ] Document deployment architecture before deployment work.

## Definition of Done

-   User-facing behavior matches `SPEC.md`.
-   Purchase Decision Assessment remains present and meaningful.
-   Behavioral and financial assessments remain distinct.
-   Verdicts are deterministic and explainable.
-   Financial calculations use integer Rupiah and pass edge-case tests.
-   No fake data, dead controls, or unverified claims.
-   UI follows `docs/STYLE_GUIDE.md`.
-   Privacy requirements are respected.
-   `TASKS.md` contains an accurate handoff.

## Multi-Agent Handoff Protocol

Every agent updates the handoff section before ending a session.

Template: - Last Agent Used: - Completed: - Current Bug / Blocker: -
Next Exact Step: - Tests Run: - Files Changed:

Agents must inspect current files before editing, preserve approved
decisions, and avoid duplicating work.

# System Architecture

## Status

Architecture baseline for V1. This is a target design, not evidence that the application has been implemented.

## Product boundary

THINK TWICE. has three connected but independently explainable capabilities:

1. **Purchase Decision Assessment** — evaluates motivation, need versus want, urgency, social pressure, alternatives, utility, and possible regret.
2. **Financial Reality Check** — evaluates available funds, total cost, obligations, and cash-flow impact.
3. **Decision Intelligence** — combines both assessments through the versioned deterministic rules in [Decision Engine](../product/DECISION_ENGINE.md).

Never collapse the first two assessments into an opaque score.

## V1 logical architecture

```text
Browser
  └── Next.js App Router / React
       ├── Presentation and accessible assessment flows
       ├── Zod input-boundary validation
       ├── TypeScript domain contracts
       ├── Pure TypeScript decision engine
       └── Local history adapter
             └── localStorage (browser-local, not encrypted)
```

The V1 engine is pure TypeScript and must not depend on React, browser APIs, storage, network access, or an LLM. The UI calls the engine with validated domain inputs and renders the structured result.

## Approved technology responsibilities

| Concern | Technology | Boundary |
|---|---|---|
| Web application | Next.js App Router + React | Routing, rendering, interaction |
| Domain and client logic | Strict TypeScript | Contracts and V1 decision engine |
| Styling | Tailwind CSS | Design-system implementation |
| Input validation | Zod | UI and client boundaries |
| Python services, if justified | FastAPI + Pydantic | Explicit server-side workloads only |
| Analytics, if justified | Python | Descriptive/statistical analysis, never hidden verdict logic |
| Persistent database, if justified | PostgreSQL | Server-side records only after product approval |
| Python database access | SQLAlchemy | Only when Python persistence exists |
| Tests | Vitest + Pytest | TypeScript and Python responsibilities |
| JS/Python package managers | npm / uv | Separate ecosystems |

Do not install or scaffold every technology in advance. V1 can be entirely Next.js and TypeScript.

## Dependency direction

- UI depends on domain contracts and application use cases.
- The decision engine depends only on domain types and deterministic helpers.
- Persistence adapters implement interfaces defined by the application/domain boundary.
- External services, if introduced later, sit behind explicit adapters.
- Domain logic must not import UI, storage, HTTP clients, analytics SDKs, or framework modules.

## Future service boundary

Introduce FastAPI only for a concrete server-side requirement such as a protected integration or server-side workload. Define a versioned API schema, validate requests and responses with Pydantic, and add contract-parity tests. Do not port or duplicate the financial verdict engine in Python.

## Data flow and trust boundaries

1. User enters purchase and financial information.
2. UI validates shape and basic constraints.
3. Domain validation rejects invalid or unsafe values.
4. The engine calculates only from known inputs and approved rules.
5. Decision Intelligence returns scores or explicit unknown states, reasons, missing fields, assumptions, and next steps.
6. The UI displays both assessment dimensions separately.
7. Optional history is stored locally only after clear user action.

Never send financial inputs to third parties in V1. Do not log them.

## Architectural invariants

- Money uses integer Rupiah; no floating-point money arithmetic.
- Unknown is not zero.
- Protected savings are not spendable by default.
- Credit limits are never income or cash.
- The user retains the final decision.
- No authentication, bank sync, external analytics, or server database is required for V1.
- No deployment, CI workflow, or production infrastructure is implied by this document.

## Related references

- [Product specification](../../SPEC.md)
- [Decision engine](../product/DECISION_ENGINE.md)
- [Domain model](DOMAIN_MODEL.md)
- [API contract policy](API_CONTRACTS.md)
- [Privacy and data handling](../security/PRIVACY_AND_DATA_HANDLING.md)

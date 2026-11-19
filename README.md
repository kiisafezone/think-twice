# THINK TWICE.

**Think twice today. Thank yourself tomorrow.**

THINK TWICE. is a **Personal Financial Decision Companion** that helps people evaluate not only whether they can afford a purchase, but whether the purchase makes sense in the first place.

This repository contains the THINK TWICE. web application, deterministic TypeScript domain engine, brand system, product specifications, architecture decisions, security and privacy guidance, quality standards, and project governance.

## Documentation

### Brand foundation

1. [Brand Messaging Framework](docs/brand/01-brand-messaging-framework.md) — positioning, audiences, value proposition, messaging pillars, and communication system.
2. [Brand Book](docs/brand/02-brand-book.md) — philosophy, values, personality, archetypes, boundaries, and governance.
3. [Visual Identity & Tone of Voice](docs/brand/03-visual-identity-tone-of-voice.md) — visual direction, color palette, typography, verbal identity, and microcopy.
4. [Design System & Content Playbook](docs/brand/04-design-system-content-playbook.md) — product experience, assessment architecture, UI foundations, and content guidance.
5. [Visual Style Guide](docs/brand/STYLE_GUIDE.md) — practical visual and verbal implementation rules.

### Product definition

- [Product Specification](SPEC.md) — V1 scope, domain contracts, financial rules, and acceptance criteria.
- [Decision Engine Specification](docs/product/DECISION_ENGINE.md) — deterministic calculations, scoring constraints, verdict priority, and safety rules.
- [V1 User Journeys](docs/product/USER_JOURNEYS.md) — primary, incomplete-data, financed-purchase, history, and sharing flows.

### Architecture and decisions

- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md) — application boundaries, dependency direction, data flow, and future service criteria.
- [Domain Model](docs/architecture/DOMAIN_MODEL.md) — core entities, payment variants, money/time semantics, and missing-data states.
- [API Contract Policy](docs/architecture/API_CONTRACTS.md) — versioning and validation rules for any future remote service.
- [ADR-0001: Polyglot Architecture](docs/decisions/ADR-0001-polyglot-architecture.md) — technology choices by responsibility.
- [ADR-0002: Local-First V1 Data](docs/decisions/ADR-0002-v1-local-first-data.md) — anonymous V1 persistence and privacy trade-offs.

- [Decision Records Index](docs/decisions/README.md) — chronological product and architecture decisions.
- [ADR-0003: Confirmed Zero and Null Financial Inputs](docs/decisions/ADR-0003-confirmed-zero-and-null-financial-inputs.md) — explicit financial input states and explanation requirements.
- [ADR-0004: Derive Cash-Purchase Upfront Amount](docs/decisions/ADR-0004-derive-cash-upfront.md) — cash upfront is derived from purchase price and fees.
- [ADR-0005: Protected-Savings Opt-In](docs/decisions/ADR-0005-protected-savings-opt-in.md) — explicit designation and disclosure for protected funds.

### Security, privacy, and quality

- [Privacy & Data Handling](docs/security/PRIVACY_AND_DATA_HANDLING.md) — collection, storage, retention, deletion, and sharing rules.
- [Threat Model](docs/security/THREAT_MODEL.md) — assets, trust boundaries, threats, mitigations, and residual risks.
- [Test Strategy](docs/quality/TEST_STRATEGY.md) — domain, integration, privacy, security, and accessibility coverage.
- [Accessibility Requirements](docs/quality/ACCESSIBILITY.md) — WCAG 2.2 AA target and verification expectations.
- [Release Readiness Checklist](docs/operations/RELEASE_CHECKLIST.md) — product, privacy, quality, and operational release gates.
- [Incident Response](docs/operations/INCIDENT_RESPONSE.md) — triage, containment, remediation, and post-incident review.

### Repository governance

- [Agent & Engineering Instructions](AGENTS.md) — architecture boundaries, coding standards, and delivery rules.
- [Task Roadmap & Handoff](TASKS.md) — implementation phases, blockers, and shared agent state.
- [Contributing](CONTRIBUTING.md) — contribution workflow and documentation standards.
- [Security Policy](SECURITY.md) — responsible vulnerability reporting.
- [Code of Conduct](CODE_OF_CONDUCT.md) — community expectations.
- [Changelog](CHANGELOG.md) — notable project changes.
- [Sponsorship Policy](docs/community/SPONSORSHIP.md) — sponsorship principles, transparency, and recognition.
- [Sponsor Acknowledgements](SPONSORS.md) — supporters acknowledged with their permission.

## Repository structure

```text
.github/                  GitHub workflow and contribution templates
docs/                     Product, brand, architecture, security, and quality docs
src/
  app/                    Next.js routes, layout, and global styles
  domain/                 Pure TypeScript contracts and decision engine
  features/
    purchase/
      components/         Purchase intake and behavioral assessment UI
    financial/
      components/         Financial Reality Check and protected-savings UI
    decision/
      components/         Decision Intelligence result, sharing, and history UI
      lib/                 Privacy-safe share-summary builder
    history/
      storage/             Replaceable local decision-history adapter
tests/
  domain/                 Domain and decision-engine tests
  features/               Local-history and share-summary tests
```

Keep route entrypoints thin, feature UI inside its feature folder, and deterministic business rules inside `src/domain/`. Add directories only when they contain real files.

## Core product architecture

The product keeps three connected systems distinct:

- **Purchase Decision Assessment** — evaluates motivation, needs versus wants, urgency, social pressure, alternatives, expected utility, and potential regret.
- **Financial Reality Check** — evaluates available funds, total cost, savings boundaries, existing debt, PayLater, installments, fees, due dates, and cash flow.
- **Decision Intelligence** — combines both assessments transparently and explains the recommendation.

**Purchase Decision Assessment is a non-negotiable core feature.** Financial calculations complement the behavioral assessment; they do not replace it.

## Technology direction

The approved direction is polyglot by responsibility: Next.js, React, strict TypeScript, Tailwind CSS, and Zod for the V1 web application; Python and FastAPI for a future, concrete server-side workload; PostgreSQL only when persistent server-side storage is justified. The V1 decision engine remains deterministic TypeScript. The project does not need every technology installed at the outset.

## Support the project

THINK TWICE. is independently developed. If you find the project useful or want to support its continued development, you can [sponsor the project on GitHub](https://github.com/sponsors/kiisafezone).

Sponsorship is voluntary. It does not buy influence over product decisions, financial assessments, recommendation logic, roadmap priorities, or user data. Read the [Sponsorship Policy](docs/community/SPONSORSHIP.md) for details.

## Project status

The repository now includes the three assessment stages, the deterministic Decision Intelligence engine and result presentation, opt-in local decision history with review/deletion, and a privacy-safe share preview. Financial inputs and raw assessment answers are not persisted; local history stores a limited result summary only after an explicit save action. These latest UI and storage changes still require product-owner Termux validation and manual browser/accessibility review. Production deployment is outside the current implementation milestone. See [TASKS.md](TASKS.md) for the exact handoff and validation status.

## Official brand identity

- **Brand:** THINK TWICE.
- **Tagline:** Think twice today. Thank yourself tomorrow.
- **Category:** Personal Financial Decision Companion
- **Primary language:** Bahasa Indonesia

---

Documents are maintained as separate sources of truth for their respective areas. Update related references together when a product or architecture decision changes.

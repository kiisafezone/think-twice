# THINK TWICE.

**Think twice today. Thank yourself tomorrow.**

THINK TWICE. is a **Personal Financial Decision Companion** that helps people evaluate not only whether they can afford a purchase, but whether the purchase makes sense in the first place.

This repository contains the brand system, product specifications, architecture decisions, security and privacy guidance, quality standards, and project governance for the product.

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

## Core product architecture

The product keeps three connected systems distinct:

- **Purchase Decision Assessment** — evaluates motivation, needs versus wants, urgency, social pressure, alternatives, expected utility, and potential regret.
- **Financial Reality Check** — evaluates available funds, total cost, savings boundaries, existing debt, PayLater, installments, fees, due dates, and cash flow.
- **Decision Intelligence** — combines both assessments transparently and explains the recommendation.

**Purchase Decision Assessment is a non-negotiable core feature.** Financial calculations complement the behavioral assessment; they do not replace it.

## Technology direction

The approved direction is polyglot by responsibility: Next.js, React, strict TypeScript, Tailwind CSS, and Zod for the V1 web application; Python and FastAPI for a future, concrete server-side workload; PostgreSQL only when persistent server-side storage is justified. The V1 decision engine remains deterministic TypeScript. The project does not need every technology installed at the outset.

## Project status

This is currently a documentation-led repository. The documents describe the approved product and target architecture; they do not prove that an application, API, test suite, deployment, security audit, or production service exists. See [TASKS.md](TASKS.md) for the current handoff and unresolved release blockers.

## Official brand identity

- **Brand:** THINK TWICE.
- **Tagline:** Think twice today. Thank yourself tomorrow.
- **Category:** Personal Financial Decision Companion
- **Primary language:** Bahasa Indonesia

---

Documents are maintained as separate sources of truth for their respective areas. Update related references together when a product or architecture decision changes.
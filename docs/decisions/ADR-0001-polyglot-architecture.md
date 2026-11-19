# ADR-0001: Polyglot Architecture by Responsibility

- Status: Accepted
- Date: 2026-11-19

## Context

The product may use multiple languages, but V1 needs a deterministic, testable decision engine and a lightweight anonymous browser experience. Adding a language or service without a workload increases deployment, security, and maintenance cost.

## Decision

- Next.js App Router + React + strict TypeScript for the web application.
- TypeScript is the single source of truth for the V1 deterministic decision engine.
- Tailwind CSS and Zod support UI styling and input validation.
- FastAPI + Pydantic is the approved future path for a concrete server-side/Python workload.
- Python may support statistical analytics, but must not become a hidden verdict authority.
- PostgreSQL + SQLAlchemy are deferred until server-side persistence is justified.
- Vitest and Pytest cover their respective codebases.

## Consequences

V1 can ship without Python, PostgreSQL, authentication, or remote APIs. Future services require versioned contracts and explicit approval. The architecture is polyglot by responsibility, not by technology count.

## Alternatives rejected

- A single-language-only rule: unnecessarily restricts future workloads.
- A mandatory Python microservice from day one: creates operational cost without a current requirement.
- Duplicate financial formulas in TypeScript and Python: risks divergent verdicts.

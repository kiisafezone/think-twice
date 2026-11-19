# TASKS.md

## Last Session Handoff

- Last Agent Used: ChatGPT
- Completed: Added architecture, domain-model, API-contract, privacy, threat-model, testing, accessibility, user-journey, release-readiness, incident-response, and architecture-decision documents. Added repository hygiene files: `.editorconfig`, `.gitattributes`, and `.gitignore`. Rebuilt README documentation index.
- Current Bug / Blocker: Application source tree, package manifests, installed dependencies, and tests have not been verified. Affordability penalty coefficients and rationality answer scales/mappings remain unresolved release blockers. No application code or runtime behavior has been implemented or verified in this work.
- Next Exact Step: Inspect the complete `main` tree and current repository state. Confirm whether application source or manifests exist before scaffolding. Then obtain explicit approval for scoring scales, coefficients, missing-data treatment, and rounding before implementing numeric scores.
- Tests Run: Documentation and repository-asset review only. No application tests or builds run.
- Files Changed: Added 12 documentation files and 3 repository configuration files; updated `README.md` and `TASKS.md`.

## Product Priorities

1. Preserve Purchase Decision Assessment as a first-class system.
2. Build Financial Reality Check as a separate assessment.
3. Combine both through transparent Decision Intelligence.
4. Keep calculations deterministic, explainable, versioned, and tested.
5. Protect privacy and minimize financial data collection.

## Roadmap

### Phase 0 — Repository Reconnaissance

- [ ] Inspect the complete repository tree and current Git state on `main`.
- [ ] Inspect package manifests, source files, tests, and existing application behavior.
- [ ] Verify whether Next.js, TypeScript, Tailwind, Zod, and Vitest are present.
- [ ] Record the actual state; do not infer implementation from documentation.
- [ ] Confirm repository hygiene and existing ignore rules before adding application files.

### Phase 1 — Application Foundation

- [ ] Preserve any existing working implementation.
- [ ] Establish Next.js App Router and strict TypeScript only if absent.
- [ ] Configure Tailwind and Zod only if needed.
- [ ] Add Vitest and a minimal test setup.
- [ ] Keep FastAPI/Python deferred until a concrete server-side workload is approved.
- [ ] Keep PostgreSQL deferred until server-side persistence is justified.
- [ ] Do not add CI/build workflows or deployment configuration without explicit approval.

### Phase 2 — Domain Contracts and Decision Engine

- [ ] Finalize domain contracts from `docs/architecture/DOMAIN_MODEL.md`.
- [ ] Approve affordability ratio bands, coefficients, caps, combination rules, and zero-denominator behavior.
- [ ] Approve rationality scales, answer mappings, not-applicable treatment, and rounding.
- [ ] Reconcile approved rules in `SPEC.md` and `docs/product/DECISION_ENGINE.md` in the same change.
- [ ] Implement integer-Rupiah calculations and deterministic explanations.
- [ ] Implement behavioral scoring and impulse-friction triggers only after scale approval.
- [ ] Add Vitest coverage for formulas, missing data, invalid data, thresholds, and verdict-priority collisions.

### Phase 3 — Assessment Experience

- [ ] Build purchase input flow.
- [ ] Build Purchase Decision Assessment as a first-class experience.
- [ ] Build Financial Reality Check separately.
- [ ] Explain why each financial input is requested.
- [ ] Handle incomplete data without fabricating scores or certainty.
- [ ] Meet the accessibility requirements in `docs/quality/ACCESSIBILITY.md`.

### Phase 4 — Decision Results and Local History

- [ ] Build Decision Intelligence result card.
- [ ] Show behavioral and financial results separately.
- [ ] Explain verdict, factors, assumptions, missing data, and next steps.
- [ ] Add local history behind a replaceable storage abstraction.
- [ ] Implement review and deletion controls.
- [ ] Implement privacy-safe sharing with a preview and sensitive fields excluded by default.

### Phase 5 — Quality and Future Services

- [ ] Follow `docs/quality/TEST_STRATEGY.md`.
- [ ] Review privacy and threat model before public release.
- [ ] Complete the release checklist in `docs/operations/RELEASE_CHECKLIST.md`.
- [ ] Introduce FastAPI/Python only for an approved, concrete server-side workload.
- [ ] Introduce PostgreSQL only when persistent server-side storage is justified.
- [ ] Add Pytest and cross-service contract tests if Python is introduced.
- [ ] Document deployment, secrets, monitoring, rollback, and incident ownership before deployment work.

## Definition of Done

- User-facing behavior matches `SPEC.md`.
- Purchase Decision Assessment remains present and meaningful.
- Behavioral and financial assessments remain distinct.
- Verdicts are deterministic, versioned, and explainable.
- Financial calculations use integer Rupiah and pass edge-case tests.
- Missing and not-applicable values are not silently treated as zero.
- No fake features, dead controls, or unverified claims.
- UI follows `docs/brand/STYLE_GUIDE.md`.
- Privacy, security, and accessibility requirements are respected.
- `TASKS.md` contains an accurate handoff.

## Multi-Agent Handoff Protocol

Every agent updates this section before ending a session:

- Last Agent Used:
- Completed:
- Current Bug / Blocker:
- Next Exact Step:
- Tests Run:
- Files Changed:

Agents must inspect current files before editing, preserve approved decisions, avoid duplicating work, and never invent unresolved product or scoring rules.
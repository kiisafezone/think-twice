# TASKS.md

## Last Session Handoff

- Last Agent Used: ChatGPT
- Completed: Re-read `AGENTS.md`, `SPEC.md`, `docs/product/DECISION_ENGINE.md`, and `TASKS.md`; reconciled the approved V1 scoring methodology and canonical outcome precedence in the three product documents.
- Current Bug / Blocker: Application foundation has not been scaffolded. Documentation rules are now approved and recorded; implementation and edge-case tests remain outstanding. No application source, package manifests, or test suite currently exists.
- Next Exact Step: Begin the approved Phase 1 application foundation on `main`, after inspecting the current repository state and preserving existing files. Establish Next.js App Router, strict TypeScript, Tailwind, Zod, and Vitest only as needed. Do not implement scoring until the app foundation and typed domain contracts are ready; then implement exactly the approved rules in `SPEC.md` and `docs/product/DECISION_ENGINE.md`.
- Tests Run: Documentation and repository-state reconciliation only. No application tests or builds are available yet.
- Files Changed: `SPEC.md`, `docs/product/DECISION_ENGINE.md`, and `TASKS.md`.
- Implementation Status: Not started. No application code or scoring engine has been written.

## Product Priorities

1. Preserve Purchase Decision Assessment as a first-class system.
2. Build Financial Reality Check as a separate assessment.
3. Combine both through transparent Decision Intelligence without combining their scores.
4. Keep calculations deterministic, explainable, versioned, and tested.
5. Protect privacy and minimize financial data collection.

## Approved V1 Scoring Decisions

- Canonical user-facing outcomes: Safe to Buy, Buy with Caution, Wait & Reassess, Financially Risky, Do Not Buy.
- Internal dispositions only: Greenlight, Pause & Reflect, Hard Pass.
- Verdict precedence is top-down: Hard Pass; Financially Risky; Wait & Reassess; then Safe to Buy (affordability at least 80) or Buy with Caution (60–79).
- Do Not Buy is deliberately financial-only in V1. Behavioral concerns alone produce Wait & Reassess.
- A known Hard Pass condition wins even if affordability score is null. A known Financially Risky condition wins over missing data but never over Hard Pass.
- Affordability starts at 100 and subtracts P_cash, P_m, and P_f with a floor of zero. Cash-impact and monthly-burden bands and penalties are specified in both scoring documents.
- For a new financed installment with monthly free cash at or below zero, P_m is 60. P_f is 40 for negative free cash, 30 for zero, and zero for positive free cash. Negative free cash penalty and Hard Pass are intentionally separate safeguards.
- Available cash excludes emergency, earmarked, and protected savings by default. Including protected savings requires explicit, visible opt-in for an exact amount.
- Ratio bands use integer cross-multiplication and safe exact-integer intermediate arithmetic; no float or division for band classification.
- Rationality uses integer dimension scores and integer weights 30/15/15/25/15, with the approved integer formula and half-up adjustment.
- The two low-urgency bands are merged into one neutral answer, "Can wait one month or longer", scored 50.
- Social pressure is a separate required yes/no input. Missing social-pressure answer is critical missing data. Potential regret is a separate qualitative reflection prompt, not a numeric score or independent verdict trigger.
- Any missing required Rationality dimension means null; no neutral defaults, partial scoring, or weight redistribution. UI completeness indicator lists missing answers and why they matter; display-only.
- Show Affordability and Rationality separately. Never show a combined health score. Safe to Buy's 80 cutoff is a presentation distinction, not engine logic.

## Roadmap

### Phase 0 — Repository Reconnaissance

- [x] Inspect the complete repository tree and current Git state on `main`.
- [x] Inspect package manifests, source files, tests, and existing application behavior.
- [x] Verify whether Next.js, TypeScript, Tailwind, Zod, and Vitest are present.
- [x] Record the actual state; do not infer implementation from documentation.
- [x] Confirm repository hygiene and existing ignore rules before adding application files.
- [x] Reconcile approved scoring rules and verdict precedence in product documentation.

**Reconnaissance result:** the repository was documentation-led, with no application source tree, JavaScript or Python package manifest, or test suite. Re-inspect the current tree before scaffolding in case the repository has changed.

### Phase 1 — Application Foundation

- [ ] Re-inspect current `main` tree and existing files before edits.
- [ ] Establish Next.js App Router and strict TypeScript only if absent.
- [ ] Configure Tailwind and Zod only if needed.
- [ ] Add Vitest and a minimal test setup.
- [ ] Preserve all existing documentation and approved product decisions.
- [ ] Keep FastAPI/Python deferred until a concrete server-side workload is approved.
- [ ] Keep PostgreSQL deferred until server-side persistence is justified.
- [ ] Do not add CI/build workflows or deployment configuration without explicit approval.

### Phase 2 — Domain Contracts and Decision Engine

- [ ] Implement typed purchase, financial-profile, assessment, completeness, and decision-result contracts.
- [ ] Implement integer-Rupiah calculations and safe exact-integer intermediate arithmetic.
- [ ] Implement cash-impact and monthly-burden penalties with cross-multiplication only.
- [ ] Implement protected-savings opt-in and visible disclosure contract.
- [ ] Implement integer rationality dimension mappings and weighted formula.
- [ ] Implement required social-pressure input and impulse-friction rules.
- [ ] Implement strict null behavior and display-only completeness details.
- [ ] Implement canonical five-outcome precedence, including null-score/known-Hard-Pass handling.
- [ ] Add Vitest tests for all edge cases listed in `docs/product/DECISION_ENGINE.md`.
- [ ] Verify `SPEC.md` and `docs/product/DECISION_ENGINE.md` remain aligned.

### Phase 3 — Assessment Experience

- [ ] Build purchase input flow.
- [ ] Build Purchase Decision Assessment as a first-class experience.
- [ ] Build Financial Reality Check separately.
- [ ] Explain why each financial and behavioral input is requested.
- [ ] Add explicit protected-savings opt-in with visible amount and consequence.
- [ ] Add social-pressure question and separate potential-regret reflection prompt.
- [ ] Handle incomplete data without fabricating scores or certainty.
- [ ] Meet accessibility requirements in `docs/quality/ACCESSIBILITY.md`.

### Phase 4 — Decision Results and Local History

- [ ] Build Decision Intelligence result card using canonical five-outcome labels.
- [ ] Show Affordability and Rationality as separate results; never combine their scores.
- [ ] Show completeness indicator with missing answers and why they matter.
- [ ] Explain verdict, factors, assumptions, and next steps.
- [ ] Add local history behind a replaceable storage abstraction.
- [ ] Implement review and deletion controls.
- [ ] Implement privacy-safe sharing with a preview and sensitive fields excluded by default.

### Phase 5 — Quality and Future Services

- [ ] Follow `docs/quality/TEST_STRATEGY.md`.
- [ ] Review privacy and threat model before public release.
- [ ] Complete release checklist in `docs/operations/RELEASE_CHECKLIST.md`.
- [ ] Introduce FastAPI/Python only for an approved, concrete server-side workload.
- [ ] Introduce PostgreSQL only when persistent server-side storage is justified.
- [ ] Add Pytest and cross-service contract tests if Python is introduced.
- [ ] Document deployment, secrets, monitoring, rollback, and incident ownership before deployment work.

## Definition of Done

- User-facing behavior matches `SPEC.md`.
- Purchase Decision Assessment remains present and meaningful.
- Behavioral and financial assessments remain distinct.
- Affordability and Rationality are separate; no combined health score.
- Five canonical outcomes follow deterministic, top-down precedence.
- Financial and scoring calculations use exact integer arithmetic.
- Missing and not-applicable values are not silently treated as zero.
- Completeness indicator explains missing answers without scoring them.
- Protected savings are excluded unless explicitly and visibly opted in.
- All documented edge cases have unit tests.
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

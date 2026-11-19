# TASKS.md

## Last Session Handoff

- Last Agent Used: ChatGPT
- Completed: Product owner validated commit `7fcbae6` on Termux: typecheck passed, 11 files / 241 tests passed, and Next.js 16.4.6 Webpack build passed. The Vite native-config ESM warning remains non-blocking.
- Completed this session: Expanded `tests/domain/decision-engine.test.ts` with integration coverage for each required cash/financed missing affordability input, each required Rationality dimension, missing-data precedence, cash use above 100%, cash-use risk over behavioral concerns, positive cash impact with zero monthly free cash, protected-savings opt-in versus no opt-in, separate assessments, all five outcomes and their reason/next-step contracts, and reachable score boundaries 30/35/60/75/80.
- Current Bug / Blocker: The exact score examples 34, 59, and 79 in authoritative inventory cases 1–3 are mathematically unreachable under the approved formula: every penalty in P_cash, P_m, and P_f is a multiple of five, so the resulting affordability score (floored at zero) is always a multiple of five. Do not change formula or inventory without product-owner direction. Coverage now tests the adjacent reachable values around those thresholds (30/35, 55/60, 75/80); the exact inventory remains formally blocked pending reconciliation. Case 19's visible disclosure is a UI requirement and remains Phase 3. Broader payment-instrument mappings and non-monthly schedules remain unsupported/out of scope for the V1 engine input unless explicitly approved.
- Remaining unresolved product/contract items (do not resolve by convenience):
  1. Broader payment-instrument mappings `savings`, `credit_card`, `pay_later`, `installment`, `loan`, and `mixed` to `cash` or `financed` remain undefined; V1 engine accepts only its existing `cash` / `financed` classification.
  2. Non-monthly or irregular repayment schedules remain unsupported and are rejected.
  3. Product confirmation is still needed for installment count >= 1, monthly installment >= 0, and text maximum lengths. Existing schema constraints are validation behavior, not newly approved scoring rules.
  4. Optional work-hours cost and utility-per-use metrics are not required for V1 verdict calculation; omit until source inputs and UI are approved.
  5. Persistence fields `id` and `createdAt` remain storage-layer concerns, excluded from engine input.
  6. Monthly period only; no period normalization. Inputs must remain explicit monthly amounts.
- Next Exact Step: Product owner validates the new test commit on Termux. If validation passes, request a product decision on the unreachable 34/59/79 score examples before declaring the authoritative inventory complete. Then reconcile the authoritative inventory and `SPEC.md` only after approval; continue remaining applicable coverage. Continue on `main`; no CI, deployment configuration, FastAPI, PostgreSQL, UI, optional metrics, payment-instrument mappings, or new dependencies.
- Tests Run: Not run in this GitHub-only test-authoring step. Latest product-owner Termux validation remains `7fcbae6`: typecheck passed, 11 files / 241 tests passed, production build passed. New tests await Termux validation. Current changes await validation.
- Files Changed this session: `tests/domain/decision-engine.test.ts` (commits `ccd6bc1`, `ab29877`) and `TASKS.md`.
- Implementation Status: The domain engine passed product-owner validation at `7fcbae6`. Expanded edge-case tests are authored but await Termux validation. Exact score examples 34/59/79 conflict with the discrete five-point score granularity and require product-owner reconciliation. Optional derived metrics and UI remain out of scope; visible protected-savings disclosure belongs to Phase 3.

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
- Monthly free cash is numeric only when net income and every expense component are explicitly known; unknown income or expenses make it null, never zero. For a new financed installment with confirmed free cash exactly zero, P_m is 60 and P_f is 30. With P_cash = 0, affordability is 10; any positive P_cash makes it lower. Either way, affordability is below 35 and the verdict is Do Not Buy; no exemption applies. For negative free cash, P_m is 60 and P_f is 40, with the separate negative-free-cash Hard Pass rule. For null free cash, financed affordability is null and the outcome is Wait & Reassess unless a higher-priority financial condition is provable.
- Available cash excludes emergency, earmarked, and protected savings by default. Opt-in requires an exact designation no greater than the known protected balance and an affirmative disclosure acknowledgement (ADR-0004).
- Ratio bands use integer cross-multiplication and safe exact-integer intermediate arithmetic; no float or division for band classification.
- Rationality uses integer dimension scores and integer weights 30/15/15/25/15, with the approved integer formula and half-up adjustment.
- The two low-urgency bands are merged into one neutral answer, "Can wait one month or longer", scored 50.
- Social pressure is a separate required yes/no input. Missing social-pressure answer is critical missing data. Potential regret is a separate qualitative reflection prompt, not a numeric score or independent verdict trigger.
- Any missing required Rationality dimension means null; no neutral defaults, partial scoring, or weight redistribution. Any unknown required affordability input also makes affordability null. Cash purchases require known U, A, Y, E, D, and C; financed purchases additionally require known I. UI completeness indicator lists missing answers and why they matter; display-only.
- Every outcome must show a non-judgmental Indonesian reason grounded in the actual matched rule. Do Not Buy guidance suggests a smaller installment, a longer tenor only after comparing total repayment and fees, or waiting.
- The Required edge-case tests section in docs/product/DECISION_ENGINE.md is the authoritative test list; agents must not invent a replacement list.
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

- [x] Re-inspect current `main` tree and existing files before edits.
- [x] Establish Next.js App Router and strict TypeScript only if absent.
- [x] Configure Tailwind and Zod only if needed.
- [x] Add Vitest and a minimal test setup.
- [x] Preserve all existing documentation and approved product decisions.
- [x] Keep FastAPI/Python deferred until a concrete server-side workload is approved.
- [x] Keep PostgreSQL deferred until server-side persistence is justified.
- [x] Do not add CI/build workflows or deployment configuration without explicit approval.
- [x] Run `npm install`, `npm run typecheck`, `npm run test`, and `npm run build`; commit `package-lock.json`. (Validated by the product owner on Termux ARM64 at `d813547`; the build script uses `next build --webpack` because Turbopack native bindings are unavailable on Android ARM64.)

### Phase 2 — Domain Contracts and Decision Engine

- [x] Reconcile the stale statement in `docs/quality/TEST_STRATEGY.md` with the approved, synchronized `SPEC.md` and `DECISION_ENGINE.md` (commit `24890ed`).
- [x] Author typed purchase, financial-profile, assessment, completeness, and decision-result contracts. (Authored; typecheck, tests, and build not yet run. Output shapes in `results.ts` are provisional.)
- [x] Author contract tests for input states, money, payment plans, assessment input, financial profile, outcomes, and validation. (Authored; not yet run. These are contract tests, not scoring tests.)
- [x] Run and verify `npm run typecheck`, `npm run test`, and `npm run build` for the contracts; product owner validated all three on Termux (132 tests passed, production build passed).
- [x] Resolve cash `U` versus `P + F`: cash derives `U = P + F`; financed retains explicit `U` (ADR-0003). Other unresolved items remain explicitly documented in the handoff.
- [x] Implement checked integer-Rupiah addition, including derived cash upfront `U = P + F`, and safe exact-integer intermediate arithmetic. (Cash helper verified by product owner; new monthly/ratio helpers await Termux validation.)
- [x] Implement cash-impact and monthly-burden penalties with BigInt cross-multiplication only. (New tests authored; await Termux validation.)
- [x] Enforce protected-savings opt-in cap, disclosure acknowledgement, and checked effective available cash (ADR-0004); UI disclosure remains Phase 3.
- [x] Implement integer rationality dimension mappings and weighted formula. (Authored; awaits Termux validation.)
- [x] Implement required social-pressure input and impulse-friction rules as pure domain helpers. (Authored; awaits Termux validation. Canonical verdict integration remains pending.)
- [x] Implement strict null behavior, confirmed-zero handling, and display-only completeness details in the domain engine.
- [x] Author canonical five-outcome precedence, including null-score/known-Hard-Pass handling; awaits Termux validation.
- [x] Author non-judgmental Indonesian reason and proportionate next-step copy for all five outcomes; awaits Termux validation.
- [ ] Add Vitest tests for the exact authoritative 37-case edge-case inventory in `docs/product/DECISION_ENGINE.md`; do not create an agent-specific substitute list.
- [x] Add layer-level boundary tests per `TEST_STRATEGY.md`, including both sides of the rationality 49/50 boundary. (Authored; awaits Termux validation.)
- [x] Reconcile protected-savings and result-contract rules across `SPEC.md` and `docs/product/DECISION_ENGINE.md`.

### Separate Backlog (not scheduled; do not expand scaffolding before Phase 2 contract validation passes)

- [ ] Automatically enforce the `src/domain/` boundary (no React, Next.js, browser, storage, or network imports). Currently a convention only; `tsconfig.json` includes DOM types globally. Scope and approach (for example a lint rule or a separate TypeScript project) are not yet decided and need approval before adding any tooling or dependency.

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

- User-facing behavior matches `SPEC.md` and `docs/product/DECISION_ENGINE.md`.
- Every outcome includes an evidence-based, non-judgmental Indonesian reason and proportionate next step.
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

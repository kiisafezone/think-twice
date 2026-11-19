# TASKS.md

## Last Session Handoff

- Last Agent Used: ChatGPT (GitHub direct edits on main).
- Last Product-Owner Validation: Commit ac3bd45 passed npm run typecheck, 277/277 Vitest tests across 11 files, and npm run build on Termux. The Vite native-config ESM warning remained non-blocking. This validation predates the Decision Intelligence, history, and sharing changes listed below.
- Completed This Session: Connected the three validated assessment inputs to the existing deterministic evaluateDecision() engine and added the Decision Intelligence result experience. It displays the five canonical outcomes, separate Affordability and Rationality results, matched reasons, impulse-friction status, missing fields and their purpose, assumptions, and next steps. Added an opt-in local history adapter that stores only a limited result summary (not raw financial amounts or raw assessment answers), plus review, individual deletion, and clear-all controls. Added a preview-first share summary containing only the outcome, decisive reason, and next steps; it excludes item identity, scores, raw answers, and financial inputs. Added server-rendered result integration assertions, storage tests, share-privacy tests, and reconciled the relevant product/privacy documentation.
- Current Blocker: All changes after ac3bd45 are committed to main but have not yet been run through Termux typecheck, Vitest, or production build. Manual browser, keyboard, screen-reader, mobile-reflow, share-sheet, clipboard, and localStorage behavior checks also remain. Do not call V1 complete until these checks and the release checklist are addressed.
- Remaining Unresolved Product/Contract Items: Broader payment-instrument mappings remain undefined; non-monthly schedules remain unsupported; installment and text constraints still require product confirmation; optional work-hours and utility-per-use metrics remain out of scope. Do not expand these items during V1 stabilization without product-owner approval.
- Next Exact Step: In Termux, pull main with git pull --ff-only origin main, then run npm run typecheck && npm run test && npm run build. Fix only errors reproduced by those commands. After automated validation, manually exercise a cash purchase, a financed purchase, incomplete/unknown data, all five outcome paths where feasible, saving/reviewing/deleting history, share preview, native share or clipboard fallback, and keyboard/mobile accessibility. Then complete the release checklist.
- Tests Run This Session: No commands were executed in a local project runtime. Added tests/features/decision-result-panel.test.ts, tests/features/local-decision-history.test.ts, and tests/features/share-summary.test.ts; all are authored but unexecuted. The previous owner-validated baseline at ac3bd45 remains 277/277 tests.
- Files Changed This Session: src/features/history/storage/local-decision-history.ts, src/features/decision/components/decision-result-panel.tsx, src/features/decision/lib/share-summary.ts, src/features/purchase/components/purchase-intake.tsx, src/app/globals.css, tests/features/decision-result-panel.test.ts, tests/features/local-decision-history.test.ts, tests/features/share-summary.test.ts, SPEC.md, README.md, TASKS.md, CHANGELOG.md, docs/security/PRIVACY_AND_DATA_HANDLING.md, and docs/product/USER_JOURNEYS.md.

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
- Available cash excludes emergency, earmarked, and protected savings by default. Opt-in requires an exact designation no greater than the known protected balance and an affirmative disclosure acknowledgement (ADR-0005).
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
- [x] Resolve cash `U` versus `P + F`: cash derives `U = P + F`; financed retains explicit `U` (ADR-0004). Other unresolved items remain explicitly documented in the handoff.
- [x] Implement checked integer-Rupiah addition, including derived cash upfront `U = P + F`, and safe exact-integer intermediate arithmetic. (Validated by product owner on Termux.)
- [x] Implement cash-impact and monthly-burden penalties with BigInt cross-multiplication only. (Validated by product owner on Termux.)
- [x] Enforce protected-savings opt-in cap, disclosure acknowledgement, and checked effective available cash (ADR-0005); first UI disclosure slice is implemented and awaits product-owner validation.
- [x] Implement integer rationality dimension mappings and weighted formula. (Validated by product owner on Termux.)
- [x] Implement required social-pressure input and impulse-friction rules as pure domain helpers. (Validated by product owner on Termux.)
- [x] Implement strict null behavior, confirmed-zero handling, and display-only completeness details in the domain engine.
- [x] Author canonical five-outcome precedence, including null-score/known-Hard-Pass handling. (Validated by product owner on Termux.)
- [x] Author non-judgmental Indonesian reason and proportionate next-step copy for all five outcomes. (Validated by product owner on Termux.)
- [ ] Complete coverage of every applicable case in the authoritative 37-case inventory in `docs/product/DECISION_ENGINE.md`; domain-engine coverage has been expanded and validated (277 tests), while UI-specific disclosure and rendered-result assertions remain Phase 3. Do not create an agent-specific substitute list.
- [x] Add layer-level boundary tests per `TEST_STRATEGY.md`, including both sides of the rationality 49/50 boundary. (Validated by product owner on Termux at `10a3c4d`.)
- [x] Reconcile protected-savings and result-contract rules across `SPEC.md` and `docs/product/DECISION_ENGINE.md`.

### Separate Backlog (not scheduled; do not expand scaffolding before Phase 2 contract validation passes)

- [ ] Automatically enforce the `src/domain/` boundary (no React, Next.js, browser, storage, or network imports). Currently a convention only; `tsconfig.json` includes DOM types globally. Scope and approach (for example a lint rule or a separate TypeScript project) are not yet decided and need approval before adding any tooling or dependency.

### Phase 3 — Assessment Experience

- [x] Build the purchase-details intake step with schema validation, explicit unknown states, and an in-memory summary; continue the multi-step assessment flow in subsequent work.
- [x] Build the first Purchase Decision Assessment UI slice with required need, urgency, alternatives, utility, impulse, and social-pressure questions; keep it separate from financial assessment.
- [x] Build the first separate Financial Reality Check UI for financial-profile inputs and transparent derived cash summaries.
- [x] Explain the purpose of the behavioral questions in the assessment UI.
- [x] Add explicit protected-savings opt-in with visible amount, consequence disclosure, exact cap, and acknowledgement.
- [x] Add the separate social-pressure question and optional potential-regret reflection prompt; potential regret remains qualitative and has no score/verdict effect.
- [x] Handle incomplete Purchase Decision Assessment data with explicit unknown states; never fabricate partial or neutral-default scores.
- [ ] Complete manual accessibility verification against docs/quality/ACCESSIBILITY.md (keyboard, screen reader, focus, zoom/reflow, contrast, and small-screen use). Automated checks alone are not a compliance claim.

### Phase 4 — Decision Results and Local History

- [x] Connect the validated purchase, behavioral, and financial inputs to the existing deterministic evaluateDecision() engine.
- [x] Build Decision Intelligence result presentation using the canonical five-outcome labels.
- [x] Show Affordability and Rationality separately; never combine their scores.
- [x] Show missing fields and why they matter; preserve unavailable/invalid states without partial scores.
- [x] Explain matched verdict reasons, impulse-friction status, assumptions, and next steps.
- [x] Add opt-in local history behind a replaceable localStorage abstraction; persist only a result summary, not raw financial inputs or raw answers.
- [x] Implement saved-summary review, individual deletion, and clear-all controls.
- [x] Implement preview-first sharing through the device share sheet or clipboard, excluding item identity, scores, and sensitive inputs by default.
- [ ] Run new feature tests and the complete suite on Termux; current implementation is awaiting owner validation.

### Phase 5 — Quality and Future Services

- [ ] Run the complete test strategy on the product-owner's Termux environment and resolve only reproduced failures.
- [ ] Manually verify the full user journey, all relevant outcome/unknown-data paths, local history, and share handoff.
- [ ] Complete keyboard, screen-reader, focus, contrast, zoom/reflow, reduced-motion, and mobile accessibility review.
- [x] Reconcile privacy policy and user journeys with the implemented local-history and sharing data boundaries.
- [ ] Review the threat model against the implemented browser-local storage and sharing behavior before public release.
- [ ] Complete release checklist in docs/operations/RELEASE_CHECKLIST.md.
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

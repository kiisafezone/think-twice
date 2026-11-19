# ADR-0003 — Confirmed Zero, Null Financial Inputs, and Outcome Explanations

- **Status:** Accepted
- **Date:** 2026-11-19
- **Decision owners:** THINK TWICE. product owner
- **Related documents:** `SPEC.md`, `docs/product/DECISION_ENGINE.md`, `TASKS.md`

## Context

The approved affordability penalties require a strict distinction between a confirmed zero monthly-free-cash value and unavailable financial information. Treating missing income or expenses as zero would fabricate financial capacity and could produce an incorrect score or verdict. Result explanations must also be consistent, non-judgmental, and understandable in Indonesian.

## Decisions

1. Monthly free cash is `M = Y - E - D - C`. It is numeric only when net monthly income, essential monthly expenses, existing monthly debt payments, and other committed monthly expenses are all known. Explicitly confirmed zero expense values are valid. Any unknown component makes `M = null`.
2. For a financed purchase with confirmed `M = 0`, set `P_m = 60` and `P_f = 30`. When `P_cash = 0`, the affordability score is 10; if `P_cash` is positive, the final score is lower. In either case it remains below 35, so the verdict is Do Not Buy. There is no exemption.
3. For a financed purchase with `M = null`, `P_m` and `P_f` are unknown and affordability is `null`. Return Wait & Reassess unless a Hard Pass or Financially Risky condition is independently provable from known inputs.
4. A cash purchase requires known `U`, `A`, `Y`, `E`, `D`, and `C` for a numeric affordability score. A financed purchase requires those same inputs plus known installment amount `I`. Any unknown required input makes the score null. Known higher-priority verdict conditions remain eligible.
5. Every canonical outcome must include a non-judgmental Indonesian reason tied to the actual rule. Do Not Buy guidance must suggest a smaller installment, a longer tenor only after comparing total repayment and fees, or waiting for financial capacity to improve.
6. `docs/product/DECISION_ENGINE.md` is the authoritative required edge-case test inventory. Agents must use that list rather than inventing a separate or reduced test list.

## Consequences

- Implementations must distinguish known zero, unknown/null, and not-applicable values in domain types and validation.
- UI fields must not silently coerce blank values to zero. If a user has no debt payment or other committed expense, the UI must capture an explicit zero/none confirmation.
- Missing financial data must be visible in completeness explanations.
- The zero-free-cash financed case is intentionally Do Not Buy under the approved score and precedence, even though it does not trigger the separate negative-free-cash rule.
- Result copy must be localized in Indonesian and derived from the actual matched rule.
- Tests must cover confirmed zero, each missing cash-flow component, payment-method-specific required inputs, and verdict precedence.

## Implementation gate

Do not start implementation until this decision is reflected consistently in `SPEC.md`, `docs/product/DECISION_ENGINE.md`, and `TASKS.md`, and no scoring blocker remains unresolved.

# Decision Engine Specification

## Purpose

This document defines the deterministic decision-engine contract for THINK TWICE. It expands the scoring and verdict requirements in the root `SPEC.md`. If the two documents conflict, stop and reconcile them before implementation; do not silently choose one.

The engine evaluates purchase motivation and financial capacity independently, then applies a fixed, explainable decision precedence. It is decision support, not financial, legal, or lending advice.

## System boundaries

1. **Purchase Decision Assessment** evaluates behavioral and practical reasons behind the purchase.
2. **Financial Reality Check** evaluates cash availability, obligations, total cost, and future cash flow.
3. **Decision Intelligence** applies the verdict precedence to the two separate assessment results.

Affordability and Rationality must always be displayed separately. Never create a combined health score or let a strong result in one assessment conceal a material risk in the other.

## Input contract

The domain layer receives validated, typed inputs. UI form state is not an engine contract.

### Purchase data

At minimum:
- Item name and category.
- Purchase price and additional fees.
- Payment method: cash or financed.
- Upfront payment.
- Installment amount and number of installments when financed.
- Whether installment amount already includes fees.
- Need answer (1–5).
- Urgency answer from the approved mapping.
- Alternatives answer (1–5).
- Utility answer (1–5).
- Raw impulse level (1–5).
- Separate social-pressure answer (yes/no).
- Separate potential-regret reflection response (qualitative, optional).

### Financial profile

At minimum:
- Net monthly income.
- Essential monthly expenses.
- Existing monthly debt payments.
- Other committed monthly expenses.
- Available cash, excluding protected savings by default.
- Protected savings, kept separate from available cash.
- Explicit protected-savings opt-in amount, if the user chooses to designate funds for this purchase.

Credit-card limits, PayLater limits, and other credit facilities are borrowing capacity; they are never income, savings, or available cash.

### Missing and invalid values

- Represent unavailable values explicitly as `null` or a typed missing state.
- Do not silently substitute zero for an unknown value.
- Reject negative money inputs and unsafe integer values.
- Never infer a missing answer from another answer.
- Return missing-field identifiers, completeness details, and an explanation of why each missing answer matters.
- An unanswered required rationality dimension makes Rationality null.
- An unanswered social-pressure input is critical missing data because it feeds the impulse-friction verdict trigger.
- Missing critical data produces Wait & Reassess only if no higher-priority Hard Pass or Financially Risky condition is already provable.

### Required affordability inputs and null propagation

The affordability formula requires all relevant inputs; no partial score or default-zero substitution is permitted.

- **Cash purchase:** known upfront amount (`U`), available cash (`A`), net monthly income (`Y`), essential monthly expenses (`E`), existing monthly debt payments (`D`), and other committed monthly expenses (`C`). `P_m = 0` for cash purchases.
- **Financed purchase:** all of the above, plus the new monthly installment amount (`I`). Installment count and fee treatment are additionally required to calculate and disclose total cost, but cannot be used to infer a missing affordability input.

If any required affordability input is unknown, `affordabilityScore = null`. Known facts may still establish an earlier verdict: for example, known `U > A` is Do Not Buy even if `M` is null. A known Financially Risky condition likewise remains effective unless a Hard Pass applies.

## Deterministic financial calculations

All monetary arithmetic uses integer Rupiah. Do not use binary floating-point arithmetic for money or ratio-band classification.

Let:
- `P` = purchase price
- `F` = additional fees not already included elsewhere
- `U` = upfront payment
- `I` = installment amount per period
- `N` = installment count
- `Y` = net monthly income
- `E` = essential monthly expenses
- `D` = existing monthly debt payments
- `C` = other committed monthly expenses
- `A` = available cash after any explicit protected-savings opt-in
- `M` = monthly free cash

### Total cost

Cash purchase:

```text
totalCost = P + F
```

Financed purchase, when installment amount excludes fees:

```text
totalCost = U + (I * N) + F
```

If installment amount is explicitly fee-inclusive, do not add the same fees again. The input contract must identify which interpretation applies.

### Monthly free cash

```text
M = Y - E - D - C
```

Preserve negative values. Never clamp a deficit to zero.

### Confirmed zero versus unknown monthly free cash

`M = Y - E - D - C`. Treat `M` as numeric only when net monthly income (`Y`), essential monthly expenses (`E`), existing monthly debt payments (`D`), and other committed monthly expenses (`C`) are all explicitly known. An expense explicitly confirmed as zero is known; a blank, unavailable, or unanswered expense is `null`.

Monthly free cash is exactly zero only when all components are known and the arithmetic result is zero. Unknown income or any unknown expense component makes `M = null`, never zero.

For a financed purchase with `M = null`, `P_m` and `P_f` cannot be calculated, so `affordabilityScore = null`. Return Wait & Reassess unless a Hard Pass or Financially Risky condition is already independently provable from known inputs. Do not treat null as non-positive for the zero/negative installment penalty.



### Monthly purchase burden

- Cash purchase: zero recurring installment burden.
- Financed purchase: `I` for each month in which the installment is due.

For irregular due dates or non-monthly repayment schedules, represent the schedule explicitly before calculating a monthly burden. Do not pretend every repayment schedule is monthly.

### Available cash and protected savings

Available cash is liquid money the user can actually spend on this purchase, excluding emergency funds, earmarked savings, and other protected savings by default. Credit limits and borrowing capacity are excluded.

Protected savings may be included only after an explicit affirmative opt-in identifying the exact amount designated for this purchase. The UI must visibly disclose the amount being included and that it reduces the balance protected for emergencies or its earmarked purpose. No protected funds are included silently.

If the user intends to pay from protected savings without opting in, those funds remain excluded from `A`. If known `U > A`, the Hard Pass condition applies. If `A` is unknown, affordability is null; a separately provable Hard Pass condition still takes precedence.

### Exact integer ratio comparison

For positive denominator `A`, compare cash use against percentage threshold `p` by comparing `100 * U` with `p * A`. For positive `M`, compare monthly burden by comparing `100 * I` with `p * M`.

Use `BigInt` (or an equivalently safe exact-integer representation) for intermediate products. Do not divide or convert to floating point to classify ratio bands. Equality belongs to the upper-bound band specified in the tables.

Special cases:
- If `U = 0`, cash-impact penalty is zero without division, even if `A = 0`.
- If `U > 0` and known `A = 0`, upfront exceeds available cash and Hard Pass applies.
- If `A` is unknown, do not assume zero.
- Never divide by zero.

### Optional derived metrics

Work-hours cost and utility per use may be calculated only when their denominators are known and positive. They are explanatory metrics and cannot independently create a favorable verdict.

## Affordability assessment

Affordability is an integer from 0 to 100:

```text
affordabilityScore = max(0, 100 - P_cash - P_m - P_f)
```

A numeric score requires all inputs needed to calculate the financial assessment. If a required input is missing, return `score: null`; do not emit a partial score. A known Hard Pass or Financially Risky condition may still determine the final outcome while the score is null.

### Cash-impact penalty: P_cash

For `A > 0`, compare `U/A` using exact integer cross-multiplication:

| Cash use | Penalty |
|---|---:|
| 0–10% inclusive | 0 |
| Above 10% through 25% | 5 |
| Above 25% through 40% | 10 |
| Above 40% through 60% | 20 |
| Above 60% through 80% | 30 |
| Above 80% through 100% | 40 |
| Above 100% | 50 |

If `U = 0`, `P_cash = 0` without a ratio. If `U > 0` and known `A = 0`, Hard Pass applies. Unknown `A` makes the score null unless another outcome can be established from known inputs.

### Monthly-burden penalty: P_m

For a financed purchase with a new installment and positive `M`:

| Monthly burden | Penalty |
|---|---:|
| 0–10% inclusive | 0 |
| Above 10% through 20% | 5 |
| Above 20% through 30% | 10 |
| Above 30% through 40% | 20 |
| Above 40% through 50% | 30 |
| Above 50% through 75% | 40 |
| Above 75% through 100% | 50 |
| Above 100% | 60 |

For a financed purchase adding a new installment:
- If known `M > 0`, calculate `P_m` using the monthly-burden bands.
- If known `M = 0` or `M < 0`, set `P_m = 60` without calculating a ratio.
- If `M = null`, `P_m` is unknown and the affordability score is `null`.

For a cash purchase, `P_m = 0`; `P_f` still requires known `M`.

### Financial-pressure penalty: P_f

- Known `M < 0`: 40.
- Known `M = 0`: 30.
- Known `M > 0`: 0.
- `M = null`: `P_f` is unknown; affordability is `null`.

The negative-free-cash penalty and the Hard Pass rule for a new repayment obligation while `M < 0` are intentionally separate safeguards. One affects the numeric score; the other independently determines the verdict.

## Rationality assessment

Rationality is an integer from 0 to 100, with fixed dimension weights:

| Dimension | Integer weight |
|---|---:|
| Need | 30 |
| Urgency | 15 |
| Alternatives | 15 |
| Utility | 25 |
| Impulse control | 15 |
| **Total** | **100** |

For Need, Alternatives, and Utility, answers are integers 1–5 and map to `(answer - 1) * 25`.

### Need

1. Optional; no clear need.
2. Nice-to-have.
3. Useful but nonessential.
4. Solves a recurring problem.
5. Essential or necessary replacement.

### Urgency

Urgency measures objective timing, not strength of desire. The two lower-urgency bands are intentionally merged because both previously received the same neutral score:

| Answer | Score |
|---|---:|
| Can wait one month or longer | 50 |
| Needed within the next month | 65 |
| Needed within a week for a specific reason | 80 |
| Immediate essential necessity (such as safety or essential equipment failure) | 100 |

Low urgency is neutral, not a penalty. Strong desire or FOMO is not genuine urgency.

### Alternatives

1. No alternatives considered.
2. Alternatives noticed but not compared.
3. Some alternatives compared.
4. Price and quality compared.
5. Compared relevant alternatives such as repair, borrowing, waiting, or secondhand.

### Utility

1. Rarely used or unclear benefit.
2. Occasional use.
3. Regular use.
4. Frequent use.
5. Daily or essential use.

### Impulse control

Raw impulse level is an integer 1–5. Convert it to control points with `(5 - impulseLevel) * 25`:

| Raw level | Meaning | Control score |
|---|---|---:|
| 1 | Planned purchase | 100 |
| 2 | Mild temptation | 75 |
| 3 | Spontaneous desire | 50 |
| 4 | Strong urge | 25 |
| 5 | Strong FOMO or emotional pressure | 0 |

The inverse mapping is intentional: stronger impulse means lower impulse-control points.

### Integer-only weighted formula

All dimension scores are integers from 0 to 100. Use integer arithmetic only:

```text
rationalityScore = floor(
  (30*need + 15*urgency + 15*alternatives
   + 25*utility + 15*impulseControl + 50) / 100
)
```

The `+50` implements round-half-up for a non-negative weighted sum. Use safe integer arithmetic or `BigInt` for intermediate products. Do not use decimal weights or floating-point multiplication.

### Social pressure, impulse friction, and potential regret

Social pressure is a separate required yes/no input; do not infer it from impulse level. Because it feeds a verdict trigger, an unanswered social-pressure answer is critical missing data.

Impulse friction is active when either:
- Raw impulse level is at least 3; or
- Social pressure is present and Need answer is at most 2.

Potential regret is a separate qualitative reflection prompt. It may inform explanatory copy and next steps, but it has no numeric weight and does not independently change the V1 verdict. It is not a substitute for the impulse or social-pressure input.

### Missing answers and completeness

Any unanswered required dimension makes `rationalityScore = null`. Do not use neutral defaults, redistribute weights, or calculate a partial score. An unanswered social-pressure input is also critical missing data.

The UI must show a completeness indicator listing every missing answer and why it matters. This indicator is display-only; it is not a score or penalty. Missing critical data produces Wait & Reassess only when no higher-priority outcome is already established.

## Canonical outcome and verdict precedence

The five Brand Foundation outcomes are the canonical user-facing labels. The three internal dispositions are grouping concepts only:

| User-facing outcome | Internal disposition |
|---|---|
| Safe to Buy | Greenlight |
| Buy with Caution | Greenlight |
| Wait & Reassess | Pause & Reflect |
| Financially Risky | Pause & Reflect |
| Do Not Buy | Hard Pass |

Evaluate the following rules top-down and stop at the first match:

| Priority | Condition | Canonical outcome |
|---|---|---|
| 1 | Affordability score is below 35 | **Do Not Buy** |
| 1 | A new repayment obligation is added while monthly free cash is negative | **Do Not Buy** |
| 1 | Known upfront payment exceeds known available cash | **Do Not Buy** |
| 2 | Affordability score is 35–59 inclusive | **Financially Risky** |
| 2 | Known upfront cash use is strictly above 80% of available cash | **Financially Risky** |
| 3 | Rationality score is below 50 | **Wait & Reassess** |
| 3 | Impulse friction is active | **Wait & Reassess** |
| 3 | Critical data required for a reliable verdict is missing | **Wait & Reassess** |
| 4 | No prior rule applies and affordability is at least 80 | **Safe to Buy** |
| 4 | No prior rule applies and affordability is 60–79 | **Buy with Caution** |

Missing-data precedence:
- A Hard Pass condition proven by known inputs wins even when affordability is null because another required input is missing.
- A Financially Risky condition proven by known inputs wins over missing behavioral or financial data, but never over Hard Pass.
- If no higher-priority condition is provable and a required score or critical input is missing, return Wait & Reassess.
- Never infer Greenlight from incomplete data.

The 80-point Safe to Buy cutoff is a presentation distinction only. It is not a separate engine threshold, score, or penalty. The engine's favorable-decision threshold is affordability at least 60 and rationality at least 50, subject to the preceding rules.

### Do Not Buy scope

Do Not Buy is deliberately financial-only in V1. Low Need, high impulse, social pressure, potential regret, or low Rationality do not independently produce Do Not Buy. Behavioral concerns produce Wait & Reassess unless a higher-priority financial rule applies.

## Result contract

Return a structured result containing:
- Engine/rule version.
- Affordability score or null, status, and reasons.
- Rationality score or null, status, and reasons.
- Separate completeness information for each assessment.
- Derived financial metrics with units and calculation status.
- Impulse-friction status and triggering evidence.
- Canonical five-outcome verdict and internal disposition.
- Ordered verdict reasons showing the first matching priority rule.
- Missing fields and unresolved assumptions.
- Actionable next steps derived from the actual result.

Do not return only a score or color. Never return a combined health score. Every outcome must be traceable to validated inputs and named rules.

## User-facing explanations and next steps

Every canonical outcome must include a clear, non-judgmental Indonesian explanation tied to the actual input and matched rule. Explain the decisive reason first; list supporting factors separately. Never shame, blame, or characterize the user's personality.

For Do Not Buy, explain the financial constraint and suggest practical alternatives: reduce the installment amount, consider a longer tenor only after comparing total repayment and fees, or wait until available cash or monthly free cash improves. A longer tenor must never be described as automatically cheaper or safer.

Each of the other four outcomes also requires a reason and a proportionate next step. A verdict without an evidence-based reason is invalid.

## Required edge-case tests before implementation is considered complete

This is the authoritative V1 edge-case test inventory. Implement and test every applicable case; agents must not invent a replacement list, silently omit cases, or narrow coverage.

1. Affordability 34 produces Do Not Buy; 35 produces Financially Risky.
2. Affordability 59 produces Financially Risky; 60 may proceed to behavioral checks.
3. Affordability 79 produces Buy with Caution; 80 produces Safe to Buy only if no earlier rule applies.
4. Cash use exactly 80% does not trigger the above-80% rule; any value strictly above 80% does.
5. Cash use above 80% with Rationality below 50 produces Financially Risky because financial pressure has higher precedence.
6. Cash use above 100% produces Do Not Buy, not Financially Risky.
7. Upfront exceeds available cash while affordability is null due to another missing field: Do Not Buy still wins.
8. New installment with negative monthly free cash produces Do Not Buy; when inputs are known, the score calculation also applies `P_m = 60` and `P_f = 40`.
9. New installment with confirmed zero monthly free cash applies `P_m = 60` and `P_f = 30`. When `P_cash = 0`, affordability is 10; if `P_cash` is also positive, the final score is lower. In either case the score is below 35 and the verdict is Do Not Buy. No exemption applies. Zero is valid only when income and every expense component are known.
10. Missing net monthly income makes monthly free cash null, never zero; a financed purchase has null affordability and returns Wait & Reassess unless a Hard Pass or Financially Risky condition is independently provable.
11. Missing essential monthly expenses makes monthly free cash null, never zero; a financed purchase has null affordability and returns Wait & Reassess unless a higher-priority condition is provable.
12. Missing existing monthly debt payments makes monthly free cash null, never zero; do not silently substitute zero.
13. Missing other committed monthly expenses makes monthly free cash null, never zero; do not silently substitute zero.
14. A cash purchase with any required affordability input missing returns affordability null; known Hard Pass or Financially Risky conditions still follow precedence.
15. A financed purchase with a missing installment amount returns affordability null; known higher-priority conditions still follow precedence.
16. Cash purchase with negative monthly free cash applies `P_m = 0` and `P_f = 40`; it does not trigger the new-repayment Hard Pass rule.
17. Zero available cash and positive upfront produce Do Not Buy without division by zero.
18. Zero available cash and zero upfront produce `P_cash = 0` without division by zero.
19. Protected savings remain excluded without explicit opt-in; an opt-in includes only the explicitly designated amount and is visibly disclosed.
20. Paying from protected savings without opt-in cannot silently increase available cash; if known available cash is insufficient, Do Not Buy applies.
21. Every cash-impact and monthly-burden band is tested at its exact lower and upper boundaries using integer cross-multiplication.
22. Rationality dimension mappings produce only integer values; impulse levels 1–5 map to 100, 75, 50, 25, and 0.
23. The rationality formula uses integer weights and the `+50` half-up rule, including a case where the weighted sum is exactly halfway.
24. The merged low-urgency answer scores 50; low urgency alone does not lower Rationality.
25. Social pressure = yes with Need = 2 triggers impulse friction; social pressure = no does not trigger that condition.
26. Raw impulse level 3 or higher triggers impulse friction regardless of social-pressure answer.
27. Missing social-pressure answer produces Wait & Reassess when no higher-priority condition applies.
28. Missing any required Rationality dimension yields null, no reweighting, and a completeness explanation.
29. A missing critical answer does not override a known Hard Pass or Financially Risky condition.
30. Low Need plus impulse level 5 and low Rationality, without a financial Hard Pass condition, produces Wait & Reassess, not Do Not Buy.
31. Affordability and Rationality render as separate results; no combined health score is calculated or displayed.
32. Every one of the five canonical outcomes includes a non-judgmental Indonesian reason tied to the actual matched rule and a proportionate next step.
33. Do Not Buy explanation identifies the specific financial constraint and suggests a smaller installment, a longer tenor only after comparing total repayment and fees, or waiting for financial capacity to improve.

## Implementation requirements

Keep the V1 engine as pure TypeScript domain logic, independent of React, browser storage, network calls, and Python services.

Before implementation:
1. Keep this document and `SPEC.md` reconciled.
2. Implement explicit input, assessment, completeness, and result types.
3. Implement exact integer Rupiah arithmetic and exact ratio-band comparisons.
4. Implement the integer-only rationality formula.
5. Implement verdict precedence exactly as documented.
6. Add Vitest coverage for every required formula, boundary, missing-data case, and priority collision in the Required edge-case tests section above. That list is the authoritative test inventory; do not invent a replacement or narrower agent-specific list.
7. Verify UI copy and completeness behavior against the Brand Foundation.

Do not port or duplicate the decision engine in Python. If a future service needs assessment results, expose a versioned contract and verify parity against the TypeScript engine.

## Non-negotiable safeguards

- Never treat credit limits as cash or income.
- Never treat protected savings as spendable by default.
- Never hide negative monthly free cash.
- Never fabricate missing inputs or partial scores.
- Never use an LLM to calculate financial values or determine the verdict.
- Never describe Safe to Buy as a guarantee.
- Never show a combined health score.
- Always show reasoning and preserve the user's final decision.

# SPEC.md

## Product Definition

**THINK TWICE.** is a Personal Financial Decision Companion.
**Tagline:** Think twice today. Thank yourself tomorrow.

It helps users evaluate purchase motivation and financial consequences before spending, borrowing, using PayLater, or committing to installments.

## Core Product Systems

These are three distinct, connected systems. None may be removed.

### 1. Purchase Decision Assessment

Evaluates why the user wants to buy: need versus want, emotional and impulsive motivation, FOMO, social pressure, genuine urgency, alternatives, expected utility, frequency of use, long-term value, and potential regret.

### 2. Financial Reality Check

Evaluates whether the user can afford the purchase: net income, essential expenses, available cash, protected emergency savings, existing debt and installment obligations, PayLater and credit-card commitments, total repayment, fees, due dates, future cash flow, cash impact, and monthly repayment burden.

Credit limits are not income, savings, or available cash.

### 3. Decision Intelligence

Combines both assessments and explains the separate behavioral and financial results, the overall outcome, key reasons, contributing factors, missing data, assumptions, and practical next steps.

The product informs; the user decides. Recommendations are not guarantees.

## V1 User Flow

1. Landing page.
2. Purchase details.
3. Purchase Decision Assessment.
4. Financial Reality Check.
5. Decision Intelligence.
6. Result card with separate Affordability and Rationality results, canonical outcome, reasons, completeness information, and next steps.
7. Optional local save or privacy-safe share.

## V1 Canonical Outcomes

The five Brand Foundation outcomes are the canonical user-facing labels:

- **Safe to Buy**
- **Buy with Caution**
- **Wait & Reassess**
- **Financially Risky**
- **Do Not Buy**

The decision engine may use three internal dispositions—Greenlight, Pause & Reflect, and Hard Pass—for implementation grouping only. These are not additional user-facing outcomes:

- Greenlight maps to Safe to Buy or Buy with Caution.
- Pause & Reflect maps to Wait & Reassess or Financially Risky.
- Hard Pass maps to Do Not Buy.

### Verdict precedence

Evaluate the following rules top-down and stop at the first match:

1. **Do Not Buy / Hard Pass:** any provable Hard Pass condition applies:
   - A calculated affordability score is below 35.
   - A new repayment obligation is added while monthly free cash is negative.
   - Upfront payment exceeds known available cash.
   A Hard Pass condition proven by known inputs takes precedence even when the overall affordability score is null because another required input is missing.
2. **Financially Risky / Pause & Reflect:** affordability is 35–59 inclusive, or known upfront cash use is strictly greater than 80% of available cash.
3. **Wait & Reassess / Pause & Reflect:** rationality is below 50, impulse friction is active, or critical data required for a reliable verdict is missing. Missing data does not override a Hard Pass condition already proven by known inputs.
4. **Otherwise:** affordability 80 or higher maps to Safe to Buy; affordability 60–79 maps to Buy with Caution. These two labels are presentation distinctions only. The engine's Greenlight threshold is affordability at least 60 and rationality at least 50, with no higher-priority condition.

**Do Not Buy is deliberately financial-only in V1.** Low need, high impulse, social pressure, or low rationality do not independently produce Hard Pass. They may produce Wait & Reassess under the behavioral rules. This preserves a distinction between a financially prohibitive condition and a behavioral concern.

If a required score is null and no Hard Pass or Financially Risky condition is already provable, missing critical data produces Wait & Reassess. In particular, a financed purchase with null monthly free cash produces Wait & Reassess unless another higher-priority financial condition is provable. Never infer a score or default to a favorable outcome.

## Domain Contracts

Maintain domain contracts separately from UI and persistence. Core concepts:

- `PurchaseInput`: item, price, category, payment classification, derived cash upfront (P + F) or explicit financed upfront, installment amount/count, fees, need, urgency, alternatives, utility, impulse level, social-pressure answer, and potential-regret reflection.
- `FinancialProfile`: net monthly income, essential expenses, existing debt payments, other committed expenses, available cash, and protected savings.
- `AssessmentResult`: score or `null`, status, reasons, missing fields, completeness details, assumptions, and rule/version identifier.
- `DecisionResult`: separate affordability and rationality results, canonical outcome, internal disposition, explanation, and next steps.

Use discriminated unions for payment methods and verdicts. Keep field names aligned across UI, engine, persistence, and APIs.

## Financial Calculation Rules

All money values are integer Rupiah. Validate non-negative amounts and prevent unsafe integer overflow. Use integer arithmetic for score calculations and ratio-band comparisons. Do not use floating-point ratios or division to determine a band.

- Cash total cost = purchase price + additional fees. For a cash purchase, upfront payment (U) is derived automatically as P + F; do not ask the user to enter the same amount separately.
- Financed total cost = explicit upfront payment + (installment payment × installment count) + additional fees, unless installment payment is explicitly defined as fee-inclusive. For a financed purchase, upfront payment (U) remains a separate user input.
- Monthly free cash = net monthly income − essential expenses − existing debt payments − other committed expenses.
- Monthly purchase burden = installment payment for financed purchases; zero for one-time cash purchases.
- Cash use is the upfront amount compared with available cash.
- Work-hours cost = total cost ÷ net hourly income, only when net hourly income is provided and positive; this is an optional explanatory metric.
- Utility per use = total cost ÷ expected lifetime uses, only when expected uses is a positive integer; this is an optional explanatory metric.

### Monthly free cash: confirmed zero versus unknown

`M = Y - E - D - C`. Monthly free cash is numeric only when net monthly income (`Y`), essential monthly expenses (`E`), existing monthly debt payments (`D`), and other committed monthly expenses (`C`) are all explicitly provided. An expense explicitly confirmed as zero is valid; an omitted or unknown component is `null`, not zero.

Monthly free cash may be treated as exactly zero only when income and essential expenses have been provided and every other expense component in the formula is also known (including an explicitly confirmed zero). If income or any expense component is unknown, set `M = null`; never infer zero from an empty field.

For a financed purchase when `M = null`, the monthly-burden and financial-pressure penalties cannot be established, so affordability is `null`. The verdict is Wait & Reassess unless a Hard Pass or Financially Risky condition is independently provable from known inputs.

### Available cash and protected savings

Available cash means liquid funds the user can actually use for this purchase, excluding emergency funds, earmarked savings, and other protected savings by default. Credit limits and borrowing capacity are never available cash.

Protected savings may be included only through an explicit, affirmative opt-in that identifies the exact amount to designate as available for this purchase. The UI must disclose the amount being included and that this reduces the protected balance available for emergencies or its earmarked purpose. No protected amount is included silently.

If the user intends to fund the upfront payment from protected savings but does not opt in, those funds remain excluded. If known available cash is lower than the upfront amount, the Hard Pass condition applies. If available cash cannot be established, affordability is null and the missing-data rule applies unless another Hard Pass condition is already provable.

### Integer ratio comparisons

For positive denominator `A`, compare a numerator `U` with a percentage threshold `p` by cross-multiplication: compare `100 × U` with `p × A`. For monthly burden `I` and positive monthly free cash `M`, compare `100 × I` with `p × M`. Implement intermediate products with `BigInt` (or an equivalently safe exact-integer representation) so multiplication cannot overflow. Do not divide or convert to floating point to classify a ratio.

Safety:
- Never divide by zero.
- Preserve negative monthly free cash; do not clamp it to zero.
- If available cash is zero and upfront is positive, upfront exceeds available cash and Hard Pass applies. If both are zero, cash-impact penalty is zero without calculating a ratio.
- Protected savings are excluded unless the user explicitly opts in as described above.
- Missing inputs yield `null` or explicit unknown, never a fabricated score.
- Avoid double-counting fees or existing obligations.

### Required inputs and null behavior

A numeric affordability score requires every input used by its payment-method calculation. Do not calculate a partial score or replace an unknown required input with zero.

- **Cash purchase:** derive `U = P + F`; purchase price (`P`) and additional fees (`F`) must both be known, together with available cash (`A`), net monthly income (`Y`), essential monthly expenses (`E`), existing monthly debt payments (`D`), and other committed monthly expenses (`C`). Do not collect a separate upfront amount for cash. `P_m = 0`.
- **Financed purchase:** explicit upfront amount (`U`), available cash (`A`), net monthly income (`Y`), essential monthly expenses (`E`), existing monthly debt payments (`D`), other committed monthly expenses (`C`), and the new monthly installment amount (`I`) must be known. The installment count and fee treatment are required for total-cost disclosure, but do not replace or infer any affordability-score input.

If any required input for the applicable payment method is unknown, `affordabilityScore = null`. A separately provable Hard Pass or Financially Risky condition may still determine the overall outcome under the precedence rules. For example, known `U > A` remains Hard Pass even if income or expenses are unknown.

## Affordability Score

The affordability score is an integer from 0 to 100. Begin at 100 and subtract the following penalties; floor the result at zero:

```text
affordabilityScore = max(0, 100 - P_cash - P_m - P_f)
```

### Cash-impact penalty (`P_cash`)

Cash use is `U / A`, where `A` is available cash. For cash purchases, derive `U = P + F`; for financed purchases, `U` is the explicit upfront input. For `A > 0`, use exact integer cross-multiplication to select the first matching upper-bound band:

| Cash use | Penalty |
|---|---:|
| 0–10% inclusive | 0 |
| Above 10% through 25% | 5 |
| Above 25% through 40% | 10 |
| Above 40% through 60% | 20 |
| Above 60% through 80% | 30 |
| Above 80% through 100% | 40 |
| Above 100% | 50 |

If `U = 0`, `P_cash = 0` without division, including when `A = 0`. If `U > 0` and `A = 0`, Hard Pass applies because upfront exceeds available cash. If `A` is unknown, affordability is null unless a Hard Pass condition can already be established.

### Monthly-burden penalty (`P_m`)

For a financed purchase with a new installment and positive monthly free cash `M`, compare installment amount `I` with `M` using exact integer cross-multiplication:

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
- If known monthly free cash is positive, calculate `P_m` using the monthly-burden bands.
- If known monthly free cash is exactly zero or negative, set `P_m = 60`; do not calculate a ratio with a non-positive denominator.
- If monthly free cash is `null`, `P_m` is unknown and the affordability score is `null`.

For a financed purchase with confirmed `M = 0`, `P_m = 60` and `P_f = 30`. When `P_cash = 0`, the resulting affordability score is 10; if `P_cash` is positive, the final score is lower. In either case it remains below 35 and produces Do Not Buy. No exemption applies.

For a cash purchase, `P_m = 0` regardless of monthly free cash; however, `P_f` still requires a known monthly free-cash value.

### Financial-pressure penalty (`P_f`)

- Known monthly free cash below zero: 40.
- Known monthly free cash equal to zero: 30.
- Known monthly free cash above zero: 0.
- Monthly free cash is `null`: `P_f` is unknown and the affordability score is `null`.

The negative-free-cash penalty and the Hard Pass rule for a new repayment obligation while monthly free cash is negative are intentionally separate safeguards. The penalty lowers the affordability score; the verdict rule independently prohibits adding a new repayment obligation in that condition.

A numeric affordability score requires all inputs needed to establish the relevant financial calculations. If a required input is missing, return `null`, not a partial score. A provable Hard Pass condition may still determine the verdict when the score is null.

## Rationality Score

The rationality score is an integer from 0 to 100, calculated from five integer dimension scores:

| Dimension | Weight |
|---|---:|
| Need | 30 |
| Urgency | 15 |
| Alternatives | 15 |
| Utility | 25 |
| Impulse control | 15 |
| **Total** | **100** |

For Need, Alternatives, and Utility, each answer is an integer from 1 to 5 and maps to `(answer - 1) × 25`, producing an integer score from 0 to 100.

### Need scale

1. Optional; no clear need.
2. Nice-to-have.
3. Useful but nonessential.
4. Solves a recurring problem.
5. Essential or necessary replacement.

### Urgency scale

Urgency measures the objective timing of the need, not the strength of desire. The two low-urgency bands are intentionally merged because both receive the same neutral score:

| Answer | Dimension score |
|---|---:|
| Can wait one month or longer | 50 |
| Needed within the next month | 65 |
| Needed within a week for a specific reason | 80 |
| Immediate essential necessity (for example, safety or essential equipment failure) | 100 |

A low-urgency answer is neutral, not a penalty. A strong desire or FOMO must not be represented as genuine urgency.

### Alternatives scale

1. No alternatives considered.
2. Alternatives noticed but not compared.
3. Some alternatives compared.
4. Price and quality compared.
5. Compared against relevant options such as repair, borrowing, waiting, or secondhand.

### Utility scale

1. Rarely used or unclear benefit.
2. Occasional use.
3. Regular use.
4. Frequent use.
5. Daily or essential use.

### Impulse level and impulse-control score

The raw impulse answer is an integer from 1 to 5. Convert it to impulse-control points with `(5 - impulseLevel) × 25`:

| Impulse level | Meaning | Impulse-control score |
|---|---|---:|
| 1 | Planned purchase | 100 |
| 2 | Mild temptation | 75 |
| 3 | Spontaneous desire | 50 |
| 4 | Strong urge | 25 |
| 5 | Strong FOMO or emotional pressure | 0 |

The inversion is intentional: stronger impulse means lower impulse-control points.

### Integer-only weighted formula

All five dimension scores are integers from 0 to 100. Calculate the final score with integer arithmetic only:

```text
rationalityScore = floor(
  (30*need + 15*urgency + 15*alternatives
   + 25*utility + 15*impulseControl + 50) / 100
)
```

The `+50` implements round-half-up for non-negative integer weighted sums. The implementation must use safe integer arithmetic (or `BigInt` for intermediate products). Do not use decimal weights or floating-point multiplication.

### Social pressure and potential regret

Social pressure is a separate required yes/no input; it must not be inferred from impulse level. Because it feeds a verdict trigger, an unanswered social-pressure question is critical missing data and produces Wait & Reassess unless a higher-priority outcome applies.

Impulse friction is active when either:
- Raw impulse level is 3 or higher; or
- Social pressure is present and Need answer is 2 or lower.

Potential regret is a separate reflection prompt. It is displayed as qualitative context and may inform explanatory copy or next steps, but it has no numeric weight and does not independently change the V1 verdict. It is not silently substituted for impulse or social pressure.

### Missing answers and completeness

Any unanswered required rationality dimension makes `rationalityScore = null`. Do not use neutral defaults, redistribute weights, or calculate a partial score. An unanswered social-pressure question is also critical missing data because the answer feeds a verdict trigger.

The UI must display a completeness indicator listing every missing answer and why it matters. This indicator is explanatory only; it is not a score, penalty, or substitute for the missing answer. Missing data produces Wait & Reassess only when no higher-priority Hard Pass or Financially Risky condition is already established.

## Result Presentation

Show Affordability and Rationality as two separate assessment results, each with its own score or unavailable state, reasons, and completeness information. Never calculate or display a combined health score.

The Safe to Buy cutoff of 80 is a user-facing presentation distinction between Safe to Buy and Buy with Caution. It is not an additional engine score, penalty, or verdict threshold. The engine's favorable-decision threshold remains affordability at least 60 and rationality at least 50, subject to the precedence rules.

## Outcome explanations and next-step guidance

Every result must explain its outcome in clear, non-judgmental Indonesian. The explanation must identify the actual input and rule that caused the outcome; it must not shame, blame, or label the user's behavior or character. If multiple factors apply, show the decisive reason first and supporting factors separately.

For **Do Not Buy**, explain the specific financial constraint without moral judgment. Offer practical alternatives: consider a smaller installment amount, compare a longer tenor only after checking its total repayment and fees, or wait until available cash or monthly free cash improves. Do not imply that extending the tenor is automatically cheaper or safer.

The other four outcomes must also include a reason grounded in the matched rule and a proportionate next step. Never display a generic verdict without its reason.

## Technology Boundaries

- Next.js App Router + React + strict TypeScript for the web app.
- Tailwind CSS and Zod for styling and frontend validation.
- TypeScript owns the deterministic V1 decision engine.
- Python + FastAPI is the backend-services path when a concrete server-side/Python workload is introduced; Pydantic validates API boundaries.
- Do not duplicate the decision engine in Python. Version and test cross-service contracts.
- PostgreSQL and SQLAlchemy are deferred until server-side persistence is justified.
- V1 local history uses an abstraction over localStorage.
- Vitest tests TypeScript; Pytest tests Python services.
- npm manages JavaScript dependencies; uv manages Python dependencies.

## Privacy and Non-Goals

V1 excludes bank/e-wallet sync, automatic transaction tracking, full budgeting, credit-bureau scoring, lending/credit brokering, crypto/investment recommendations, mandatory accounts, and LLM-generated financial calculations or verdicts.

Acceptance:
- Behavioral and financial assessments appear separately.
- No combined health score is shown.
- Verdict follows deterministic top-down priority rules and canonical five-outcome labels.
- Every result explains reasons, assumptions, and missing data.
- Money calculations and score calculations use exact integer arithmetic.
- Critical edge cases have unit tests.
- Local history works without mandatory authentication.
- Share output excludes sensitive financial details by default.

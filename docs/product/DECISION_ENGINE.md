# Decision Engine Specification

## Purpose

This document defines the deterministic decision-engine contract for THINK TWICE. It expands the scoring and verdict requirements in the root `SPEC.md`. If the two documents conflict, stop and reconcile them before implementation; do not silently choose one.

The engine evaluates both purchase motivation and financial capacity. It must explain its output and preserve user agency. It is decision support, not financial, legal, or lending advice.

## System boundaries

The engine has three logical stages:

1. **Purchase Decision Assessment** evaluates the behavioral and practical reasons behind the purchase.
2. **Financial Reality Check** evaluates cash availability, obligations, total cost, and future cash flow.
3. **Decision Intelligence** combines the two results using the fixed verdict priority below.

The behavioral and financial assessments must remain independently visible in the result. A strong result in one dimension must not conceal a material risk in the other.

## Input contract

The domain layer must receive validated, typed inputs. UI form state is not an engine contract.

### Purchase data

At minimum, model:

- Item name and category.
- Purchase price and additional fees.
- Payment method: cash or financed.
- Upfront payment.
- Installment amount and number of installments when financed.
- Whether the installment amount already includes fees.
- Motivation / need assessment.
- Urgency assessment.
- Alternative options considered.
- Expected utility and expected lifetime uses when supplied.
- Impulse and social-pressure answers.

### Financial profile

At minimum, model:

- Net monthly income.
- Essential monthly expenses.
- Existing monthly debt payments.
- Other committed monthly expenses.
- Available cash.
- Protected savings, kept separate from available cash.

Credit-card limits, PayLater limits, and other credit facilities are liabilities or borrowing capacity; they are never income, savings, or available cash.

### Missing and invalid values

- Represent unavailable values explicitly as `null` or a typed missing state.
- Do not silently substitute zero for an unknown value.
- Reject negative money inputs and unsafe integer values.
- A missing answer must not be inferred from another answer.
- Return missing-field identifiers and explain their effect on the assessment.

## Deterministic financial calculations

All monetary arithmetic uses integer Rupiah. Do not use binary floating-point arithmetic for money. Ratios may use a documented decimal or rational representation internally, with rounding only at a defined presentation boundary.

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
- `A` = available cash

### Total cost

Cash purchase:

`totalCost = P + F`

Financed purchase, when installment amount excludes fees:

`totalCost = U + (I × N) + F`

If installment amount is explicitly fee-inclusive, do not add the same fees again. The input contract must identify which interpretation applies.

### Monthly free cash

`monthlyFreeCash = Y - E - D - C`

Preserve negative values. Never clamp a deficit to zero.

### Monthly purchase burden

- Cash purchase: `0` recurring installment burden.
- Financed purchase: `I` for each month in which the installment is due.

For irregular due dates or non-monthly repayment schedules, the domain contract must represent the schedule explicitly before calculating monthly burden. Do not pretend every repayment schedule is monthly.

### Cash impact

When `A > 0`:

`cashImpactRatio = U / A`

For a cash purchase, `U` is the amount paid upfront and normally equals the cash amount due. If `A = 0`, the ratio is undefined; return an explicit unknown state and apply the separate cash-availability rules. Never divide by zero.

### Optional derived metrics

- Work-hours cost = total cost divided by positive net hourly income, only when supplied.
- Utility per use = total cost divided by a positive integer expected lifetime-use count, only when supplied.

These metrics provide context. They must not independently create a Greenlight verdict.

## Affordability assessment

The affordability score is bounded from 0 to 100. The conceptual model starts at 100 and applies documented penalties for:

- Cash impact.
- Monthly purchase burden relative to available monthly capacity.
- Negative monthly free cash.
- An upfront amount exceeding available cash.

**Scoring is not implementation-ready yet.** The following parameters are unresolved and must not be invented by an implementing agent:

- Cash-impact ratio bands and penalty coefficients.
- Monthly-burden ratio bands and penalty coefficients.
- Penalty caps and combination rules.
- Treatment of zero or unavailable denominators.
- Exact required inputs for a valid score.

Until these parameters are approved and covered by tests, the engine must not emit a numeric affordability score. Return `score: null`, a not-calculable status, and explicit missing or unresolved-rule reasons. The verdict layer must then follow the missing-score rule below.

## Rationality assessment

The rationality score is bounded from 0 to 100 and uses these approved dimension weights:

| Dimension | Weight |
|---|---:|
| Need | 30% |
| Urgency | 15% |
| Alternatives | 15% |
| Utility | 25% |
| Impulse control | 15% |
| **Total** | **100%** |

The following are still release blockers:

- The answer scale for each dimension.
- The mapping from each answer to a normalized dimension score.
- Treatment of unanswered or not-applicable questions.
- Rounding policy for the weighted result.

Do not invent answer mappings or calculate a numeric rationality score until those details are approved. Missing required answers must remain visible and must not be assigned neutral scores by default.

### Impulse-friction conditions

The engine must expose a boolean impulse-friction signal when either approved condition is met:

- Impulse score is greater than or equal to 3 on the agreed scale; or
- Social pressure is present and need score is less than or equal to 2 on the agreed scale.

The scale itself must be finalized before this rule is implemented. Do not reinterpret the thresholds using an invented scale.

## Verdict decision table

Evaluate rules in this exact priority order. Stop at the first matching rule.

| Priority | Condition | Verdict |
|---|---|---|
| 1 | Affordability score is below 35 | **Hard Pass** |
| 1 | A new repayment obligation is added while monthly free cash is negative | **Hard Pass** |
| 1 | Upfront payment exceeds available cash, when both values are known | **Hard Pass** |
| 2 | Affordability score is from 35 through 59 | **Pause & Reflect** |
| 2 | Rationality score is below 50 | **Pause & Reflect** |
| 2 | Impulse-friction signal is active | **Pause & Reflect** |
| 2 | Critical financial or behavioral data required for a reliable verdict is missing | **Pause & Reflect** |
| 3 | Affordability score is at least 60, rationality score is at least 50, and no higher-priority condition applies | **Greenlight** |

If either required score cannot be calculated, do not infer Greenlight. Return **Pause & Reflect**, identify the unavailable score and its cause, and explain what information or approved scoring rule is needed.

A missing available-cash value cannot be treated as zero or as proof that an upfront payment is affordable. Mark the relevant check as unknown and apply the missing-critical-data rule.

## Result contract

The engine should return a structured result containing:

- Engine/rule version.
- Affordability score or `null`, calculation status, and reasons.
- Rationality score or `null`, calculation status, and reasons.
- Derived financial metrics with units and calculation status.
- Impulse-friction status and triggering evidence.
- Final verdict.
- Ordered verdict reasons showing which priority rule matched.
- Missing fields and unresolved assumptions.
- Actionable next steps derived from the actual result.

Do not return only a score or a color. Every verdict must be traceable to validated inputs and named rules.

## Implementation and testing requirements

Keep the engine as pure TypeScript domain logic for V1, independent of React, browser storage, network calls, and Python services.

Before production implementation:

1. Approve all scoring scales, coefficients, caps, and rounding rules.
2. Record the approved changes in `SPEC.md` and this document together.
3. Implement the engine with explicit input and result types.
4. Add unit tests for every formula, threshold, priority collision, missing input, and invalid input.
5. Test exact boundary values: 34/35, 59/60, and 49/50.
6. Test negative monthly free cash, zero available cash, upfront payment equal to available cash, and upfront payment exceeding available cash.
7. Test that fees are never double-counted and protected savings are not treated as spendable.
8. Test that unresolved scores can never produce Greenlight.

Do not port or duplicate these formulas in Python. If a future service needs assessment results, expose a versioned contract and verify parity against the TypeScript engine.

## Non-negotiable safeguards

- Never treat credit limits as cash or income.
- Never treat protected savings as spendable by default.
- Never hide negative monthly free cash.
- Never fabricate missing inputs or partial scores.
- Never use an LLM to calculate financial values or determine the verdict.
- Never describe Greenlight as a guarantee that a purchase is safe.
- Always show the reasoning and preserve the user's final decision.

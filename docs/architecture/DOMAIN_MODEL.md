# Domain Model

## Purpose

Define stable business concepts and relationships before UI forms, persistence schemas, or API payloads are implemented. This is a conceptual contract; it is not a database migration or proof of existing source code.

## Core aggregates

### Purchase

Represents one proposed spending decision.

| Field | Meaning |
|---|---|
| id | Opaque local identifier |
| itemName | Item or service being considered |
| category | User-selected category |
| purchasePrice | Listed purchase price in integer Rupiah |
| additionalFees | Fees not already included elsewhere |
| paymentPlan | Discriminated payment-method structure |
| createdAt | ISO-8601 timestamp |

### PurchaseDecisionAssessment

Captures why the user wants to make the purchase.

- Need versus want.
- Motivation and context.
- Urgency and the reason for urgency.
- Social pressure or obligation.
- Alternatives considered.
- Expected utility and expected lifetime uses, when relevant.
- Impulse-related answers and expected regret.

Do not infer unanswered answers. Not-applicable must be distinct from missing.

### FinancialProfile

Represents the minimum financial context required for the selected assessment.

- Net income and income period/frequency.
- Essential expenses and period.
- Existing debt payments and period.
- Other committed expenses and period.
- Available cash.
- Protected savings, stored separately.
- Optional income timing and repayment schedule when future cash-flow simulation is in scope.

Each amount must have an explicit currency and period where applicable. V1 currency is IDR.

### FinancialRealityCheck

Contains derived metrics and the evidence used to calculate them.

- Total purchase cost.
- Monthly free cash.
- Monthly purchase burden, when schedule supports it.
- Cash impact, when denominator is known and positive.
- Missing inputs and assumptions.
- Calculation status for each metric.

### DecisionResult

Contains the separately visible behavioral and financial assessments, the overall verdict, ordered reasons, engine/rule version, missing data, assumptions, and next steps.

## Payment method model

Use a discriminated union, not a loosely typed collection of optional fields.

Conceptual variants:

- `cash`: amount due now.
- `savings`: amount drawn from a named savings purpose; protected funds remain excluded unless explicitly made available.
- `credit_card`: amount charged, statement/due-date context, fees, and repayment plan where supplied.
- `pay_later`: provider label, upfront amount, installments, fees, due dates, and total repayment when known.
- `installment`: upfront amount, installment schedule, count, interest/fees, and fee-inclusion semantics.
- `loan`: net proceeds, repayment schedule, total repayment, fees, and due dates when known.
- `mixed`: explicit component list whose amounts reconcile to the purchase cost without double counting.

The exact V1 UI scope may be narrower, but the domain must not silently misrepresent one payment method as another.

## Money and time rules

- Store monetary values as safe integers in IDR.
- Reject negative values unless a specific signed derived metric (such as monthly free cash) is intended.
- Check safe-integer overflow before multiplication/addition.
- Never mix monthly, weekly, annual, and per-installment values without explicit period normalization.
- Store timestamps in ISO-8601; distinguish date-only due dates from instants.
- Do not invent exchange rates or convert currencies in V1.

## Missing-data semantics

Represent at least these states distinctly:

- Known value.
- Unknown / not provided.
- Not applicable.
- Invalid input.

Do not coerce unknown or not-applicable to zero. Each derived metric reports whether it is calculated, unavailable due to missing input, or blocked by an unresolved approved rule.

## Privacy classification

Treat purchase descriptions and all financial-profile, debt, income, cash, and assessment answers as sensitive personal data. Identifiers and timestamps can also become sensitive when combined with financial records. See [Privacy and Data Handling](../security/PRIVACY_AND_DATA_HANDLING.md).

## Explicit exclusions

This conceptual model does not authorize bank connections, credential collection, credit-bureau access, lending decisions, credit scoring, or automatic transaction imports.

# SPEC.md

## Product Definition

**THINK TWICE.** is a Personal Financial Decision Companion.
**Tagline:** Think twice today. Thank yourself tomorrow.

It helps users evaluate purchase motivation and financial consequences
before spending, borrowing, using PayLater, or committing to
installments.

## Core Product Systems

These are three distinct, connected systems. None may be removed.

### 1. Purchase Decision Assessment

Evaluates *why* the user wants to buy: - Need versus want. - Emotional
and impulsive motivation. - FOMO and social pressure. - Genuine
urgency. - Alternatives. - Expected utility, frequency of use, and
long-term value. - Potential regret.

### 2. Financial Reality Check

Evaluates *whether* the user can afford the purchase: - Net income and
essential expenses. - Available cash and savings. - Protected emergency
savings. - Existing debt and installment obligations. - PayLater and
credit-card commitments. - Total repayment, fees, due dates, and future
cash flow. - Cash impact and monthly repayment burden.

Credit limits are not income, savings, or available cash.

### 3. Decision Intelligence

Combines both assessments and explains: - Behavioral result. - Financial
result. - Overall verdict. - Key reasons and contributing factors. -
Missing data and assumptions. - Practical next steps.

The product informs; the user decides. Recommendations are not
guarantees.

## V1 User Flow

1.  Landing page.
2.  Purchase details.
3.  Purchase Decision Assessment.
4.  Financial Reality Check.
5.  Decision Intelligence.
6.  Result card with reasons and next steps.
7.  Optional local save or privacy-safe share.

## V1 Verdicts

Use these exact labels: - **Greenlight** - **Pause & Reflect** - **Hard
Pass**

Priority: 1. Hard Pass if affordability score \<35, a new obligation is
added while monthly free cash is negative, or upfront payment exceeds
available cash. 2. Pause & Reflect if affordability is 35--59,
rationality \<50, an impulse-friction trigger is active, or critical
financial data is missing. 3. Greenlight only if affordability \>=60,
rationality \>=50, and no higher-priority condition applies. 4. If a
required score cannot be calculated, do not infer Greenlight; return
Pause & Reflect and identify missing inputs.

## Domain Contracts

Maintain domain contracts separately from UI and persistence. Core
concepts: - `PurchaseInput`: item, price, category, payment method,
upfront amount, installment amount/count, fees, motivation answers,
urgency, alternatives, expected utility/use. - `FinancialProfile`: net
monthly income, essential expenses, existing debt payments, other
committed expenses, available cash, protected savings. -
`AssessmentResult`: score or `null`, status, reasons, missing fields,
assumptions, rule/version identifier. - `DecisionResult`: behavioral
result, financial result, verdict, explanation, next steps.

Use discriminated unions for payment methods and verdicts. Keep field
names aligned across UI, engine, persistence, and APIs.

## Financial Calculation Rules

All money values are integer Rupiah. Validate non-negative amounts and
prevent unsafe integer overflow.

-   Cash total cost = purchase price + additional fees.
-   Financed total cost = upfront payment + (installment payment ×
    installment count) + additional fees, unless installment payment is
    explicitly defined as fee-inclusive. The input contract must make
    this distinction unambiguous.
-   Monthly free cash = net monthly income − essential expenses −
    existing debt payments − other committed expenses.
-   Monthly purchase burden = installment payment for financed
    purchases; zero for one-time cash purchases.
-   Cash impact = upfront payment ÷ available cash, only when available
    cash \>0.
-   Work-hours cost = total cost ÷ net hourly income, only when net
    hourly income is provided and positive.
-   Utility per use = total cost ÷ expected lifetime uses, only when
    expected uses is a positive integer.

Safety: - Never divide by zero. - Preserve negative monthly free cash;
do not clamp it to zero. - If available cash is zero, cash impact is
unknown; apply explicit affordability rules instead. - Protected savings
are not spendable unless the user explicitly identifies an amount as
available. - Missing inputs yield `null` or explicit unknown, never a
fabricated score. - Avoid double-counting fees or existing obligations.

## Affordability Score

Target: 0--100. Begin at 100 and apply documented penalties for cash
impact and monthly burden, with additional penalties for negative free
cash and a cash purchase exceeding available cash.

**Release blocker:** penalty coefficients, ratio thresholds, caps, and
zero-denominator behavior must be explicitly specified and unit-tested
before production. Do not invent or silently tune coefficients. If
required financial inputs are missing, return `null`, not a partial
score.

## Rationality Score

Target: 0--100, weighted dimensions: - Need: 30% - Urgency: 15% -
Alternatives: 15% - Utility: 25% - Impulse control: 15%

Each dimension needs a fixed, documented scoring rubric and bounded
input scale. Do not infer unanswered inputs.

Impulse-friction triggers: - Impulse score \>=3 on the agreed scale;
or - Social pressure is present and need score \<=2.

**Release blocker:** fix the input scale and per-answer scoring map in
code and tests before release.

## Technology Boundaries

-   Next.js App Router + React + strict TypeScript for the web app.
-   Tailwind CSS and Zod for styling and frontend validation.
-   TypeScript owns the deterministic V1 decision engine.
-   Python + FastAPI is the backend-services path when a concrete
    server-side/Python workload is introduced; Pydantic validates API
    boundaries.
-   Do not duplicate the decision engine in Python. Version and test
    cross-service contracts.
-   PostgreSQL and SQLAlchemy are deferred until server-side persistence
    is justified.
-   V1 local history uses an abstraction over localStorage.
-   Vitest tests TypeScript; Pytest tests Python services.
-   npm manages JavaScript dependencies; uv manages Python dependencies.

## Privacy and Non-Goals

V1 excludes bank/e-wallet sync, automatic transaction tracking, full
budgeting, credit-bureau scoring, lending/credit brokering,
crypto/investment recommendations, mandatory accounts, and LLM-generated
financial calculations or verdicts.

Acceptance: - Behavioral and financial assessments appear separately. -
Verdict follows deterministic priority rules. - Every result explains
reasons, assumptions, and missing data. - Money calculations use integer
Rupiah. - Critical edge cases have unit tests. - Local history works
without mandatory authentication. - Share output excludes sensitive
financial details by default.

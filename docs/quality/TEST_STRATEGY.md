# Test Strategy

## Objectives

Prove that financial calculations, behavioral assessment rules, verdict priority, and privacy behavior are correct and explainable. A passing UI test cannot substitute for domain-engine tests.

## Test layers

| Layer | Tool | Responsibility |
|---|---|---|
| Domain unit tests | Vitest | Pure calculations, validation, scoring, verdict priority |
| Component tests | React Testing Library or equivalent, if adopted | Form behavior, accessible interaction, error states |
| Integration tests | Vitest | Assessment flow, storage adapter, result rendering |
| Browser E2E | Playwright, only when adopted | Critical user journeys and responsive behavior |
| Python service tests | Pytest | Only for approved FastAPI services |
| Contract tests | Vitest + Pytest, if service exists | Schema compatibility and engine parity |

Do not add a test dependency until the application scaffold is inspected and the need confirmed.

## Mandatory decision-engine coverage

- Integer Rupiah arithmetic and safe-integer overflow.
- Cash and financed total cost.
- Fee-inclusive versus fee-exclusive installment semantics.
- Monthly free cash, including negative results.
- Zero and missing available cash.
- Upfront payment equal to and greater than available cash.
- Protected savings exclusion.
- Credit limit exclusion from income and available cash.
- Non-monthly or irregular repayment schedule behavior.
- Missing, invalid, and not-applicable input states.
- Every approved score band and penalty boundary.
- Rationality dimension weights and approved answer mappings.
- Impulse-friction conditions on the approved scale.
- Verdict priority collisions and exact boundaries: 34/35, 59/60, 49/50.
- Unresolved or unavailable scores never produce Greenlight.
- Reasons and missing-field identifiers match the rule that fired.

Scoring tests must not be implemented against invented coefficients or answer scales. Those remain release blockers until explicitly approved and synchronized in SPEC.md and DECISION_ENGINE.md.

## Property and invariant tests

Where practical, assert:

- Total cost never decreases when a positive fee is added.
- Unknown values remain unknown and are never silently converted to zero.
- Increasing a known obligation does not improve free cash.
- A new repayment obligation with negative monthly free cash cannot produce Greenlight.
- Protected savings do not increase available cash unless explicitly reclassified by the user.
- Identical validated inputs and rule version always produce identical results.

## Privacy and security tests

- No financial values appear in URLs, logs, analytics payloads, or error messages.
- Share output excludes sensitive fields by default.
- Local history can be reviewed and deleted.
- Invalid user content cannot execute as HTML/script.
- Storage failures do not silently claim that data was saved.
- Sensitive content is not included in telemetry or crash reports.

## Accessibility and UX tests

- Keyboard-only completion of the full assessment.
- Visible focus and semantic labels.
- Screen-reader names and error associations.
- Color is never the only status signal.
- Zoom/reflow and small-screen layouts.
- Reduced-motion preferences where motion is used.
- Indonesian Rupiah and date formatting.

## Release gates

A release candidate requires passing relevant automated tests, manual review of the full flow, privacy/security review, accessibility review, and verification that documentation matches actual behavior. Record exact commands, environment, and results. Never report unrun tests as passing.

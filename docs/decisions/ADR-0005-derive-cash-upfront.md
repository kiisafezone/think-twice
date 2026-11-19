# ADR-0005: Derive Cash-Purchase Upfront Amount

- Status: Accepted
- Date: 2026-11-19
- Decision owner: Product owner

## Context

The V1 financial model defines cash total cost as purchase price plus additional fees (`P + F`). The affordability calculation also uses upfront amount (`U`) to determine cash use against available cash. Treating `U` as a separately entered cash-purchase field would ask users to repeat the total they have already provided and would permit contradictory values.

Financed purchases are different: the upfront payment is only one component of the financed total cost and must remain independently supplied.

## Decision

- For a cash purchase, derive upfront amount as `U = P + F`.
- Do not collect or accept a separate upfront amount in the cash payment-plan contract.
- If purchase price or additional fees are unknown, derived `U` is unknown. Do not substitute zero or calculate cash-use ratios.
- For a financed purchase, keep `U` as an explicit user input.
- Use checked integer Rupiah addition when the engine derives cash `U`; reject or safely report an unrepresentable sum rather than allowing unsafe integer overflow.
- Keep this rule in the TypeScript domain engine as the single source of truth.

## Consequences

- The cash payment-plan schema contains only its financing classification.
- The financed payment-plan schema continues to require explicit upfront amount.
- Cash affordability input completeness depends on known purchase price and fees, in addition to available cash and the monthly financial profile.
- Tests must cover exact derivation, unknown source values, overflow safety, and rejection of a separately supplied cash upfront amount.
- The broader payment-instrument mapping remains unresolved and is not changed by this decision.

## Alternatives considered

1. Ask users to enter `U` separately and require it to equal `P + F`: rejected because it duplicates input and creates an avoidable mismatch state.
2. Ask users to enter `U` and trust it even when it differs from `P + F`: rejected because it conflicts with the documented cash total-cost definition.

# ADR-0005: Enforce Protected-Savings Opt-In

- Status: Accepted
- Date: 2026-11-19
- Decision owner: Product owner

## Context

Emergency, earmarked, and other protected savings are excluded from available cash by default. An opt-in must not expose more money than the user has protected, and the user must understand the consequence before those funds affect an assessment.

## Decision

- The default designation is `not_opted_in`; protected savings do not increase available cash.
- An opt-in provides an exact non-negative Rupiah amount.
- The protected-savings balance must be explicitly known. Unknown or not-applicable balances cannot support an opt-in.
- The designated amount must not exceed the known protected-savings balance.
- The opt-in contract requires an affirmative disclosure acknowledgement. Before collecting it, the UI must show the exact amount included and explain that this reduces funds protected for emergencies or their earmarked purpose.
- Effective available cash is base available cash plus only the designated amount, using checked integer Rupiah addition.
- If base available cash is unknown, effective available cash remains unknown. If addition exceeds the safe-integer range, return an explicit invalid overflow result.
- Credit limits and borrowing capacity remain excluded.

## Consequences

The domain schema rejects over-designation, opt-in against an unknown balance, and opt-in without acknowledgement. The UI disclosure interaction remains a Phase 3 requirement. The effective-available-cash helper is the single source of truth for the engine.

## Alternatives rejected

- Automatically including all protected savings: rejected because it violates explicit designation.
- Accepting an amount greater than the known protected balance: rejected because it fabricates available funds.
- Treating a missing protected balance as zero or sufficient: rejected because unknown is not zero.

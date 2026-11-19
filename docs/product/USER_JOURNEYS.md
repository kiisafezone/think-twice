# V1 User Journeys

## Journey 1: Evaluate a purchase

1. User lands on the product and understands its purpose and limitations.
2. User enters purchase details and selects the intended payment method.
3. User completes Purchase Decision Assessment.
4. User completes the relevant Financial Reality Check.
5. Decision Intelligence presents the behavioral and financial results separately.
6. User reviews the verdict, reasons, assumptions, missing data, and next steps.
7. User may optionally save locally or share a privacy-safe summary.

## Journey 2: Continue with incomplete data

1. User skips an input or marks it unknown/not applicable where supported.
2. The application identifies which metrics cannot be calculated.
3. The engine does not fabricate values or neutral scores.
4. The result explains the limitation and avoids Greenlight when required scores are unavailable.
5. User can return to correct or complete the inputs.

## Journey 3: Evaluate a financed purchase

1. User selects PayLater, credit card, installment, loan, or a supported combination.
2. User enters upfront payment, installment schedule, fees, and total repayment where known.
3. The application clarifies whether fees are already included in the installment amount.
4. Financial Reality Check considers existing obligations and future payment burden.
5. Credit limits are never treated as income or available cash.
6. Unknown interest, fees, or schedules remain explicitly unknown.

## Journey 4: Review local history

1. User explicitly chooses to save a result.
2. The application explains that only the item name, category, timestamp, rule version, separate scores/statuses, explanation, next steps, and missing-field explanations are stored. Raw financial amounts and raw assessment answers are excluded.
3. The application explains that localStorage is browser-local and not encrypted secure storage.
4. User can inspect saved summaries, delete individual records, or delete all saved records.
5. Clearing browser data may remove history; this limitation is disclosed. Corrupt or unavailable storage is not silently overwritten.

## Journey 5: Share a result

1. User chooses Share.
2. The application previews the exact summary, containing only the canonical outcome, decisive reason, and next steps.
3. Item identity, category, scores, financial details, and raw answers are excluded by default.
4. User explicitly initiates the device share sheet or clipboard handoff.
5. No public share URL or server transfer is created. The application does not claim control over information after the user shares it.

## UX rules across journeys

- Do not shame the user or imply that wanting something is inherently wrong.
- Do not make assessment completion feel like a credit application.
- Do not use false urgency, dark patterns, or pressure to borrow.
- Keep the user's final decision explicit.
- Every recommendation must expose the evidence and limitations behind it.
- The primary product value is decision quality, not transaction conversion.

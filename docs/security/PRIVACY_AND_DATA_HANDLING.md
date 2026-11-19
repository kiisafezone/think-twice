# Privacy and Data Handling

## Principles

THINK TWICE. processes information that can reveal a person's financial position and behavior. Collect the minimum data needed for the feature, explain why it is needed, and keep the user in control.

## Data categories

| Category | Examples | Classification |
|---|---|---|
| Purchase context | Item, category, price, motivation answers | Sensitive |
| Financial profile | Income, expenses, available cash, savings | Highly sensitive |
| Debt commitments | PayLater, card balances, installments, due dates | Highly sensitive |
| Assessment output | Scores, verdict, explanations, history | Sensitive |
| Technical data | App version, coarse diagnostics | Minimize; avoid linking to financial records |

Do not collect bank passwords, PINs, OTPs, full card credentials, or banking login details.

## V1 collection and storage

- No mandatory account.
- No bank/e-wallet connection or automatic transaction import.
- No third-party analytics SDK by default.
- No server-side financial data store by default.
- Optional local history uses a replaceable storage abstraction over browser localStorage and is written only after an explicit Save action.
- V1 history stores item name, category, timestamp, rule version, outcome, separate assessment scores/statuses, reasons, next steps, and missing-field explanations. It does not store raw financial amounts, the financial profile, or raw behavioral answers.
- Users can review saved summaries, delete one record, or delete all records. Records remain until deleted or browser data is cleared; no automatic retention period is promised.
- Explain that localStorage is browser-local but not encrypted secure storage; other users or software with access to the browser profile/device may access it.
- If storage is unavailable or corrupt, do not claim success or overwrite the existing content.
- Do not store more raw answers than needed to reproduce or explain a saved result.

## Purpose limitation

Use financial and behavioral data only to perform the requested assessment, display its explanation, and provide an explicitly requested local history feature. Do not use it for advertising, profiling, lending, credit eligibility, or unrelated model training.

## Data lifecycle

Before implementation, define and disclose:

1. Collection: what field is requested and why.
2. Processing: which calculation or user-visible feature uses it.
3. Storage: location, format, and access model.
4. Retention: how long it remains and whether it persists after browser/device changes.
5. Deletion: how users remove one record or all local history.
6. Export: whether and how users can export a human-readable copy.
7. External transfer: any recipient, purpose, and explicit consent.

V1 should default to no external transfer.

## Sharing

- Sharing is opt-in and initiated by the user.
- Default share output contains only the canonical outcome, decisive reason, and next steps. It excludes item identity, category, scores, raw answers, income, expenses, balances, debt-provider details, installment amounts, and due dates.
- Preview the exact content before sharing; the user initiates the device share sheet or clipboard handoff.
- V1 does not create public share URLs or transmit result data to a THINK TWICE. server.
- Never put sensitive values into URL query strings or public share links by default.
- Do not claim that a share is private after the user sends it to another service.

## Logging and diagnostics

Never log raw financial inputs, assessment answers, credentials, access tokens, or full result objects. Diagnostics should use event names, app version, and non-sensitive error codes. Avoid persistent identifiers unless a documented need and approval exist.

## User rights and controls

V1 provides in-product review and deletion for locally saved decision summaries. Editing or exporting history is not part of the current V1 scope; users can delete a record and create a new assessment. Explain limitations of browser storage and that clearing browser data may remove history.

## Future integrations

Any account, cloud sync, bank connection, analytics provider, AI provider, or remote database requires a new privacy review, updated threat model, clear disclosure, retention rules, and explicit approval before implementation.

## Review checklist

- [ ] Every collected field has a documented purpose.
- [ ] No credential collection.
- [ ] No external transfer without disclosure and approval.
- [x] Local storage limitations are disclosed in the history UI.
- [x] Individual and all-history deletion controls are implemented.
- [x] Share preview excludes sensitive data by default.
- [ ] Run the storage and share-summary tests on the product-owner's Termux environment.
- [ ] Product owner manually verifies local history and share behavior on target browsers.
- [ ] Logs and crash reports contain no financial payloads.

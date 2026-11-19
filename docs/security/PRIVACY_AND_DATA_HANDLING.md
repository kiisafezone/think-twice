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
- Optional local history uses a replaceable storage abstraction over browser localStorage.
- Explain that localStorage is browser-local but not encrypted secure storage; other users or software with access to the browser profile/device may access it.
- Provide a clear way to review and delete local history before release.
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
- Default share output excludes income, balances, debt-provider details, due dates, and raw assessment answers.
- Preview the exact content before sharing.
- Never put sensitive values into URL query strings or public share links by default.
- Do not claim that a share is private after the user sends it to another service.

## Logging and diagnostics

Never log raw financial inputs, assessment answers, credentials, access tokens, or full result objects. Diagnostics should use event names, app version, and non-sensitive error codes. Avoid persistent identifiers unless a documented need and approval exist.

## User rights and controls

Before public release, provide clear in-product controls and policy language for viewing, correcting, exporting, and deleting locally stored data. Explain limitations of browser storage and that clearing browser data may remove history.

## Future integrations

Any account, cloud sync, bank connection, analytics provider, AI provider, or remote database requires a new privacy review, updated threat model, clear disclosure, retention rules, and explicit approval before implementation.

## Review checklist

- [ ] Every collected field has a documented purpose.
- [ ] No credential collection.
- [ ] No external transfer without disclosure and approval.
- [ ] Local storage limitations are visible.
- [ ] Delete and export behavior is tested.
- [ ] Share preview excludes sensitive data by default.
- [ ] Logs and crash reports contain no financial payloads.

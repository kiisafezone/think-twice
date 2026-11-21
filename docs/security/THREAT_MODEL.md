# Threat Model

## Scope and status

This is an initial design-stage threat model for the V1 browser application. It is not a penetration test, security audit, or certification. Update it whenever the data flow, storage, authentication, API, or deployment model changes.

## Assets to protect

- Financial profile: income, expenses, available cash, savings.
- Debt and repayment schedules.
- Purchase motivation and behavioral answers.
- Assessment history and verdict explanations.
- Application source, dependencies, and release artifacts.
- Future credentials or integration tokens, if any are approved.

## Trust boundaries

1. User input into the browser.
2. Browser application and local storage.
3. Optional share/export handoff to another application.
4. Future remote API boundary, not part of baseline V1.
5. Build and release supply chain, when implementation/deployment is approved.

## Threat actors and misuse cases

- Another person with access to an unlocked device or browser profile.
- Malicious browser extensions or compromised device software.
- Cross-site scripting that reads page state or local storage.
- Dependency compromise or malicious package update.
- Accidental disclosure through screenshots, copied links, exports, logs, or support tickets.
- Future API abuse, broken authorization, credential leakage, or excessive data retention.

## Initial threat register

| Threat | Impact | Baseline mitigation |
|---|---|---|
| XSS reads financial data | High | Avoid unsafe HTML injection; validate/encode output; restrictive CSP when deployed; dependency review |
| Shared-device access to local history | High | Explain localStorage limitations; offer delete controls; no claim of encryption |
| Sensitive data in URLs | High | Never serialize financial values into query strings or public links |
| Sensitive logs/telemetry | High | Allowlist non-sensitive diagnostics; redact by design |
| Malicious dependency | High | Minimize dependencies; lockfile; review updates and provenance |
| Input tampering / invalid arithmetic | High | Domain validation; safe integer checks; deterministic tests |
| Misleading or incorrect verdict | High | Explicit rules, versioning, boundary tests, transparent reasons |
| Unauthorized future API access | Critical | Server-side authorization, least privilege, security tests, rate limits |
| Secrets committed to Git | High | No secrets in repo; secret scanning/push protection where available |

## Required controls before public V1

- Strict input validation at UI and domain boundaries.
- Context-appropriate output encoding and safe rendering.
- No dynamic evaluation or unsafe HTML rendering for user input.
- Dependency lockfile and review process.
- No secrets or financial payloads in source control/logs.
- Privacy-safe sharing and tested deletion behavior.
- Secure deployment headers and HTTPS when deployment is introduced.
- Error states that do not expose sensitive details.
- Documented vulnerability reporting through SECURITY.md.

## Future backend controls

If a server is approved, add authentication, resource-level authorization, CSRF protections where applicable, rate limits, request-size limits, secure secret storage, audit events that exclude financial payloads, retention/deletion workflows, and API-specific abuse cases. Do not rely on client-side checks for authorization.

## Residual risks

Browser-local storage is accessible to software and people with access to the browser profile. V1 cannot guarantee confidentiality on a compromised or shared device. A user may disclose information after copying or sharing it. Communicate these limitations plainly.

## Review triggers

Revisit this model when adding authentication, remote persistence, analytics, AI providers, bank integrations, public sharing, file uploads, or production deployment.


## Implementation review — 2026-11-21

Scope: static review of the V1 browser-local history adapter, Decision Intelligence result/share component, share-summary builder, privacy notice, Next.js configuration, and repository security policy. This is a scoped design/code review, not a penetration test, dependency audit, or independent security assessment.

### Observed controls

- Decision history is opt-in: the UI writes only after the user activates the save control.
- The storage adapter uses a strict Zod schema and rejects malformed records. Corrupt or unavailable storage is not silently overwritten.
- Persisted history contains the approved summary fields: item name, category, timestamp, rule version, canonical outcome, separate assessment statuses/scores, decisive reason, supporting factors, next steps, and missing-field explanations. It does not persist raw financial amounts, the financial profile, or raw behavioral answers.
- The history UI discloses that localStorage is not encrypted, may be accessible to others with browser-profile/device access, and may be removed when browser data is cleared. Individual and clear-all deletion controls are implemented.
- The share-summary builder accepts only verdict, explanation, and next steps. The UI previews the exact summary and requires a user action before invoking the device share sheet or clipboard. It does not create a THINK TWICE. public URL or server transfer.
- The inspected result component renders user-controlled values as ordinary React text and does not use `dangerouslySetInnerHTML`. This observation is limited to the reviewed component; it is not a repository-wide XSS guarantee.
- A root `SECURITY.md` exists and directs reporters to GitHub private vulnerability reporting where available, or private maintainer contact.

### Residual risks and release actions

| Finding | Current assessment | Required action |
|---|---|---|
| Browser-profile or device access exposes saved history | Accepted V1 residual risk; localStorage is plaintext and contains item identity and assessment summaries | Keep the disclosure visible; advise users not to save sensitive decisions on shared/untrusted devices. Do not describe local history as encrypted. |
| XSS or a malicious browser extension can read same-origin localStorage and page state | High impact; React text rendering reduces one common injection path but does not eliminate all XSS sources | Review every user-controlled rendering and dependency update before release; configure and test a restrictive Content Security Policy when the production origin and hosting model are selected. |
| Security response headers are not configured in the inspected Next.js config | Not an immediate local-development blocker; production hardening remains open | Before public deployment, configure and verify HTTPS plus appropriate CSP, HSTS, frame, MIME-sniffing, referrer, and permissions policies. Avoid a premature CSP that breaks Next.js assets or runtime behavior; test it against the production build. |
| Shared content leaves the browser after user selects a destination | Expected opt-in external transfer; destination privacy is outside application control | Keep exact preview and disclosure; never claim the recipient service keeps the content private. |
| No automatic history expiry | Consistent with current privacy policy; users control deletion | Keep retention wording accurate and provide deletion controls. Revisit only with an approved retention requirement. |

### Review conclusion

The inspected V1 storage and sharing behavior broadly matches `PRIVACY_AND_DATA_HANDLING.md` and the approved local-first architecture. No server-side financial-data endpoint or remote history transfer was identified in the reviewed flow. The primary accepted residual risk is browser-local plaintext history; production security headers and CSP remain release prerequisites, not claims of controls already deployed. Re-review this model if the app adds remote APIs, analytics, authentication, AI providers, uploads, public links, or a production hosting configuration.

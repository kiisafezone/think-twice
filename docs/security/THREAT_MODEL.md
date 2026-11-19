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

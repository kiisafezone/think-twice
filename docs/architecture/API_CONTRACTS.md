# API Contract Policy

## Current V1 position

V1 does not require a remote API. Keep the decision engine local and pure in TypeScript. Do not create placeholder FastAPI routes or deploy a backend merely to demonstrate a polyglot stack.

## When an API becomes justified

A remote service may be proposed only when a concrete requirement cannot be responsibly handled in the browser, for example a protected integration or server-side processing requirement. The proposal must document:

- User-visible capability and why local execution is insufficient.
- Data categories transmitted and purpose for each field.
- Authentication and authorization model.
- Retention, deletion, and incident handling.
- Availability, rate limits, cost, and operational ownership.
- Threat-model update and explicit product approval.

## Contract requirements

- Version endpoints and schemas (for example, `/api/v1`).
- Publish request/response schemas and examples.
- Validate at the boundary; TypeScript uses Zod and Python services use Pydantic.
- Use explicit nullability and distinguish missing, null, and not-applicable.
- Return stable machine-readable error codes and safe user-facing messages.
- Never expose stack traces, secrets, internal identifiers, or sensitive inputs in errors.
- Define idempotency for retryable state-changing operations.
- Define pagination and maximum payload sizes for collection endpoints.
- Use ISO-8601 timestamps and integer IDR amounts.
- Document breaking-change and deprecation policy.

## Decision-engine boundary

The TypeScript engine remains the single source of truth for V1 calculations and verdicts. A future service must call the authoritative engine or consume a versioned, tested equivalent. It must not independently reimplement financial formulas in Python.

## Security requirements

- TLS for all remote traffic.
- Server-side authorization for every protected resource.
- Least-privilege credentials and secret rotation.
- Rate limiting and abuse protection appropriate to the endpoint.
- No financial payloads in application logs, traces, analytics, or error monitoring.
- Explicit user disclosure and approval before any new external data transfer.

No endpoint is considered implemented until code, tests, documentation, and operational controls exist.

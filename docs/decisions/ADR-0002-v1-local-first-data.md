# ADR-0002: Local-First V1 Persistence

- Status: Accepted
- Date: 2026-11-19

## Context

V1 does not require accounts, cross-device synchronization, or bank connectivity. Financial data is sensitive, so collecting and transmitting it creates risk and operational obligations.

## Decision

- No mandatory login.
- No server-side financial profile or decision history by default.
- Optional history is stored through a replaceable abstraction over browser localStorage.
- The application must disclose that localStorage is not encrypted secure storage and can be accessible to others with access to the browser profile/device.
- Users must be able to review and delete saved history.
- Share is opt-in and excludes sensitive financial details by default.

## Consequences

The initial product has limited cross-device continuity. Browser data clearing may remove history. Cloud sync, accounts, and remote storage require a separate architecture and privacy decision.

## Alternatives rejected

- Mandatory account and database: not necessary for V1 and increases collection.
- Silent server-side backup: unacceptable without disclosure and explicit approval.

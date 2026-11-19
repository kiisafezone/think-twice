# Changelog

All notable changes to THINK TWICE. are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses Semantic Versioning when versioned software releases begin.

## [Unreleased]

### Added
- Established the initial brand and product documentation set.
- Documented the three-part product architecture: Purchase Decision Assessment, Financial Reality Check, and Decision Intelligence.
- Added repository contribution, security, and community guidelines.
- Added system architecture, domain model, API contract policy, and architecture decision records.
- Added privacy and data-handling guidance, an initial threat model, and incident-response procedure.
- Added test strategy, accessibility requirements, user journeys, and release-readiness checklist.
- Added repository hygiene configuration: `.editorconfig`, `.gitattributes`, and `.gitignore`.
- Added the Next.js App Router scaffold and deterministic TypeScript domain contracts, calculations, and decision engine with Vitest coverage.
- Added purchase-intake and Purchase Decision Assessment screens, including explicit unknown-answer handling and incomplete-assessment disclosure.
- Added the first separate Financial Reality Check screen with explicit unknown financial inputs, monthly free-cash summary, effective available-cash summary, and protected-savings opt-in disclosure.
- Added a chronological decision-record index and a documented source/features/domain repository layout.

### Changed
- Clarified product positioning as a Personal Financial Decision Companion.
- Expanded README navigation and synchronized the engineering handoff with the documentation baseline.
- Clarified that architecture documents describe target design and do not imply implemented or audited controls.
- Organized feature-specific UI under `src/features/`, retained pure domain logic under `src/domain/`, removed duplicate policy/decision files, and corrected ADR numbering.

### Notes
- The application is in active V1 development; the current UI is an early, in-memory flow and is not a production release.
- The Financial Reality Check currently validates and summarizes financial inputs; final affordability scoring and Decision Intelligence presentation are separate remaining steps.
- Financial Reality Check, protected-savings disclosure UI, Decision Intelligence result presentation, local history, and production deployment remain incomplete.
- Do not infer a released application version from documentation or implementation commits.

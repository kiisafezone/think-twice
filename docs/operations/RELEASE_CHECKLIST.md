# Release Readiness Checklist

This checklist is a gate, not a claim that a release is currently ready.

## Product correctness

- [ ] All three core systems are present and distinct.
- [ ] Purchase Decision Assessment is a first-class flow.
- [ ] Verdict labels and priority match SPEC.md and DECISION_ENGINE.md.
- [ ] Scoring coefficients, scales, mappings, missing-data behavior, and rounding are explicitly approved.
- [ ] No unresolved scoring blocker is bypassed.
- [ ] All money arithmetic uses integer Rupiah and safe-integer checks.
- [ ] Reasons, assumptions, missing data, and next steps are visible.

## Privacy and security

- [ ] Privacy notice matches actual collection, storage, sharing, and retention.
- [ ] No bank credentials, PINs, or OTPs are requested.
- [ ] No sensitive values in logs, URLs, telemetry, or public share output.
- [ ] Local storage limitations are disclosed.
- [ ] Review, export, and deletion behavior works as documented.
- [ ] Threat model reviewed after the final data-flow changes.
- [ ] Dependency and secret scans reviewed where available.
- [ ] Vulnerability reporting path is active.

## Quality and accessibility

- [ ] Relevant automated tests pass.
- [ ] Full primary journey manually tested.
- [ ] Boundary and missing-data cases tested.
- [ ] Keyboard and screen-reader checks completed.
- [ ] Contrast, zoom, mobile reflow, and reduced motion reviewed.
- [ ] Error, empty, loading, and storage-failure states reviewed.
- [ ] Indonesian currency and date formatting verified.

## Operations

- [ ] Deployment target, ownership, rollback, and environment variables documented.
- [ ] HTTPS and security headers configured if deployed.
- [ ] No secrets are committed.
- [ ] Backup/restore requirements documented if remote persistence exists.
- [ ] Incident and vulnerability response contacts are valid.
- [ ] Release notes accurately describe shipped functionality.
- [ ] README and TASKS.md reflect actual repository state.

## Approval

Record release version, commit SHA, date, test evidence, known limitations, and approver before publishing a production release.

# Incident Response

## Scope

This procedure covers suspected exposure of financial data, compromised credentials, malicious dependencies, application vulnerabilities, and incorrect financial decision outputs.

## Severity guidance

- **Critical:** confirmed unauthorized access or exposure of sensitive financial data; active exploitation; systemic verdict defect causing materially unsafe outputs.
- **High:** credible vulnerability with significant impact, compromised release artifact, or widespread incorrect calculation.
- **Medium:** limited defect or exposure with constrained impact and no evidence of broad compromise.
- **Low:** documentation, usability, or low-impact issue without sensitive-data exposure.

## Response steps

1. **Triage:** record discovery time, affected version/commit, scope, and evidence. Do not copy raw financial records into public issues.
2. **Contain:** disable affected feature or integration where possible; revoke compromised credentials; pause releases if integrity is uncertain.
3. **Assess:** identify data categories, affected users, exposure window, exploitability, and whether verdicts/calculations were affected.
4. **Remediate:** patch the root cause, rotate secrets, remove exposed artifacts, and add regression tests.
5. **Validate:** verify the fix and inspect related paths for the same failure mode.
6. **Communicate:** notify affected users and relevant parties when required by applicable law and policy. Do not speculate or minimize.
7. **Learn:** document timeline, root cause, impact, corrective actions, and prevention work.

## Financial calculation incident

If a calculation or verdict defect is suspected, treat affected outputs as unreliable until reproduced and fixed. Preserve the exact engine/rule version and non-sensitive test fixture needed to reproduce. Do not publish real user financial inputs.

## Vulnerability reporting

Follow SECURITY.md. Keep exploit details and sensitive evidence in a private reporting channel rather than public issues.

## Post-incident review

Create a blameless report with timeline, root cause, impact, detection gap, remediation, regression coverage, and owners. Update the threat model, privacy documentation, and release checklist.

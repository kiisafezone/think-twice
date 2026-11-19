# Contributing to THINK TWICE.

Thank you for your interest in improving THINK TWICE.

The project is currently documentation-led. Contributions should preserve the product's purpose, brand identity, and financial-safety principles.

## Before contributing

1. Read the [README](README.md) for project context.
2. Review the relevant documents in [docs/brand](docs/brand/).
3. Check [open issues](../../issues) before starting substantial work.
4. For a major change, open an issue or discussion first so the intended direction can be agreed upon.

## Contribution workflow

1. Fork the repository.
2. Create a focused branch in your fork.
3. Make one coherent change per pull request.
4. Update related documentation when a decision, requirement, or guideline changes.
5. Check spelling, Markdown formatting, links, and consistency.
6. Open a pull request against `main` and explain the problem, solution, scope, and any trade-offs.

Do not submit generated application code, dependencies, deployment configuration, or automation unrelated to the agreed scope.

## Product principles that must be preserved

- Purchase Decision Assessment is a core product system. It must not be removed or replaced by financial calculations.
- Financial Reality Check must distinguish available cash from credit limits and account for existing obligations.
- Decision Intelligence must explain its reasoning, assumptions, and missing data.
- The product supports user decisions; it does not make decisions on the user's behalf.
- Financial calculations must be deterministic, testable, and explainable. Do not use an LLM as the source of financial arithmetic.
- Do not introduce collection of bank credentials or unnecessary sensitive financial data.

## Documentation standards

- Keep the official brand name as `THINK TWICE.`.
- Preserve the official tagline exactly: **Think twice today. Thank yourself tomorrow.**
- Keep the primary product language Indonesian unless a document has a clear reason to use English.
- Prefer precise, actionable language over vague requirements.
- Update all affected references when changing a shared product rule.
- Do not invent features, integrations, metrics, release status, or security guarantees.

## Pull request expectations

A pull request should include:

- What changed and why.
- Which files or product areas are affected.
- Any relevant screenshots for visual changes.
- Tests or validation performed, where applicable.
- Known limitations or follow-up work.

Keep changes focused. Avoid unrelated formatting or rewrites.

## Questions

For questions or proposals, open a GitHub Discussion or issue. For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of creating a public issue.

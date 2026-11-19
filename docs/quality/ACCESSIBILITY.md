# Accessibility Requirements

## Standard

Target WCAG 2.2 Level AA for the user-facing web experience. This is a target, not a compliance claim until independently tested.

## Interaction

- All functionality must be available by keyboard.
- Focus order follows the visual and logical reading order.
- Focus indicators remain visible and are not hidden by sticky UI.
- Do not use color as the only indicator of status, errors, or progress.
- Use semantic HTML and native controls where practical.
- Avoid time limits; any cooling-off timer must not pressure or block the user.

## Forms and assessments

- Every input has a persistent visible label.
- Explain units and periods (for example, per month or per installment).
- Group related controls with fieldset/legend semantics.
- Associate errors with fields and announce validation changes appropriately.
- Preserve user-entered values after recoverable validation errors.
- Distinguish required, optional, unknown, and not-applicable.
- Progress indicators communicate both stage and total progress.

## Visual design

- Meet WCAG AA contrast for text and meaningful UI components.
- Support browser zoom and text resizing without loss of content or function.
- Use responsive layouts and avoid horizontal scrolling for ordinary content.
- Use tabular numerals for money where available.
- Respect reduced-motion preferences.
- Avoid relying on color alone for Greenlight, Pause & Reflect, or Hard Pass.

## Language

- Set the document language to Indonesian for Indonesian content.
- Keep labels concise and explain financial terminology.
- Use plain language without shaming or stigmatizing users.
- Ensure screen-reader output conveys currency, amount, and period clearly.

## Verification

Use automated accessibility checks as a supplement, not a substitute, for keyboard, screen-reader, zoom, contrast, and mobile manual testing. Record known exceptions and remediation before release.

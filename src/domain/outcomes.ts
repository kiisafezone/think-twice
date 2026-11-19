/**
 * Canonical user-facing outcomes and internal dispositions.
 * Source: SPEC.md and docs/product/DECISION_ENGINE.md. This file defines the
 * vocabulary only; verdict precedence logic is not implemented here.
 */

export const OUTCOMES = [
  "safe_to_buy",
  "buy_with_caution",
  "wait_and_reassess",
  "financially_risky",
  "do_not_buy",
] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Canonical user-facing labels (Brand Foundation). */
export const OUTCOME_LABELS = {
  safe_to_buy: "Safe to Buy",
  buy_with_caution: "Buy with Caution",
  wait_and_reassess: "Wait & Reassess",
  financially_risky: "Financially Risky",
  do_not_buy: "Do Not Buy",
} as const satisfies Record<Outcome, string>;

/** Internal grouping only. Never shown as a user-facing outcome. */
export const DISPOSITIONS = [
  "greenlight",
  "pause_and_reflect",
  "hard_pass",
] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

export const OUTCOME_DISPOSITION = {
  safe_to_buy: "greenlight",
  buy_with_caution: "greenlight",
  wait_and_reassess: "pause_and_reflect",
  financially_risky: "pause_and_reflect",
  do_not_buy: "hard_pass",
} as const satisfies Record<Outcome, Disposition>;

/** An outcome paired with the only disposition it may carry. */
export type Verdict = {
  [O in Outcome]: {
    readonly outcome: O;
    readonly disposition: (typeof OUTCOME_DISPOSITION)[O];
  };
}[Outcome];

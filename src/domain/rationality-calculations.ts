import type { RequiredInput } from "./input-state";
import type { AnswerScale, UrgencyAnswer } from "./purchase-assessment";

export type RationalityDimensionScore =
  | { readonly status: "known"; readonly score: number }
  | { readonly status: "unknown" };

export type RationalityScoreResult =
  | {
      readonly status: "calculated";
      readonly score: number;
      readonly dimensions: {
        readonly need: number;
        readonly urgency: number;
        readonly alternatives: number;
        readonly utility: number;
        readonly impulseControl: number;
      };
    }
  | {
      readonly status: "unavailable";
      readonly score: null;
      readonly missingDimensions: readonly (
        | "need"
        | "urgency"
        | "alternatives"
        | "utility"
        | "impulseLevel"
      )[];
    };

export type ImpulseFrictionResult =
  | {
      readonly status: "active";
      readonly evidence: readonly (
        | "impulse_level_at_least_3"
        | "social_pressure_with_low_need"
      )[];
    }
  | { readonly status: "inactive"; readonly evidence: readonly [] }
  | {
      readonly status: "undetermined";
      readonly missingFields: readonly ("need" | "impulseLevel" | "socialPressure")[];
    };

/** Maps the approved 1–5 Need, Alternatives, and Utility scale to 0–100. */
export function mapRationalityScale(answer: AnswerScale): number {
  return (answer - 1) * 25;
}

/** Maps objective urgency timing to the approved integer score. */
export function mapUrgency(answer: UrgencyAnswer): number {
  switch (answer) {
    case "can_wait_one_month_or_longer":
      return 50;
    case "needed_within_one_month":
      return 65;
    case "needed_within_one_week_for_specific_reason":
      return 80;
    case "immediate_essential_necessity":
      return 100;
  }
}

/** Raw impulse is inverse-mapped to impulse-control points. */
export function mapImpulseControl(impulseLevel: AnswerScale): number {
  return (5 - impulseLevel) * 25;
}

/**
 * Calculates the five-dimension rationality score. Any unknown dimension
 * makes the whole score unavailable; no partial weighting or neutral default.
 * Social pressure is intentionally evaluated separately as a verdict trigger.
 */
export function calculateRationalityScore(input: {
  readonly need: RequiredInput<AnswerScale>;
  readonly urgency: RequiredInput<UrgencyAnswer>;
  readonly alternatives: RequiredInput<AnswerScale>;
  readonly utility: RequiredInput<AnswerScale>;
  readonly impulseLevel: RequiredInput<AnswerScale>;
}): RationalityScoreResult {
  const missingDimensions = (
    [
      ["need", input.need],
      ["urgency", input.urgency],
      ["alternatives", input.alternatives],
      ["utility", input.utility],
      ["impulseLevel", input.impulseLevel],
    ] as const
  )
    .filter(([, value]) => value.status === "unknown")
    .map(([field]) => field);

  if (missingDimensions.length > 0) {
    return { status: "unavailable", score: null, missingDimensions };
  }

  // The guard above narrows the collection at runtime; keep each value explicit
  // so TypeScript retains the discriminated-union guarantees.
  if (
    input.need.status !== "known" ||
    input.urgency.status !== "known" ||
    input.alternatives.status !== "known" ||
    input.utility.status !== "known" ||
    input.impulseLevel.status !== "known"
  ) {
    return { status: "unavailable", score: null, missingDimensions };
  }

  const dimensions = {
    need: mapRationalityScale(input.need.value),
    urgency: mapUrgency(input.urgency.value),
    alternatives: mapRationalityScale(input.alternatives.value),
    utility: mapRationalityScale(input.utility.value),
    impulseControl: mapImpulseControl(input.impulseLevel.value),
  };

  const weightedSum =
    30n * BigInt(dimensions.need) +
    15n * BigInt(dimensions.urgency) +
    15n * BigInt(dimensions.alternatives) +
    25n * BigInt(dimensions.utility) +
    15n * BigInt(dimensions.impulseControl);

  const score = Number((weightedSum + 50n) / 100n);

  return { status: "calculated", score, dimensions };
}

/**
 * Social pressure is a separate required answer and never inferred from raw
 * impulse. Unknown trigger inputs keep friction undetermined, not inactive.
 */
export function evaluateImpulseFriction(input: {
  readonly need: RequiredInput<AnswerScale>;
  readonly impulseLevel: RequiredInput<AnswerScale>;
  readonly socialPressure: RequiredInput<boolean>;
}): ImpulseFrictionResult {
  const missingFields = (
    [
      ["need", input.need],
      ["impulseLevel", input.impulseLevel],
      ["socialPressure", input.socialPressure],
    ] as const
  )
    .filter(([, value]) => value.status === "unknown")
    .map(([field]) => field);

  if (missingFields.length > 0) {
    return { status: "undetermined", missingFields };
  }

  if (
    input.need.status !== "known" ||
    input.impulseLevel.status !== "known" ||
    input.socialPressure.status !== "known"
  ) {
    return { status: "undetermined", missingFields };
  }

  const evidence: (
    | "impulse_level_at_least_3"
    | "social_pressure_with_low_need"
  )[] = [];

  if (input.impulseLevel.value >= 3) {
    evidence.push("impulse_level_at_least_3");
  }

  if (input.socialPressure.value && input.need.value <= 2) {
    evidence.push("social_pressure_with_low_need");
  }

  return evidence.length > 0
    ? { status: "active", evidence }
    : { status: "inactive", evidence: [] };
}

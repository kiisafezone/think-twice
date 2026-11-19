import type { Verdict } from "./outcomes";

/**
 * Output contracts only. No scoring, verdict, or explanation logic exists yet.
 * Shape follows SPEC.md (Domain Contracts) and docs/product/DECISION_ENGINE.md
 * (Result contract). Rule identifiers and the explanation vocabulary are not
 * yet defined; they are strings until the engine is specified.
 */

export type AssessmentKind = "affordability" | "rationality";

export interface MissingField {
  readonly assessment: AssessmentKind;
  readonly field: string;
  /** Indonesian, non-judgmental explanation of why this answer matters. */
  readonly whyItMatters: string;
}

/** Display-only. Not a score or penalty. */
export interface Completeness {
  readonly isComplete: boolean;
  readonly missingFields: readonly MissingField[];
}

interface AssessmentResultBase {
  readonly kind: AssessmentKind;
  readonly reasons: readonly string[];
  readonly completeness: Completeness;
  readonly assumptions: readonly string[];
  readonly ruleVersion: string;
}

/** A score is an integer 0-100, or null when it cannot be established. */
export type AssessmentResult =
  | (AssessmentResultBase & {
      readonly status: "calculated";
      readonly score: number;
    })
  | (AssessmentResultBase & {
      readonly status: "unavailable";
      readonly score: null;
    });

export type MetricUnit = "idr" | "idr_per_month";

export type DerivedMetric =
  | {
      readonly key: string;
      readonly unit: MetricUnit;
      readonly status: "calculated";
      readonly value: number;
    }
  | {
      readonly key: string;
      readonly unit: MetricUnit;
      readonly status: "unavailable_missing_input";
      readonly missingFields: readonly string[];
    }
  | {
      readonly key: string;
      readonly unit: MetricUnit;
      readonly status: "blocked_by_unresolved_rule";
      readonly blockedBy: string;
    };

/** Unknown inputs make impulse friction undetermined, never inactive. */
export interface ImpulseFrictionStatus {
  readonly status: "active" | "inactive" | "undetermined";
  readonly evidence: readonly string[];
}

export interface VerdictReason {
  /** Verdict precedence priority (1 = highest). */
  readonly priority: 1 | 2 | 3 | 4;
  readonly ruleId: string;
  /** Indonesian explanation tied to the matched rule. */
  readonly explanation: string;
}

export interface DecisionResult {
  readonly ruleVersion: string;
  /** Affordability and rationality are always separate. No combined score. */
  readonly affordability: AssessmentResult;
  readonly rationality: AssessmentResult;
  readonly derivedMetrics: readonly DerivedMetric[];
  readonly impulseFriction: ImpulseFrictionStatus;
  readonly verdict: Verdict;
  /** Ordered; the first entry is the first matching precedence rule. */
  readonly verdictReasons: readonly VerdictReason[];
  readonly explanation: {
    /** Indonesian. Decisive reason first. */
    readonly decisiveReason: string;
    readonly supportingFactors: readonly string[];
  };
  readonly missingFields: readonly MissingField[];
  readonly assumptions: readonly string[];
  /** Indonesian, proportionate, derived from the actual result. */
  readonly nextSteps: readonly string[];
}

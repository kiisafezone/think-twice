import type { Verdict } from "./outcomes";

export type AssessmentKind = "affordability" | "rationality";

export interface MissingField {
  readonly assessment: AssessmentKind;
  readonly field: string;
  readonly whyItMatters: string;
}

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

export type AssessmentResult =
  | (AssessmentResultBase & { readonly status: "calculated"; readonly score: number })
  | (AssessmentResultBase & { readonly status: "unavailable"; readonly score: null })
  | (AssessmentResultBase & {
      readonly status: "invalid";
      readonly score: null;
      readonly error: "unsafe_integer_overflow";
    });

export type MetricUnit = "idr" | "idr_per_month";
export type DerivedMetric =
  | { readonly key: string; readonly unit: MetricUnit; readonly status: "calculated"; readonly value: number }
  | { readonly key: string; readonly unit: MetricUnit; readonly status: "unavailable_missing_input"; readonly missingFields: readonly string[] }
  | { readonly key: string; readonly unit: MetricUnit; readonly status: "blocked_by_unresolved_rule"; readonly blockedBy: string };

export interface ImpulseFrictionStatus {
  readonly status: "active" | "inactive" | "undetermined";
  readonly evidence: readonly string[];
}

export interface VerdictReason {
  readonly priority: 1 | 2 | 3 | 4;
  readonly ruleId: string;
  readonly explanation: string;
}

export interface DecisionResult {
  readonly ruleVersion: string;
  readonly affordability: AssessmentResult;
  readonly rationality: AssessmentResult;
  /** Optional explanatory metrics are deliberately omitted in V1. */
  readonly derivedMetrics: readonly DerivedMetric[];
  readonly impulseFriction: ImpulseFrictionStatus;
  readonly verdict: Verdict;
  readonly verdictReasons: readonly VerdictReason[];
  readonly explanation: {
    readonly decisiveReason: string;
    readonly supportingFactors: readonly string[];
  };
  readonly missingFields: readonly MissingField[];
  readonly assumptions: readonly string[];
  readonly nextSteps: readonly string[];
}

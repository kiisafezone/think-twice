import { OUTCOME_LABELS } from "../../../domain/outcomes";
import type { DecisionResult } from "../../../domain/results";

/** Share only the decision summary; raw purchase and financial inputs are not accepted. */
export type ShareSummaryInput = Pick<DecisionResult, "verdict" | "explanation" | "nextSteps">;

export function createShareSummary(result: ShareSummaryInput): string {
  const lines = [
    "THINK TWICE.",
    "Hasil Decision Intelligence",
    `Rekomendasi: ${OUTCOME_LABELS[result.verdict.outcome]}`,
    "",
    result.explanation.decisiveReason,
    "",
    "Langkah berikutnya:",
    ...result.nextSteps.map((step) => `• ${step}`),
    "",
    "Hasil ini merupakan alat bantu refleksi berdasarkan informasi yang diberikan, bukan jaminan hasil finansial.",
    "Think twice today. Thank yourself tomorrow.",
  ];
  return lines.join("\n");
}

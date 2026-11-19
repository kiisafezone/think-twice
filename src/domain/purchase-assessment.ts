import { z } from "zod";
import { inputStateSchema, requiredInputSchema } from "./input-state";

/**
 * Purchase Decision Assessment inputs. Scoring and answer-to-score mappings
 * belong to the decision engine and are not implemented here.
 */

/** Integer answer on the documented 1-5 scales (need, alternatives, utility, impulse). */
export const answerScaleSchema = z.literal([1, 2, 3, 4, 5]);
export type AnswerScale = z.infer<typeof answerScaleSchema>;

/** The four approved urgency answers, as stable identifiers (no scores). */
export const URGENCY_ANSWERS = [
  "can_wait_one_month_or_longer",
  "needed_within_one_month",
  "needed_within_one_week_for_specific_reason",
  "immediate_essential_necessity",
] as const;
export const urgencyAnswerSchema = z.enum(URGENCY_ANSWERS);
export type UrgencyAnswer = z.infer<typeof urgencyAnswerSchema>;

const reflectionText = z
  .string()
  .refine((value) => value.trim().length > 0, "blank_text");

export const purchaseAssessmentInputSchema = z.strictObject({
  need: requiredInputSchema(answerScaleSchema),
  urgency: requiredInputSchema(urgencyAnswerSchema),
  alternatives: requiredInputSchema(answerScaleSchema),
  utility: requiredInputSchema(answerScaleSchema),
  /** Raw impulse level 1-5 (not impulse-control points). */
  impulseLevel: requiredInputSchema(answerScaleSchema),
  /** Separate required yes/no input. Never inferred from impulse level. */
  socialPressure: requiredInputSchema(z.boolean()),
  /**
   * Qualitative reflection. No numeric weight and no verdict effect.
   * May be omitted entirely.
   */
  potentialRegret: inputStateSchema(reflectionText).optional(),
});
export type PurchaseAssessmentInput = z.infer<
  typeof purchaseAssessmentInputSchema
>;

import { z } from "zod";
import { financialProfileSchema } from "./financial-profile";
import { purchaseAssessmentInputSchema } from "./purchase-assessment";
import { purchaseInputSchema } from "./purchase";

/** Complete validated input to the (future) decision engine. */
export const decisionInputSchema = z.strictObject({
  purchase: purchaseInputSchema,
  purchaseAssessment: purchaseAssessmentInputSchema,
  financialProfile: financialProfileSchema,
});
export type DecisionInput = z.infer<typeof decisionInputSchema>;

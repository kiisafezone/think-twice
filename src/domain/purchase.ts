import { z } from "zod";
import { requiredInputSchema } from "./input-state";
import { rupiahSchema } from "./money";
import { paymentPlanSchema } from "./payment";

const nonBlankText = z
  .string()
  .refine((value) => value.trim().length > 0, "blank_text");

/**
 * Purchase data for the decision engine. Persistence fields (id, createdAt)
 * belong to the storage layer and are not part of the engine input.
 */
export const purchaseInputSchema = z.strictObject({
  itemName: nonBlankText,
  category: nonBlankText,
  /** Listed purchase price (P). */
  purchasePrice: requiredInputSchema(rupiahSchema),
  /** Additional fees (F) not already included elsewhere. Use known 0 for none. */
  additionalFees: requiredInputSchema(rupiahSchema),
  paymentPlan: paymentPlanSchema,
});
export type PurchaseInput = z.infer<typeof purchaseInputSchema>;

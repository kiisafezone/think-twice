import { z } from "zod";
import { requiredInputSchema, type RequiredInput } from "./input-state";
import { addRupiah, rupiahSchema, type Rupiah } from "./money";
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

/**
 * Derived cash upfront amount. This is a calculation result, not an accepted
 * input state: overflow is reported separately and never coerced to unknown.
 */
export type CashUpfrontDerivation =
  | { readonly status: "known"; readonly value: Rupiah }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

/**
 * Cash purchases pay the full purchase price plus additional fees upfront.
 * Financed purchases do not use this helper; their upfront amount is explicit.
 */
export function deriveCashUpfront(
  purchasePrice: RequiredInput<Rupiah>,
  additionalFees: RequiredInput<Rupiah>,
): CashUpfrontDerivation {
  if (purchasePrice.status !== "known" || additionalFees.status !== "known") {
    return { status: "unknown" };
  }

  try {
    return {
      status: "known",
      value: addRupiah(purchasePrice.value, additionalFees.value),
    };
  } catch (error) {
    if (error instanceof RangeError && error.message === "rupiah_overflow") {
      return { status: "invalid", reason: "unsafe_integer_overflow" };
    }
    throw error;
  }
}

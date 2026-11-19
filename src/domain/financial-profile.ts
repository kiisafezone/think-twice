import { z } from "zod";
import { inputStateSchema, requiredInputSchema, type RequiredInput } from "./input-state";
import { addRupiah, rupiahSchema, type Rupiah } from "./money";

/** Protected savings require an exact, capped opt-in and disclosure acknowledgement. */
export const protectedSavingsDesignationSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("not_opted_in") }),
  z.strictObject({
    status: z.literal("opted_in"),
    amount: rupiahSchema,
    disclosureAcknowledged: z.literal(true),
  }),
]);
export type ProtectedSavingsDesignation = z.infer<typeof protectedSavingsDesignationSchema>;

export const financialProfileSchema = z.strictObject({
  netMonthlyIncome: requiredInputSchema(rupiahSchema),
  essentialMonthlyExpenses: requiredInputSchema(rupiahSchema),
  existingMonthlyDebtPayments: requiredInputSchema(rupiahSchema),
  otherCommittedMonthlyExpenses: requiredInputSchema(rupiahSchema),
  availableCash: requiredInputSchema(rupiahSchema),
  protectedSavings: inputStateSchema(rupiahSchema),
  protectedSavingsDesignation: protectedSavingsDesignationSchema,
}).superRefine((profile, context) => {
  const designation = profile.protectedSavingsDesignation;
  if (designation.status !== "opted_in") return;
  if (profile.protectedSavings.status !== "known") {
    context.addIssue({
      code: "custom",
      path: ["protectedSavings"],
      message: "protected_savings_balance_must_be_known_for_opt_in",
    });
  } else if (designation.amount > profile.protectedSavings.value) {
    context.addIssue({
      code: "custom",
      path: ["protectedSavingsDesignation", "amount"],
      message: "protected_savings_designation_exceeds_known_balance",
    });
  }
});
export type FinancialProfile = z.infer<typeof financialProfileSchema>;

export type EffectiveAvailableCash =
  | { readonly status: "known"; readonly value: Rupiah }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

/** Adds only the designated protected amount to known base available cash. */
export function deriveEffectiveAvailableCash(profile: FinancialProfile): EffectiveAvailableCash {
  if (profile.availableCash.status !== "known") return { status: "unknown" };
  const designated: Rupiah = profile.protectedSavingsDesignation.status === "opted_in"
    ? profile.protectedSavingsDesignation.amount
    : rupiahSchema.parse(0);
  try {
    return { status: "known", value: addRupiah(profile.availableCash.value, designated) };
  } catch (error) {
    if (error instanceof RangeError && error.message === "rupiah_overflow") {
      return { status: "invalid", reason: "unsafe_integer_overflow" };
    }
    throw error;
  }
}

import { z } from "zod";
import { inputStateSchema, requiredInputSchema } from "./input-state";
import { rupiahSchema } from "./money";

/**
 * Protected savings stay excluded from available cash unless the user
 * explicitly opts in with an exact amount. Credit limits and other borrowing
 * capacity have no field here and are rejected as unknown keys.
 */
export const protectedSavingsDesignationSchema = z.discriminatedUnion(
  "status",
  [
    z.strictObject({ status: z.literal("not_opted_in") }),
    z.strictObject({ status: z.literal("opted_in"), amount: rupiahSchema }),
  ],
);
export type ProtectedSavingsDesignation = z.infer<
  typeof protectedSavingsDesignationSchema
>;

export const financialProfileSchema = z.strictObject({
  /** Net monthly income (Y). */
  netMonthlyIncome: requiredInputSchema(rupiahSchema),
  /** Essential monthly expenses (E). */
  essentialMonthlyExpenses: requiredInputSchema(rupiahSchema),
  /** Existing monthly debt payments (D). Use known 0 only when confirmed. */
  existingMonthlyDebtPayments: requiredInputSchema(rupiahSchema),
  /** Other committed monthly expenses (C). Use known 0 only when confirmed. */
  otherCommittedMonthlyExpenses: requiredInputSchema(rupiahSchema),
  /** Available cash excluding protected savings (before any opt-in). */
  availableCash: requiredInputSchema(rupiahSchema),
  /** Protected savings, kept separate from available cash. */
  protectedSavings: inputStateSchema(rupiahSchema),
  protectedSavingsDesignation: protectedSavingsDesignationSchema,
});
export type FinancialProfile = z.infer<typeof financialProfileSchema>;

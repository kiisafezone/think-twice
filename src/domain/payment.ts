import { z } from "zod";
import { requiredInputSchema } from "./input-state";
import { rupiahSchema } from "./money";

/**
 * `financingClass` is the decision engine's financing classification for V1
 * (`cash` or `financed`). It is NOT a payment instrument. The wider product
 * model in docs/architecture/DOMAIN_MODEL.md (savings, credit_card, pay_later,
 * installment, loan, mixed) is intentionally not modeled here: mapping those
 * variants to a financing class is an unresolved product decision.
 */
export const FINANCING_CLASSES = ["cash", "financed"] as const;
export type FinancingClass = (typeof FINANCING_CLASSES)[number];

export const FEE_TREATMENTS = [
  "installment_includes_fees",
  "installment_excludes_fees",
] as const;
export const feeTreatmentSchema = z.enum(FEE_TREATMENTS);
export type FeeTreatment = z.infer<typeof feeTreatmentSchema>;

/**
 * V1 supports monthly installments only. Any other schedule is rejected with
 * the stable code `unsupported_repayment_schedule`; it is never converted or
 * assumed to be monthly.
 */
export const repaymentScheduleSchema = z.literal("monthly", {
  error: "unsupported_repayment_schedule",
});

/**
 * Installment count, a validation-only constraint (whole number >= 1). It is
 * not a scoring rule. TASKS.md lists it as an assumption to confirm.
 */
export const installmentCountSchema = z
  .number()
  .int()
  .min(1)
  .refine((value) => Number.isSafeInteger(value), "unsafe_integer")
  .brand<"InstallmentCount">();
export type InstallmentCount = z.infer<typeof installmentCountSchema>;

export const cashPlanSchema = z.strictObject({
  financingClass: z.literal("cash"),
});
export type CashPlan = z.infer<typeof cashPlanSchema>;

export const installmentTermsSchema = z.strictObject({
  repaymentSchedule: repaymentScheduleSchema,
  /** New monthly installment amount (I). */
  monthlyInstallment: requiredInputSchema(rupiahSchema),
  /** Installment count (N). Required for total-cost disclosure. */
  installmentCount: requiredInputSchema(installmentCountSchema),
  /** Whether I already includes fees. Required for total-cost disclosure. */
  feeTreatment: requiredInputSchema(feeTreatmentSchema),
});
export type InstallmentTerms = z.infer<typeof installmentTermsSchema>;

export const financedPlanSchema = z.strictObject({
  financingClass: z.literal("financed"),
  /** Explicit upfront payment (U); cash purchases derive U from P + F. */
  upfrontPayment: requiredInputSchema(rupiahSchema),
  installment: installmentTermsSchema,
});
export type FinancedPlan = z.infer<typeof financedPlanSchema>;

export const paymentPlanSchema = z.discriminatedUnion("financingClass", [
  cashPlanSchema,
  financedPlanSchema,
]);
export type PaymentPlan = z.infer<typeof paymentPlanSchema>;

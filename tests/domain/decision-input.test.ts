import { describe, expect, it } from "vitest";
import { decisionInputSchema, validateWith } from "@/domain";
import {
  known,
  validCashDecisionInput,
  validFinancedDecisionInput,
} from "./fixtures";

const validate = (raw: unknown) => validateWith(decisionInputSchema, raw);

describe("decision input", () => {
  it("accepts a complete cash purchase and returns it unchanged", () => {
    const input = validCashDecisionInput();
    const result = validate(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(input);
    }
  });

  it("accepts a complete financed purchase and returns it unchanged", () => {
    const input = validFinancedDecisionInput();
    const result = validate(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(input);
    }
  });

  it.each(["purchase", "purchaseAssessment", "financialProfile"] as const)(
    "rejects input missing the %s section",
    (section) => {
      const { [section]: _omitted, ...rest } = validCashDecisionInput();
      expect(validate(rest).ok).toBe(false);
    },
  );

  it("rejects unknown top-level keys", () => {
    expect(
      validate({ ...validCashDecisionInput(), combinedHealthScore: 80 }).ok,
    ).toBe(false);
  });

  it("reports invalid input with an explicit path instead of making it unknown", () => {
    const base = validFinancedDecisionInput();
    const result = validate({
      ...base,
      financialProfile: { ...base.financialProfile, netMonthlyIncome: null },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(
        result.issues.some((issue) =>
          issue.path.join(".").startsWith("financialProfile.netMonthlyIncome"),
        ),
      ).toBe(true);
    }
  });

  it("rejects blank item names and categories", () => {
    const base = validCashDecisionInput();
    for (const field of ["itemName", "category"] as const) {
      for (const blank of ["", "   "]) {
        expect(
          validate({ ...base, purchase: { ...base.purchase, [field]: blank } })
            .ok,
        ).toBe(false);
      }
    }
  });

  it("rejects an unsupported repayment schedule through the full input", () => {
    const base = validFinancedDecisionInput();
    const result = validate({
      ...base,
      purchase: {
        ...base.purchase,
        paymentPlan: {
          ...base.purchase.paymentPlan,
          installment: {
            ...base.purchase.paymentPlan.installment,
            repaymentSchedule: "weekly",
          },
        },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.message)).toContain(
        "unsupported_repayment_schedule",
      );
    }
  });

  it("produces identical results for identical input", () => {
    const first = validate(validFinancedDecisionInput());
    const second = validate(validFinancedDecisionInput());
    expect(first).toEqual(second);
  });

  it("does not mutate its input", () => {
    const input = validCashDecisionInput();
    const snapshot = JSON.parse(JSON.stringify(input)) as unknown;
    validate(input);
    expect(input).toEqual(snapshot);
  });

  it("accepts a known zero price and fee", () => {
    const base = validCashDecisionInput();
    expect(
      validate({
        ...base,
        purchase: {
          ...base.purchase,
          purchasePrice: known(0),
          additionalFees: known(0),
        },
      }).ok,
    ).toBe(true);
  });
});

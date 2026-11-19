import { describe, expect, it } from "vitest";
import { paymentPlanSchema, validateWith } from "@/domain";
import {
  known,
  unknown,
  validCashPlan,
  validFinancedPlan,
} from "./fixtures";

describe("payment plan", () => {
  it("accepts a cash plan", () => {
    expect(validateWith(paymentPlanSchema, validCashPlan()).ok).toBe(true);
  });

  it("accepts a financed plan with monthly installments", () => {
    expect(validateWith(paymentPlanSchema, validFinancedPlan()).ok).toBe(true);
  });

  it("rejects installment terms on a cash plan", () => {
    const plan = { ...validCashPlan(), installment: validFinancedPlan().installment };
    expect(validateWith(paymentPlanSchema, plan).ok).toBe(false);
  });

  it("rejects a financed plan without installment terms", () => {
    const { installment: _omitted, ...plan } = validFinancedPlan();
    expect(validateWith(paymentPlanSchema, plan).ok).toBe(false);
  });

  it("does not model payment variants that are not mapped to a financing class", () => {
    for (const financingClass of [
      "credit_card",
      "pay_later",
      "loan",
      "savings",
      "mixed",
      "installment",
    ]) {
      const plan = { ...validCashPlan(), financingClass };
      expect(validateWith(paymentPlanSchema, plan).ok).toBe(false);
    }
  });

  describe.each(["weekly", "biweekly", "Monthly", "irregular", ""])(
    "repayment schedule %j",
    (schedule) => {
      it("is rejected as unsupported, not converted to monthly", () => {
        const plan = validFinancedPlan();
        const result = validateWith(paymentPlanSchema, {
          ...plan,
          installment: { ...plan.installment, repaymentSchedule: schedule },
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          const issue = result.issues.find(
            (candidate) =>
              candidate.path.join(".") === "installment.repaymentSchedule",
          );
          expect(issue?.message).toBe("unsupported_repayment_schedule");
        }
      });
    },
  );

  it("rejects a missing repayment schedule instead of assuming monthly", () => {
    const plan = validFinancedPlan();
    const { repaymentSchedule: _omitted, ...installment } = plan.installment;
    expect(
      validateWith(paymentPlanSchema, { ...plan, installment }).ok,
    ).toBe(false);
  });

  it("accepts unknown installment inputs so affordability can later be null", () => {
    const plan = validFinancedPlan();
    const result = validateWith(paymentPlanSchema, {
      ...plan,
      installment: {
        ...plan.installment,
        monthlyInstallment: unknown,
        installmentCount: unknown,
        feeTreatment: unknown,
      },
    });
    expect(result.ok).toBe(true);
  });

  it.each<unknown>([0, -1, 1.5, "12", null])(
    "rejects installment count %j",
    (count) => {
      const plan = validFinancedPlan();
      const result = validateWith(paymentPlanSchema, {
        ...plan,
        installment: { ...plan.installment, installmentCount: known(count) },
      });
      expect(result.ok).toBe(false);
    },
  );

  it("rejects an unrecognized fee treatment", () => {
    const plan = validFinancedPlan();
    const result = validateWith(paymentPlanSchema, {
      ...plan,
      installment: { ...plan.installment, feeTreatment: known("other") },
    });
    expect(result.ok).toBe(false);
  });
});

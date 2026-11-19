import { describe, expect, it } from "vitest";
import { evaluateDecision, rupiahSchema, type DecisionInput } from "@/domain";
import { known, unknown, validCashDecisionInput, validFinancedDecisionInput } from "./fixtures";

const money = (value: number) => rupiahSchema.parse(value);

function cashInput(): DecisionInput {
  const input = validCashDecisionInput();
  input.purchase.purchasePrice = known(money(2_000_000));
  return input;
}

type FinancedDecisionInput = Omit<DecisionInput, "purchase"> & {
  purchase: Omit<DecisionInput["purchase"], "paymentPlan"> & {
    paymentPlan: Extract<DecisionInput["purchase"]["paymentPlan"], { financingClass: "financed" }>;
  };
};

function financedInput(): FinancedDecisionInput {
  return validFinancedDecisionInput();
}

describe("canonical decision engine", () => {
  it("returns Safe to Buy when both assessments are complete and no higher rule applies", () => {
    const result = evaluateDecision(cashInput());
    expect(result.verdict).toEqual({ outcome: "safe_to_buy", disposition: "greenlight" });
    expect(result.affordability.status).toBe("calculated");
    expect(result.rationality.status).toBe("calculated");
    expect(result.affordability.score).toBe(95);
    expect(result.rationality.score).toBe(76);
    expect(result.derivedMetrics).toEqual([]);
    expect(result.verdictReasons[0]?.priority).toBe(4);
  });

  it("returns Buy with Caution at the 80-percent cash-use boundary", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(9_600_000));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(70);
    expect(result.verdict.outcome).toBe("buy_with_caution");
  });

  it("returns Financially Risky above 80-percent cash use", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(9_720_000));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(60);
    expect(result.verdict.outcome).toBe("financially_risky");
    expect(result.verdictReasons[0]?.ruleId).toBe("financial.cash_use_above_80_percent");
  });

  it("gives Financially Risky precedence over low Rationality", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(6_000_000));
    input.purchase.paymentPlan.installment.monthlyInstallment = known(money(2_100_000));
    Object.assign(input.purchaseAssessment, {
      need: known(1),
      urgency: known("can_wait_one_month_or_longer"),
      alternatives: known(1),
      utility: known(1),
      impulseLevel: known(1),
      socialPressure: known(false),
    });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(40);
    expect(result.rationality.score).toBeLessThan(50);
    expect(result.verdict.outcome).toBe("financially_risky");
  });

  it("returns Wait & Reassess for low Rationality without a financial Hard Pass", () => {
    const input = cashInput();
    input.purchaseAssessment.need = known(1);
    input.purchaseAssessment.urgency = known("can_wait_one_month_or_longer");
    input.purchaseAssessment.alternatives = known(1);
    input.purchaseAssessment.utility = known(1);
    input.purchaseAssessment.impulseLevel = known(1);
    input.purchaseAssessment.socialPressure = known(false);
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBeLessThan(50);
    expect(result.impulseFriction.status).toBe("inactive");
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("returns Wait & Reassess when impulse friction is active", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, { impulseLevel: known(3) });
    const result = evaluateDecision(input);
    expect(result.impulseFriction.status).toBe("active");
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("returns Wait & Reassess when social pressure is unknown", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, { socialPressure: unknown });
    const result = evaluateDecision(input);
    expect(result.impulseFriction.status).toBe("undetermined");
    expect(result.verdict.outcome).toBe("wait_and_reassess");
    expect(result.missingFields.some((field) => field.field === "purchaseAssessment.socialPressure")).toBe(true);
  });

  it("returns Do Not Buy for a new installment when monthly free cash is negative", () => {
    const input = financedInput();
    input.financialProfile.netMonthlyIncome = known(money(3_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
    const result = evaluateDecision(input);
    expect(result.verdict.outcome).toBe("do_not_buy");
    expect(result.verdictReasons.some((reason) => reason.ruleId === "financial.new_repayment_with_negative_free_cash")).toBe(true);
  });

  it("returns Do Not Buy for a financed purchase with confirmed zero monthly free cash", () => {
    const input = financedInput();
    input.financialProfile.netMonthlyIncome = known(money(4_500_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
    input.financialProfile.otherCommittedMonthlyExpenses = known(money(500_000));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(10);
    expect(result.verdict.outcome).toBe("do_not_buy");
  });

  it("preserves known upfront-exceeds-cash Hard Pass when another required input is unknown", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(13_000_000));
    Object.assign(input.financialProfile, { netMonthlyIncome: unknown });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("do_not_buy");
  });

  it("returns Wait & Reassess rather than Greenlight when a required financial input is unknown", () => {
    const input = cashInput();
    input.financialProfile.netMonthlyIncome = unknown;
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
    expect(result.affordability.completeness.isComplete).toBe(false);
  });

  it("activates impulse friction for social pressure combined with low Need", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, {
      need: known(2),
      impulseLevel: known(1),
      socialPressure: known(true),
    });
    const result = evaluateDecision(input);
    expect(result.impulseFriction.status).toBe("active");
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("does not apply the new-repayment Hard Pass to a cash purchase with negative free cash", () => {
    const input = cashInput();
    input.financialProfile.netMonthlyIncome = known(money(3_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
    const result = evaluateDecision(input);
    expect(result.verdict.outcome).not.toBe("do_not_buy");
    expect(result.affordability.score).toBe(55);
  });

  it("returns Wait & Reassess for a financed purchase with unknown monthly free cash", () => {
    const input = financedInput();
    Object.assign(input.financialProfile, { existingMonthlyDebtPayments: unknown });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("does not turn low Need and strong impulse into Do Not Buy without a financial Hard Pass", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, {
      need: known(1),
      urgency: known("can_wait_one_month_or_longer"),
      alternatives: known(1),
      utility: known(1),
      impulseLevel: known(5),
      socialPressure: known(false),
    });
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBeLessThan(50);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("keeps Rationality calculated separately when only social pressure is missing", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, { socialPressure: unknown });
    const result = evaluateDecision(input);
    expect(result.rationality.status).toBe("calculated");
    expect(result.rationality.completeness.isComplete).toBe(false);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("pauses at Rationality 49 when no higher financial rule applies", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, {
      need: known(1),
      urgency: known("can_wait_one_month_or_longer"),
      alternatives: known(3),
      utility: known(4),
      impulseLevel: known(1),
      socialPressure: known(false),
    });
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBe(49);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it("allows the financial result to proceed at Rationality 50 when no friction applies", () => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, {
      need: known(1),
      urgency: known("can_wait_one_month_or_longer"),
      alternatives: known(5),
      utility: known(3),
      impulseLevel: known(1),
      socialPressure: known(false),
    });
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBe(50);
    expect(result.verdict.outcome).toBe("safe_to_buy");
  });
});

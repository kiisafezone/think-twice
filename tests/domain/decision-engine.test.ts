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

  it.each([
    ["purchase price", (input: DecisionInput) => Object.assign(input.purchase, { purchasePrice: unknown })],
    ["additional fees", (input: DecisionInput) => Object.assign(input.purchase, { additionalFees: unknown })],
    ["available cash", (input: DecisionInput) => Object.assign(input.financialProfile, { availableCash: unknown })],
    ["net monthly income", (input: DecisionInput) => Object.assign(input.financialProfile, { netMonthlyIncome: unknown })],
    ["essential monthly expenses", (input: DecisionInput) => Object.assign(input.financialProfile, { essentialMonthlyExpenses: unknown })],
    ["existing monthly debt payments", (input: DecisionInput) => Object.assign(input.financialProfile, { existingMonthlyDebtPayments: unknown })],
    ["other committed monthly expenses", (input: DecisionInput) => Object.assign(input.financialProfile, { otherCommittedMonthlyExpenses: unknown })],
  ] as const)("returns unavailable affordability for a cash purchase with unknown %s", (_field, makeUnknown) => {
    const input = cashInput();
    makeUnknown(input);
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.affordability.status).toBe("unavailable");
    expect(result.verdict.outcome).toBe("wait_and_reassess");
  });

  it.each([
    "netMonthlyIncome",
    "essentialMonthlyExpenses",
    "existingMonthlyDebtPayments",
    "otherCommittedMonthlyExpenses",
  ] as const)("keeps financed monthly free cash unknown when %s is missing", (field) => {
    const input = financedInput();
    Object.assign(input.financialProfile, { [field]: unknown });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
    expect(result.missingFields.some((entry) => entry.field === `financialProfile.${field}`)).toBe(true);
  });

  it("returns unavailable affordability when a financed monthly installment is unknown", () => {
    const input = financedInput();
    input.purchase.paymentPlan.installment.monthlyInstallment = unknown;
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
    expect(result.missingFields.some((entry) => entry.field === "purchase.paymentPlan.installment.monthlyInstallment")).toBe(true);
  });

  it("keeps Financially Risky precedence over missing critical behavioral data", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(9_720_000));
    Object.assign(input.purchaseAssessment, { socialPressure: unknown });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(60);
    expect(result.impulseFriction.status).toBe("undetermined");
    expect(result.verdict.outcome).toBe("financially_risky");
  });

  it("keeps Financially Risky precedence when a required Rationality dimension is missing", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(9_720_000));
    Object.assign(input.purchaseAssessment, { need: unknown });
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBe(null);
    expect(result.verdict.outcome).toBe("financially_risky");
  });

  it("returns Do Not Buy when upfront exceeds cash even if another required financial input is missing", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(13_000_000));
    Object.assign(input.financialProfile, { essentialMonthlyExpenses: unknown });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(null);
    expect(result.verdict.outcome).toBe("do_not_buy");
    expect(result.verdictReasons[0]?.ruleId).toBe("financial.upfront_exceeds_available_cash");
  });

  it("returns Do Not Buy for cash use above 100 percent", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(12_000_001));
    const result = evaluateDecision(input);
    expect(result.verdict.outcome).toBe("do_not_buy");
    expect(result.verdictReasons.some((reason) => reason.ruleId === "financial.upfront_exceeds_available_cash")).toBe(true);
  });

  it("keeps cash use above 80 percent financially risky when Rationality is below 50", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(9_720_000));
    Object.assign(input.purchaseAssessment, {
      need: known(1), urgency: known("can_wait_one_month_or_longer"),
      alternatives: known(1), utility: known(1), impulseLevel: known(1),
      socialPressure: known(false),
    });
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(60);
    expect(result.rationality.score).toBeLessThan(50);
    expect(result.verdict.outcome).toBe("financially_risky");
    expect(result.verdictReasons[0]?.ruleId).toBe("financial.cash_use_above_80_percent");
  });

  it("applies both zero-free-cash penalties when cash impact is also positive", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(6_000_000));
    input.financialProfile.netMonthlyIncome = known(money(4_500_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
    input.financialProfile.existingMonthlyDebtPayments = known(money(0));
    input.financialProfile.otherCommittedMonthlyExpenses = known(money(500_000));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(0);
    expect(result.verdict.outcome).toBe("do_not_buy");
  });

  it("uses only explicitly opted-in protected savings in the verdict cash calculation", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(12_500_000));
    const withoutOptIn = evaluateDecision(input);
    expect(withoutOptIn.verdict.outcome).toBe("do_not_buy");

    input.financialProfile.protectedSavingsDesignation = {
      status: "opted_in",
      amount: money(2_000_000),
      disclosureAcknowledged: true,
    };
    const withOptIn = evaluateDecision(input);
    expect(withOptIn.verdict.outcome).toBe("financially_risky");
  });

  it("does not silently use protected savings when the user has not opted in", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(13_000_000));
    input.financialProfile.protectedSavings = known(money(20_000_000));
    input.financialProfile.protectedSavingsDesignation = { status: "not_opted_in" };
    const result = evaluateDecision(input);
    expect(result.verdict.outcome).toBe("do_not_buy");
  });

  it("keeps affordability and Rationality as separate assessments without a combined score", () => {
    const result = evaluateDecision(cashInput());
    expect(result.affordability.kind).toBe("affordability");
    expect(result.rationality.kind).toBe("rationality");
    expect(result).not.toHaveProperty("combinedScore");
    expect(result).not.toHaveProperty("healthScore");
  });

  it.each([
    ["safe_to_buy", "greenlight.affordability_at_least_80", (input: DecisionInput) => input],
    ["buy_with_caution", "greenlight.affordability_60_to_79", (input: DecisionInput) => {
      input.purchase.purchasePrice = known(money(9_600_000));
      return input;
    }],
    ["wait_and_reassess", "behavior.rationality_below_50", (input: DecisionInput) => {
      Object.assign(input.purchaseAssessment, {
        need: known(1), urgency: known("can_wait_one_month_or_longer"),
        alternatives: known(1), utility: known(1), impulseLevel: known(1),
        socialPressure: known(false),
      });
      return input;
    }],
    ["financially_risky", "financial.cash_use_above_80_percent", (input: DecisionInput) => {
      input.purchase.purchasePrice = known(money(9_720_000));
      return input;
    }],
    ["do_not_buy", "financial.new_repayment_with_negative_free_cash", (input: DecisionInput) => {
      const financed = financedInput();
      financed.financialProfile.netMonthlyIncome = known(money(3_000_000));
      financed.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
      return financed as unknown as DecisionInput;
    }],
  ] as const)("provides an evidence-based Indonesian reason and next steps for %s", (outcome, ruleId, prepare) => {
    const result = evaluateDecision(prepare(cashInput()));
    expect(result.verdict.outcome).toBe(outcome);
    expect(result.verdictReasons[0]?.ruleId).toBe(ruleId);
    expect(result.verdictReasons.length).toBeGreaterThan(0);
    expect(result.explanation.decisiveReason).toBe(result.verdictReasons[0]?.explanation);
    expect(result.explanation.decisiveReason.length).toBeGreaterThan(20);
    expect(result.nextSteps.length).toBeGreaterThan(0);
    expect(result.nextSteps.every((step) => step.length > 10)).toBe(true);
  });

  it("gives Do Not Buy specific and qualified repayment alternatives", () => {
    const input = financedInput();
    input.financialProfile.netMonthlyIncome = known(money(3_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(4_000_000));
    const result = evaluateDecision(input);
    expect(result.verdict.outcome).toBe("do_not_buy");
    expect(result.nextSteps.join(" ")).toContain("nominal cicilan");
    expect(result.nextSteps.join(" ")).toContain("bandingkan total pembayaran dan seluruh biaya");
    expect(result.nextSteps.join(" ")).toContain("menunda");
  });


  it.each([
    ["need", "need"],
    ["urgency", "urgency"],
    ["alternatives", "alternatives"],
    ["utility", "utility"],
    ["impulse level", "impulseLevel"],
  ] as const)("returns null Rationality when required %s is unknown", (_label, field) => {
    const input = cashInput();
    Object.assign(input.purchaseAssessment, { [field]: unknown });
    const result = evaluateDecision(input);
    expect(result.rationality.score).toBe(null);
    expect(result.rationality.status).toBe("unavailable");
    expect(result.rationality.completeness.isComplete).toBe(false);
    expect(result.verdict.outcome).toBe("wait_and_reassess");
    expect(result.missingFields.some((entry) => entry.field === `purchaseAssessment.${field}`)).toBe(true);
  });

  it("returns Financially Risky at the reachable affordability score 35", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(2_000_000));
    input.purchase.paymentPlan.installment.monthlyInstallment = known(money(1_100_000));
    input.financialProfile.netMonthlyIncome = known(money(8_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(7_000_000));
    input.financialProfile.existingMonthlyDebtPayments = known(money(0));
    input.financialProfile.otherCommittedMonthlyExpenses = known(money(0));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(35);
    expect(result.verdict.outcome).toBe("financially_risky");
  });

  it("returns Do Not Buy below the 35-point affordability threshold", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(3_100_000));
    input.purchase.paymentPlan.installment.monthlyInstallment = known(money(1_100_000));
    input.financialProfile.netMonthlyIncome = known(money(8_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(7_000_000));
    input.financialProfile.existingMonthlyDebtPayments = known(money(0));
    input.financialProfile.otherCommittedMonthlyExpenses = known(money(0));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(30);
    expect(result.verdict.outcome).toBe("do_not_buy");
  });

  it("returns Buy with Caution at the reachable affordability score 75", () => {
    const input = financedInput();
    input.purchase.paymentPlan.upfrontPayment = known(money(6_000_000));
    input.purchase.paymentPlan.installment.monthlyInstallment = known(money(150_000));
    input.financialProfile.netMonthlyIncome = known(money(8_000_000));
    input.financialProfile.essentialMonthlyExpenses = known(money(7_000_000));
    input.financialProfile.existingMonthlyDebtPayments = known(money(0));
    input.financialProfile.otherCommittedMonthlyExpenses = known(money(0));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(75);
    expect(result.verdict.outcome).toBe("buy_with_caution");
  });

  it("returns Safe to Buy at the reachable affordability score 80", () => {
    const input = cashInput();
    input.purchase.purchasePrice = known(money(6_000_000));
    const result = evaluateDecision(input);
    expect(result.affordability.score).toBe(80);
    expect(result.verdict.outcome).toBe("safe_to_buy");
  });

});

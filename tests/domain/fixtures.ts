/**
 * Illustrative input fixtures for contract and validation tests. The numbers
 * are arbitrary examples; they are not expected scores or verdicts.
 */

export const known = <T>(value: T) => ({ status: "known" as const, value });
export const unknown = { status: "unknown" as const };
export const notApplicable = { status: "not_applicable" as const };

export function validPurchaseAssessment() {
  return {
    need: known(4 as const),
    urgency: known("needed_within_one_month" as const),
    alternatives: known(3 as const),
    utility: known(5 as const),
    impulseLevel: known(2 as const),
    socialPressure: known(false),
  };
}

export function validFinancialProfile() {
  return {
    netMonthlyIncome: known(8_000_000),
    essentialMonthlyExpenses: known(4_000_000),
    existingMonthlyDebtPayments: known(0),
    otherCommittedMonthlyExpenses: known(500_000),
    availableCash: known(12_000_000),
    protectedSavings: known(5_000_000),
    protectedSavingsDesignation: { status: "not_opted_in" as const },
  };
}

export function validCashPlan() {
  return {
    financingClass: "cash" as const,
  };
}

export function validFinancedPlan() {
  return {
    financingClass: "financed" as const,
    upfrontPayment: known(1_000_000),
    installment: {
      repaymentSchedule: "monthly" as const,
      monthlyInstallment: known(900_000),
      installmentCount: known(12),
      feeTreatment: known("installment_excludes_fees" as const),
    },
  };
}

export function validCashDecisionInput() {
  return {
    purchase: {
      itemName: "Laptop",
      category: "electronics",
      purchasePrice: known(10_000_000),
      additionalFees: known(0),
      paymentPlan: validCashPlan(),
    },
    purchaseAssessment: validPurchaseAssessment(),
    financialProfile: validFinancialProfile(),
  };
}

export function validFinancedDecisionInput() {
  return {
    purchase: {
      itemName: "Laptop",
      category: "electronics",
      purchasePrice: known(10_000_000),
      additionalFees: known(0),
      paymentPlan: validFinancedPlan(),
    },
    purchaseAssessment: validPurchaseAssessment(),
    financialProfile: validFinancialProfile(),
  };
}

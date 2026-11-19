import type { RequiredInput } from "./input-state";
import { signedRupiahSchema, type Rupiah, type SignedRupiah } from "./money";

export type DerivedValue<T> =
  | { readonly status: "known"; readonly value: T }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

export type CashImpactPenalty =
  | { readonly status: "known"; readonly penalty: 0 | 5 | 10 | 20 | 30 | 40 | 50; readonly hardPass: boolean }
  | { readonly status: "unknown" }
  | { readonly status: "hard_pass" };

export type MonthlyBurdenPenalty =
  | { readonly status: "known"; readonly penalty: 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

export type FinancialPressurePenalty =
  | { readonly status: "known"; readonly penalty: 0 | 30 | 40 }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

/**
 * Compare numerator / denominator with an integer percentage threshold.
 * Callers must establish a positive denominator. BigInt prevents intermediate
 * multiplication from exceeding JavaScript's safe-integer range.
 */
function isAtMostPercentage(
  numerator: number,
  denominator: number,
  percentage: number,
): boolean {
  return BigInt(numerator) * 100n <= BigInt(denominator) * BigInt(percentage);
}

/** Calculate M = Y - E - D - C without clamping a deficit to zero. */
export function deriveMonthlyFreeCash(input: {
  readonly netMonthlyIncome: RequiredInput<Rupiah>;
  readonly essentialMonthlyExpenses: RequiredInput<Rupiah>;
  readonly existingMonthlyDebtPayments: RequiredInput<Rupiah>;
  readonly otherCommittedMonthlyExpenses: RequiredInput<Rupiah>;
}): DerivedValue<SignedRupiah> {
  const values = [
    input.netMonthlyIncome,
    input.essentialMonthlyExpenses,
    input.existingMonthlyDebtPayments,
    input.otherCommittedMonthlyExpenses,
  ];

  if (values.some((value) => value.status !== "known")) {
    return { status: "unknown" };
  }

  const [income, essentials, debt, committed] = values;
  if (
    income.status !== "known" ||
    essentials.status !== "known" ||
    debt.status !== "known" ||
    committed.status !== "known"
  ) {
    return { status: "unknown" };
  }

  const freeCash =
    BigInt(income.value) -
    BigInt(essentials.value) -
    BigInt(debt.value) -
    BigInt(committed.value);

  if (
    freeCash > BigInt(Number.MAX_SAFE_INTEGER) ||
    freeCash < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    return { status: "invalid", reason: "unsafe_integer_overflow" };
  }

  return {
    status: "known",
    value: signedRupiahSchema.parse(Number(freeCash)),
  };
}

/** P_cash from U / A using exact integer cross-multiplication. */
export function calculateCashImpactPenalty(
  upfront: RequiredInput<Rupiah>,
  availableCash: RequiredInput<Rupiah>,
): CashImpactPenalty {
  if (upfront.status !== "known" || availableCash.status !== "known") {
    return { status: "unknown" };
  }

  const { value: u } = upfront;
  const { value: a } = availableCash;

  if (u === 0) return { status: "known", penalty: 0, hardPass: false };
  if (a === 0) return { status: "hard_pass" };

  if (isAtMostPercentage(u, a, 10)) return { status: "known", penalty: 0, hardPass: false };
  if (isAtMostPercentage(u, a, 25)) return { status: "known", penalty: 5, hardPass: false };
  if (isAtMostPercentage(u, a, 40)) return { status: "known", penalty: 10, hardPass: false };
  if (isAtMostPercentage(u, a, 60)) return { status: "known", penalty: 20, hardPass: false };
  if (isAtMostPercentage(u, a, 80)) return { status: "known", penalty: 30, hardPass: false };
  if (isAtMostPercentage(u, a, 100)) return { status: "known", penalty: 40, hardPass: false };
  return { status: "known", penalty: 50, hardPass: true };
}

/** P_m from I / M; non-positive known M receives the approved fixed penalty. */
export function calculateMonthlyBurdenPenalty(
  monthlyInstallment: RequiredInput<Rupiah>,
  monthlyFreeCash: DerivedValue<SignedRupiah>,
): MonthlyBurdenPenalty {
  if (monthlyInstallment.status !== "known") {
    return { status: "unknown" };
  }
  if (monthlyFreeCash.status === "unknown") {
    return { status: "unknown" };
  }
  if (monthlyFreeCash.status === "invalid") {
    return monthlyFreeCash;
  }

  const installment = monthlyInstallment.value;
  const freeCash = monthlyFreeCash.value;

  if (freeCash <= 0) return { status: "known", penalty: 60 };
  if (installment === 0) return { status: "known", penalty: 0 };

  if (isAtMostPercentage(installment, freeCash, 10)) {
    return { status: "known", penalty: 0 };
  }
  if (isAtMostPercentage(installment, freeCash, 20)) {
    return { status: "known", penalty: 5 };
  }
  if (isAtMostPercentage(installment, freeCash, 30)) {
    return { status: "known", penalty: 10 };
  }
  if (isAtMostPercentage(installment, freeCash, 40)) {
    return { status: "known", penalty: 20 };
  }
  if (isAtMostPercentage(installment, freeCash, 50)) {
    return { status: "known", penalty: 30 };
  }
  if (isAtMostPercentage(installment, freeCash, 75)) {
    return { status: "known", penalty: 40 };
  }
  if (isAtMostPercentage(installment, freeCash, 100)) {
    return { status: "known", penalty: 50 };
  }
  return { status: "known", penalty: 60 };
}

/** P_f from the sign of known monthly free cash. */
export function calculateFinancialPressurePenalty(
  monthlyFreeCash: DerivedValue<SignedRupiah>,
): FinancialPressurePenalty {
  if (monthlyFreeCash.status === "unknown") return { status: "unknown" };
  if (monthlyFreeCash.status === "invalid") return monthlyFreeCash;
  if (monthlyFreeCash.value < 0) return { status: "known", penalty: 40 };
  if (monthlyFreeCash.value === 0) return { status: "known", penalty: 30 };
  return { status: "known", penalty: 0 };
}

export type AffordabilityCalculationInput =
  | {
      readonly financingClass: "cash";
      readonly upfront: DerivedValue<Rupiah>;
      readonly availableCash: RequiredInput<Rupiah>;
      readonly monthlyFreeCash: DerivedValue<SignedRupiah>;
    }
  | {
      readonly financingClass: "financed";
      readonly upfront: RequiredInput<Rupiah>;
      readonly availableCash: RequiredInput<Rupiah>;
      readonly monthlyInstallment: RequiredInput<Rupiah>;
      readonly monthlyFreeCash: DerivedValue<SignedRupiah>;
    };

export interface AffordabilityPenalties {
  readonly cashImpact: CashImpactPenalty;
  readonly monthlyBurden: MonthlyBurdenPenalty;
  readonly financialPressure: FinancialPressurePenalty;
}

export type AffordabilityScoreResult =
  | {
      readonly status: "calculated";
      readonly score: number;
      readonly penalties: AffordabilityPenalties;
      readonly hardPass: boolean;
    }
  | {
      readonly status: "unavailable";
      readonly score: null;
      readonly reason: "missing_required_input" | "cash_impact_hard_pass";
      readonly penalties: AffordabilityPenalties;
      readonly hardPass: boolean;
    }
  | {
      readonly status: "invalid";
      readonly score: null;
      readonly reason: "unsafe_integer_overflow";
      readonly penalties: AffordabilityPenalties;
      readonly hardPass: boolean;
    };

/**
 * Aggregate the three approved affordability penalties.
 *
 * Unknown required inputs make the score unavailable; no partial score is
 * produced. Independently proven financial Hard Pass conditions are retained
 * even when another required input is missing or invalid.
 */
export function calculateAffordabilityScore(
  input: AffordabilityCalculationInput,
): AffordabilityScoreResult {
  const cashImpact = calculateCashImpactPenalty(
    input.upfront,
    input.availableCash,
  );
  const monthlyBurden: MonthlyBurdenPenalty =
    input.financingClass === "cash"
      ? { status: "known", penalty: 0 }
      : calculateMonthlyBurdenPenalty(
          input.monthlyInstallment,
          input.monthlyFreeCash,
        );
  const financialPressure =
    calculateFinancialPressurePenalty(input.monthlyFreeCash);

  const penalties: AffordabilityPenalties = {
    cashImpact,
    monthlyBurden,
    financialPressure,
  };

  const upfrontExceedsAvailableCash =
    cashImpact.status === "hard_pass" ||
    (cashImpact.status === "known" && cashImpact.hardPass);
  const newRepaymentWithNegativeFreeCash =
    input.financingClass === "financed" &&
    input.monthlyFreeCash.status === "known" &&
    input.monthlyFreeCash.value < 0;
  const hardPass =
    upfrontExceedsAvailableCash || newRepaymentWithNegativeFreeCash;

  const statuses = [
    cashImpact.status,
    monthlyBurden.status,
    financialPressure.status,
  ];

  if (statuses.includes("invalid")) {
    return {
      status: "invalid",
      score: null,
      reason: "unsafe_integer_overflow",
      penalties,
      hardPass,
    };
  }

  if (cashImpact.status === "hard_pass") {
    return {
      status: "unavailable",
      score: null,
      reason: "cash_impact_hard_pass",
      penalties,
      hardPass: true,
    };
  }

  if (
    cashImpact.status !== "known" ||
    monthlyBurden.status !== "known" ||
    financialPressure.status !== "known"
  ) {
    return {
      status: "unavailable",
      score: null,
      reason: "missing_required_input",
      penalties,
      hardPass,
    };
  }

  const score = Math.max(
    0,
    100 -
      cashImpact.penalty -
      monthlyBurden.penalty -
      financialPressure.penalty,
  );

  return {
    status: "calculated",
    score,
    penalties,
    hardPass,
  };
}


import type { RequiredInput } from "./input-state";
import { signedRupiahSchema, type Rupiah, type SignedRupiah } from "./money";

export type DerivedValue<T> =
  | { readonly status: "known"; readonly value: T }
  | { readonly status: "unknown" }
  | { readonly status: "invalid"; readonly reason: "unsafe_integer_overflow" };

export type CashImpactPenalty =
  | { readonly status: "known"; readonly penalty: 0 | 5 | 10 | 20 | 30 | 40 | 50 }
  | { readonly status: "unknown" }
  | { readonly status: "hard_pass" };

export type MonthlyBurdenPenalty =
  | { readonly status: "known"; readonly penalty: 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 }
  | { readonly status: "unknown" };

export type FinancialPressurePenalty =
  | { readonly status: "known"; readonly penalty: 0 | 30 | 40 }
  | { readonly status: "unknown" };

/**
 * Compare numerator / denominator with an integer percentage threshold.
 * Callers must establish a positive denominator. BigInt prevents intermediate
 * multiplication from exceeding JavaScript's safe-integer range.
 */
function isAtMostPercentage(
  numerator: Rupiah,
  denominator: Rupiah,
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

  if (u === 0) return { status: "known", penalty: 0 };
  if (a === 0) return { status: "hard_pass" };

  if (isAtMostPercentage(u, a, 10)) return { status: "known", penalty: 0 };
  if (isAtMostPercentage(u, a, 25)) return { status: "known", penalty: 5 };
  if (isAtMostPercentage(u, a, 40)) return { status: "known", penalty: 10 };
  if (isAtMostPercentage(u, a, 60)) return { status: "known", penalty: 20 };
  if (isAtMostPercentage(u, a, 80)) return { status: "known", penalty: 30 };
  if (isAtMostPercentage(u, a, 100)) return { status: "known", penalty: 40 };
  return { status: "known", penalty: 50 };
}

/** P_m from I / M; non-positive known M receives the approved fixed penalty. */
export function calculateMonthlyBurdenPenalty(
  monthlyInstallment: RequiredInput<Rupiah>,
  monthlyFreeCash: DerivedValue<SignedRupiah>,
): MonthlyBurdenPenalty {
  if (
    monthlyInstallment.status !== "known" ||
    monthlyFreeCash.status !== "known"
  ) {
    return { status: "unknown" };
  }

  const installment = monthlyInstallment.value;
  const freeCash = monthlyFreeCash.value;

  if (freeCash <= 0) return { status: "known", penalty: 60 };
  if (installment === 0) return { status: "known", penalty: 0 };

  const denominator = freeCash as unknown as Rupiah;
  if (isAtMostPercentage(installment, denominator, 10)) {
    return { status: "known", penalty: 0 };
  }
  if (isAtMostPercentage(installment, denominator, 20)) {
    return { status: "known", penalty: 5 };
  }
  if (isAtMostPercentage(installment, denominator, 30)) {
    return { status: "known", penalty: 10 };
  }
  if (isAtMostPercentage(installment, denominator, 40)) {
    return { status: "known", penalty: 20 };
  }
  if (isAtMostPercentage(installment, denominator, 50)) {
    return { status: "known", penalty: 30 };
  }
  if (isAtMostPercentage(installment, denominator, 75)) {
    return { status: "known", penalty: 40 };
  }
  if (isAtMostPercentage(installment, denominator, 100)) {
    return { status: "known", penalty: 50 };
  }
  return { status: "known", penalty: 60 };
}

/** P_f from the sign of known monthly free cash. */
export function calculateFinancialPressurePenalty(
  monthlyFreeCash: DerivedValue<SignedRupiah>,
): FinancialPressurePenalty {
  if (monthlyFreeCash.status !== "known") return { status: "unknown" };
  if (monthlyFreeCash.value < 0) return { status: "known", penalty: 40 };
  if (monthlyFreeCash.value === 0) return { status: "known", penalty: 30 };
  return { status: "known", penalty: 0 };
}

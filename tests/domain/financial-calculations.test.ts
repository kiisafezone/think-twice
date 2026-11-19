import { describe, expect, it } from "vitest";
import {
  calculateAffordabilityScore,
  calculateCashImpactPenalty,
  calculateFinancialPressurePenalty,
  calculateMonthlyBurdenPenalty,
  deriveMonthlyFreeCash,
  rupiahSchema,
  signedRupiahSchema,
} from "@/domain";
import { known, unknown } from "./fixtures";

const money = (value: number) => rupiahSchema.parse(value);
const signed = (value: number) => signedRupiahSchema.parse(value);

describe("deriveMonthlyFreeCash", () => {
  it("subtracts all known expense components and preserves a positive result", () => {
    expect(
      deriveMonthlyFreeCash({
        netMonthlyIncome: known(money(8_000_000)),
        essentialMonthlyExpenses: known(money(4_000_000)),
        existingMonthlyDebtPayments: known(money(1_000_000)),
        otherCommittedMonthlyExpenses: known(money(500_000)),
      }),
    ).toEqual({ status: "known", value: 2_500_000 });
  });

  it("preserves a negative result instead of clamping it to zero", () => {
    expect(
      deriveMonthlyFreeCash({
        netMonthlyIncome: known(money(3_000_000)),
        essentialMonthlyExpenses: known(money(3_000_000)),
        existingMonthlyDebtPayments: known(money(500_000)),
        otherCommittedMonthlyExpenses: known(money(0)),
      }),
    ).toEqual({ status: "known", value: -500_000 });
  });

  it("returns confirmed zero only when every component is known", () => {
    expect(
      deriveMonthlyFreeCash({
        netMonthlyIncome: known(money(5_000_000)),
        essentialMonthlyExpenses: known(money(4_000_000)),
        existingMonthlyDebtPayments: known(money(1_000_000)),
        otherCommittedMonthlyExpenses: known(money(0)),
      }),
    ).toEqual({ status: "known", value: 0 });
  });

  it("propagates any unknown component", () => {
    expect(
      deriveMonthlyFreeCash({
        netMonthlyIncome: known(money(5_000_000)),
        essentialMonthlyExpenses: known(money(4_000_000)),
        existingMonthlyDebtPayments: unknown,
        otherCommittedMonthlyExpenses: known(money(0)),
      }),
    ).toEqual({ status: "unknown" });
  });

  it("reports overflow when the signed result exceeds the safe integer range", () => {
    expect(
      deriveMonthlyFreeCash({
        netMonthlyIncome: known(money(0)),
        essentialMonthlyExpenses: known(money(Number.MAX_SAFE_INTEGER)),
        existingMonthlyDebtPayments: known(money(1)),
        otherCommittedMonthlyExpenses: known(money(0)),
      }),
    ).toEqual({ status: "invalid", reason: "unsafe_integer_overflow" });
  });
});

describe("calculateCashImpactPenalty", () => {
  it.each([
    [100, 0, false],
    [101, 5, false],
    [250, 5, false],
    [251, 10, false],
    [400, 10, false],
    [401, 20, false],
    [600, 20, false],
    [601, 30, false],
    [800, 30, false],
    [801, 40, false],
    [1_000, 40, false],
    [1_001, 50, true],
  ] as const)("uses the approved cash-use boundary for %i / 1000", (upfront, penalty, hardPass) => {
    expect(
      calculateCashImpactPenalty(known(money(upfront)), known(money(1_000))),
    ).toEqual({ status: "known", penalty, hardPass });
  });

  it("returns zero for zero upfront even when available cash is zero", () => {
    expect(
      calculateCashImpactPenalty(known(money(0)), known(money(0))),
    ).toEqual({ status: "known", penalty: 0, hardPass: false });
  });

  it("returns Hard Pass when positive upfront exceeds zero available cash", () => {
    expect(
      calculateCashImpactPenalty(known(money(1)), known(money(0))),
    ).toEqual({ status: "hard_pass" });
  });

  it("does not infer zero from unknown inputs", () => {
    expect(calculateCashImpactPenalty(known(money(0)), unknown)).toEqual({
      status: "unknown",
    });
    expect(calculateCashImpactPenalty(unknown, known(money(1_000)))).toEqual({
      status: "unknown",
    });
  });

  it("compares maximum safe integer values exactly without product overflow", () => {
    expect(
      calculateCashImpactPenalty(
        known(money(Number.MAX_SAFE_INTEGER)),
        known(money(Number.MAX_SAFE_INTEGER)),
      ),
    ).toEqual({ status: "known", penalty: 40, hardPass: false });
  });
});

describe("calculateMonthlyBurdenPenalty", () => {
  it.each([
    [100, 0],
    [101, 5],
    [200, 5],
    [201, 10],
    [300, 10],
    [301, 20],
    [400, 20],
    [401, 30],
    [500, 30],
    [501, 40],
    [750, 40],
    [751, 50],
    [1_000, 50],
    [1_001, 60],
  ] as const)("uses the approved monthly-burden boundary for %i / 1000", (installment, penalty) => {
    expect(
      calculateMonthlyBurdenPenalty(
        known(money(installment)),
        { status: "known", value: signed(1_000) },
      ),
    ).toEqual({ status: "known", penalty });
  });

  it.each([0, -1, -1_000])(
    "applies the fixed penalty when monthly free cash is %i",
    (freeCash) => {
      expect(
        calculateMonthlyBurdenPenalty(known(money(0)), {
          status: "known",
          value: signed(freeCash),
        }),
      ).toEqual({ status: "known", penalty: 60 });
    },
  );

  it("returns unknown when monthly free cash is unknown", () => {
    expect(
      calculateMonthlyBurdenPenalty(known(money(100)), { status: "unknown" }),
    ).toEqual({ status: "unknown" });
  });

  it("preserves an invalid monthly free-cash calculation", () => {
    expect(
      calculateMonthlyBurdenPenalty(known(money(100)), {
        status: "invalid",
        reason: "unsafe_integer_overflow",
      }),
    ).toEqual({ status: "invalid", reason: "unsafe_integer_overflow" });
  });
});

describe("calculateFinancialPressurePenalty", () => {
  it.each([
    [-1, 40],
    [0, 30],
    [1, 0],
  ] as const)("maps monthly free cash %i to penalty %i", (freeCash, penalty) => {
    expect(
      calculateFinancialPressurePenalty({
        status: "known",
        value: signed(freeCash),
      }),
    ).toEqual({ status: "known", penalty });
  });

  it("returns unknown for unknown monthly free cash", () => {
    expect(calculateFinancialPressurePenalty({ status: "unknown" })).toEqual({
      status: "unknown",
    });
  });

  it("preserves invalid monthly free cash", () => {
    expect(
      calculateFinancialPressurePenalty({
        status: "invalid",
        reason: "unsafe_integer_overflow",
      }),
    ).toEqual({ status: "invalid", reason: "unsafe_integer_overflow" });
  });
});

describe("calculateAffordabilityScore", () => {
  it("aggregates the three penalties for a complete cash purchase", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "cash",
        upfront: { status: "known", value: money(250) },
        availableCash: known(money(1_000)),
        monthlyFreeCash: { status: "known", value: signed(2_000) },
      }),
    ).toMatchObject({
      status: "calculated",
      score: 95,
      hardPass: false,
      penalties: {
        cashImpact: { status: "known", penalty: 5, hardPass: false },
        monthlyBurden: { status: "known", penalty: 0 },
        financialPressure: { status: "known", penalty: 0 },
      },
    });
  });

  it("uses P_m = 0 for cash and still requires known monthly free cash", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "cash",
        upfront: { status: "known", value: money(0) },
        availableCash: known(money(0)),
        monthlyFreeCash: { status: "unknown" },
      }),
    ).toMatchObject({
      status: "unavailable",
      score: null,
      reason: "missing_required_input",
      hardPass: false,
      penalties: {
        monthlyBurden: { status: "known", penalty: 0 },
        financialPressure: { status: "unknown" },
      },
    });
  });

  it("calculates the approved zero-free-cash financed score of 10 when P_cash is zero", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "financed",
        upfront: known(money(0)),
        availableCash: known(money(0)),
        monthlyInstallment: known(money(100)),
        monthlyFreeCash: { status: "known", value: signed(0) },
      }),
    ).toMatchObject({
      status: "calculated",
      score: 10,
      hardPass: false,
      penalties: {
        cashImpact: { status: "known", penalty: 0 },
        monthlyBurden: { status: "known", penalty: 60 },
        financialPressure: { status: "known", penalty: 30 },
      },
    });
  });

  it("applies the separate Hard Pass for a new installment with negative free cash", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "financed",
        upfront: known(money(0)),
        availableCash: known(money(1_000)),
        monthlyInstallment: known(money(100)),
        monthlyFreeCash: { status: "known", value: signed(-1) },
      }),
    ).toMatchObject({
      status: "calculated",
      score: 0,
      hardPass: true,
      penalties: {
        monthlyBurden: { status: "known", penalty: 60 },
        financialPressure: { status: "known", penalty: 40 },
      },
    });
  });

  it("keeps a known upfront Hard Pass when another required input is unknown", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "financed",
        upfront: known(money(1_001)),
        availableCash: known(money(1_000)),
        monthlyInstallment: known(money(100)),
        monthlyFreeCash: { status: "unknown" },
      }),
    ).toMatchObject({
      status: "unavailable",
      score: null,
      reason: "missing_required_input",
      hardPass: true,
    });
  });

  it("returns the dedicated unavailable result for positive upfront against zero cash", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "cash",
        upfront: { status: "known", value: money(1) },
        availableCash: known(money(0)),
        monthlyFreeCash: { status: "known", value: signed(1_000) },
      }),
    ).toMatchObject({
      status: "unavailable",
      score: null,
      reason: "cash_impact_hard_pass",
      hardPass: true,
    });
  });

  it("does not calculate a partial score when financed monthly free cash is unknown", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "financed",
        upfront: known(money(0)),
        availableCash: known(money(1_000)),
        monthlyInstallment: known(money(100)),
        monthlyFreeCash: { status: "unknown" },
      }),
    ).toMatchObject({
      status: "unavailable",
      score: null,
      reason: "missing_required_input",
      hardPass: false,
    });
  });

  it("preserves invalid arithmetic instead of returning a score", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "cash",
        upfront: { status: "known", value: money(0) },
        availableCash: known(money(1_000)),
        monthlyFreeCash: {
          status: "invalid",
          reason: "unsafe_integer_overflow",
        },
      }),
    ).toMatchObject({
      status: "invalid",
      score: null,
      reason: "unsafe_integer_overflow",
      hardPass: false,
    });
  });
});

  it("preserves an invalid derived cash upfront amount", () => {
    expect(
      calculateAffordabilityScore({
        financingClass: "cash",
        upfront: {
          status: "invalid",
          reason: "unsafe_integer_overflow",
        },
        availableCash: known(money(1_000)),
        monthlyFreeCash: { status: "known", value: signed(1_000) },
      }),
    ).toMatchObject({
      status: "invalid",
      score: null,
      reason: "unsafe_integer_overflow",
      hardPass: false,
    });
  });

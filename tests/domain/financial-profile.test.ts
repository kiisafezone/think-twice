import { describe, expect, it } from "vitest";
import { financialProfileSchema, validateWith } from "@/domain";
import {
  known,
  notApplicable,
  unknown,
  validFinancialProfile,
} from "./fixtures";

const validate = (raw: unknown) => validateWith(financialProfileSchema, raw);

const REQUIRED_AMOUNTS = [
  "netMonthlyIncome",
  "essentialMonthlyExpenses",
  "existingMonthlyDebtPayments",
  "otherCommittedMonthlyExpenses",
  "availableCash",
] as const;

describe("financial profile", () => {
  it("accepts a complete profile", () => {
    expect(validate(validFinancialProfile()).ok).toBe(true);
  });

  it.each(REQUIRED_AMOUNTS)(
    "keeps a confirmed zero for %s as known zero",
    (field) => {
      const result = validate({ ...validFinancialProfile(), [field]: known(0) });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[field]).toEqual({ status: "known", value: 0 });
      }
    },
  );

  it.each(REQUIRED_AMOUNTS)(
    "keeps an unknown %s as unknown, never zero",
    (field) => {
      const result = validate({ ...validFinancialProfile(), [field]: unknown });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[field]).toEqual({ status: "unknown" });
      }
    },
  );

  it.each(REQUIRED_AMOUNTS)(
    "rejects a blank or missing %s instead of coercing it",
    (field) => {
      for (const blank of [null, undefined, "", 0]) {
        expect(
          validate({ ...validFinancialProfile(), [field]: blank }).ok,
        ).toBe(false);
      }
      const { [field]: _omitted, ...rest } = validFinancialProfile();
      expect(validate(rest).ok).toBe(false);
    },
  );

  it.each(REQUIRED_AMOUNTS)("rejects negative and fractional %s", (field) => {
    for (const value of [-1, 1.5]) {
      expect(
        validate({ ...validFinancialProfile(), [field]: known(value) }).ok,
      ).toBe(false);
    }
  });

  it("does not report a rejected value in its issues", () => {
    const result = validate({
      ...validFinancialProfile(),
      netMonthlyIncome: known(-987_654_321),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(JSON.stringify(result.issues)).not.toContain("987654321");
      expect(
        result.issues.some((issue) =>
          issue.path.includes("netMonthlyIncome"),
        ),
      ).toBe(true);
    }
  });

  it.each(["creditLimit", "payLaterLimit", "creditCardLimit", "borrowingCapacity"])(
    "rejects %s because credit limits are never income or cash",
    (key) => {
      expect(
        validate({ ...validFinancialProfile(), [key]: known(5_000_000) }).ok,
      ).toBe(false);
    },
  );

  it("keeps protected savings separate from available cash", () => {
    const result = validate(validFinancialProfile());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.availableCash).toEqual(known(12_000_000));
      expect(result.value.protectedSavings).toEqual(known(5_000_000));
    }
  });

  it("accepts protected savings as known, unknown, or not applicable", () => {
    for (const protectedSavings of [known(0), unknown, notApplicable]) {
      expect(
        validate({ ...validFinancialProfile(), protectedSavings }).ok,
      ).toBe(true);
    }
  });

  it("requires an explicit protected-savings designation", () => {
    const { protectedSavingsDesignation: _omitted, ...rest } =
      validFinancialProfile();
    expect(validate(rest).ok).toBe(false);
  });

  it("accepts an explicit opt-in with an exact amount", () => {
    const result = validate({
      ...validFinancialProfile(),
      protectedSavingsDesignation: { status: "opted_in", amount: 2_000_000 },
    });
    expect(result.ok).toBe(true);
  });

  it.each<unknown>([
    { status: "opted_in" },
    { status: "opted_in", amount: -1 },
    { status: "opted_in", amount: 1.5 },
    { status: "opted_in", amount: known(1) },
    { status: "not_opted_in", amount: 1_000_000 },
    { status: "maybe" },
    true,
    null,
  ])("rejects the malformed protected-savings designation %j", (designation) => {
    expect(
      validate({
        ...validFinancialProfile(),
        protectedSavingsDesignation: designation,
      }).ok,
    ).toBe(false);
  });
});

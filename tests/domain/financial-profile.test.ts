import { describe, expect, it } from "vitest";
import { deriveEffectiveAvailableCash, financialProfileSchema, validateWith } from "@/domain";
import { known, notApplicable, unknown, validFinancialProfile } from "./fixtures";

const validate = (raw: unknown) => validateWith(financialProfileSchema, raw);
const optedIn = (amount = 2_000_000) => ({
  status: "opted_in" as const, amount, disclosureAcknowledged: true as const,
});
const REQUIRED_AMOUNTS = [
  "netMonthlyIncome", "essentialMonthlyExpenses", "existingMonthlyDebtPayments",
  "otherCommittedMonthlyExpenses", "availableCash",
] as const;

describe("financial profile", () => {
  it("accepts a complete profile", () => expect(validate(validFinancialProfile()).ok).toBe(true));
  it.each(REQUIRED_AMOUNTS)("keeps a confirmed zero for %s as known zero", (field) => {
    const result = validate({ ...validFinancialProfile(), [field]: known(0) });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[field]).toEqual(known(0));
  });
  it.each(REQUIRED_AMOUNTS)("keeps an unknown %s as unknown, never zero", (field) => {
    const result = validate({ ...validFinancialProfile(), [field]: unknown });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[field]).toEqual(unknown);
  });
  it.each(REQUIRED_AMOUNTS)("rejects blank or missing %s", (field) => {
    for (const blank of [null, undefined, "", 0]) {
      expect(validate({ ...validFinancialProfile(), [field]: blank }).ok).toBe(false);
    }
    const { [field]: _omitted, ...rest } = validFinancialProfile();
    expect(validate(rest).ok).toBe(false);
  });
  it.each(REQUIRED_AMOUNTS)("rejects negative and fractional %s", (field) => {
    for (const value of [-1, 1.5]) {
      expect(validate({ ...validFinancialProfile(), [field]: known(value) }).ok).toBe(false);
    }
  });
  it("does not expose rejected financial values in validation issues", () => {
    const result = validate({ ...validFinancialProfile(), netMonthlyIncome: known(-987654321) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(JSON.stringify(result.issues)).not.toContain("987654321");
      expect(result.issues.some((issue) => issue.path.includes("netMonthlyIncome"))).toBe(true);
    }
  });
  it.each(["creditLimit", "payLaterLimit", "creditCardLimit", "borrowingCapacity"])(
    "rejects %s because credit limits are never income or cash",
    (key) => expect(validate({ ...validFinancialProfile(), [key]: known(5_000_000) }).ok).toBe(false),
  );
  it("excludes protected savings from available cash by default", () => {
    const result = validate(validFinancialProfile());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(deriveEffectiveAvailableCash(result.value)).toEqual({ status: "known", value: 12_000_000 });
    }
  });
  it("accepts known, unknown, or not-applicable protected savings when not opted in", () => {
    for (const protectedSavings of [known(0), unknown, notApplicable]) {
      expect(validate({ ...validFinancialProfile(), protectedSavings }).ok).toBe(true);
    }
  });
  it("requires an explicit designation", () => {
    const { protectedSavingsDesignation: _omitted, ...rest } = validFinancialProfile();
    expect(validate(rest).ok).toBe(false);
  });
  it("adds only the explicitly designated amount after acknowledged opt-in", () => {
    const result = validate({ ...validFinancialProfile(), protectedSavingsDesignation: optedIn() });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(deriveEffectiveAvailableCash(result.value)).toEqual({ status: "known", value: 14_000_000 });
    }
  });
  it("rejects designation above the known protected balance", () => {
    expect(validate({ ...validFinancialProfile(), protectedSavingsDesignation: optedIn(5_000_001) }).ok).toBe(false);
  });
  it("rejects opt-in when protected balance is unknown or not applicable", () => {
    for (const protectedSavings of [unknown, notApplicable]) {
      expect(validate({ ...validFinancialProfile(), protectedSavings, protectedSavingsDesignation: optedIn() }).ok).toBe(false);
    }
  });
  it("rejects opt-in without disclosure acknowledgement", () => {
    expect(validate({
      ...validFinancialProfile(),
      protectedSavingsDesignation: { status: "opted_in", amount: 2_000_000 },
    }).ok).toBe(false);
  });
  it.each<unknown>([
    { status: "opted_in" },
    { status: "opted_in", amount: -1, disclosureAcknowledged: true },
    { status: "opted_in", amount: 1.5, disclosureAcknowledged: true },
    { status: "opted_in", amount: known(1), disclosureAcknowledged: true },
    { status: "not_opted_in", amount: 1_000_000 },
    { status: "maybe" }, true, null,
  ])("rejects malformed designation %j", (designation) => {
    expect(validate({ ...validFinancialProfile(), protectedSavingsDesignation: designation }).ok).toBe(false);
  });
  it("keeps effective cash unknown when base available cash is unknown", () => {
    const result = validate({
      ...validFinancialProfile(), availableCash: unknown, protectedSavingsDesignation: optedIn(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(deriveEffectiveAvailableCash(result.value)).toEqual({ status: "unknown" });
  });
  it("reports overflow when adding designated savings exceeds the safe integer range", () => {
    const result = validate({
      ...validFinancialProfile(), availableCash: known(Number.MAX_SAFE_INTEGER),
      protectedSavingsDesignation: optedIn(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(deriveEffectiveAvailableCash(result.value)).toEqual({
      status: "invalid", reason: "unsafe_integer_overflow",
    });
  });
});

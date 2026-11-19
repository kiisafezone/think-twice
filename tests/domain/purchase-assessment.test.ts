import { describe, expect, it } from "vitest";
import { purchaseAssessmentInputSchema, validateWith } from "@/domain";
import {
  known,
  notApplicable,
  unknown,
  validPurchaseAssessment,
} from "./fixtures";

const validate = (raw: unknown) =>
  validateWith(purchaseAssessmentInputSchema, raw);

describe("purchase assessment input", () => {
  it("accepts a complete assessment", () => {
    expect(validate(validPurchaseAssessment()).ok).toBe(true);
  });

  it.each(["need", "alternatives", "utility", "impulseLevel"] as const)(
    "accepts only integers 1 to 5 for %s",
    (field) => {
      for (const value of [1, 2, 3, 4, 5]) {
        expect(
          validate({ ...validPurchaseAssessment(), [field]: known(value) }).ok,
        ).toBe(true);
      }
      for (const value of [0, 6, -1, 2.5, "3", null]) {
        expect(
          validate({ ...validPurchaseAssessment(), [field]: known(value) }).ok,
        ).toBe(false);
      }
    },
  );

  it.each([
    "need",
    "urgency",
    "alternatives",
    "utility",
    "impulseLevel",
    "socialPressure",
  ] as const)("accepts an explicit unknown state for %s", (field) => {
    const result = validate({ ...validPurchaseAssessment(), [field]: unknown });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[field]).toEqual({ status: "unknown" });
    }
  });

  it("does not allow not_applicable for required rationality answers", () => {
    expect(
      validate({ ...validPurchaseAssessment(), need: notApplicable }).ok,
    ).toBe(false);
  });

  it.each([
    "can_wait_one_month_or_longer",
    "needed_within_one_month",
    "needed_within_one_week_for_specific_reason",
    "immediate_essential_necessity",
  ])("accepts the approved urgency answer %s", (urgency) => {
    expect(
      validate({ ...validPurchaseAssessment(), urgency: known(urgency) }).ok,
    ).toBe(true);
  });

  it("rejects an unapproved urgency answer", () => {
    expect(
      validate({ ...validPurchaseAssessment(), urgency: known("soon") }).ok,
    ).toBe(false);
  });

  it("requires social pressure to be a real yes/no value", () => {
    for (const value of [true, false]) {
      expect(
        validate({ ...validPurchaseAssessment(), socialPressure: known(value) })
          .ok,
      ).toBe(true);
    }
    for (const value of ["yes", "no", 1, 0, null]) {
      expect(
        validate({ ...validPurchaseAssessment(), socialPressure: known(value) })
          .ok,
      ).toBe(false);
    }
  });

  it("does not infer social pressure from impulse level", () => {
    const input = validPurchaseAssessment();
    const { socialPressure: _omitted, ...withoutSocialPressure } = {
      ...input,
      impulseLevel: known(5),
    };
    expect(validate(withoutSocialPressure).ok).toBe(false);
  });

  it("allows potential regret to be omitted", () => {
    const input = validPurchaseAssessment();
    expect("potentialRegret" in input).toBe(false);
    expect(validate(input).ok).toBe(true);
  });

  it("accepts qualitative potential regret in each input state", () => {
    for (const potentialRegret of [
      known("Mungkin jarang terpakai"),
      unknown,
      notApplicable,
    ]) {
      expect(
        validate({ ...validPurchaseAssessment(), potentialRegret }).ok,
      ).toBe(true);
    }
  });

  it("rejects blank potential regret text", () => {
    expect(
      validate({ ...validPurchaseAssessment(), potentialRegret: known("   ") })
        .ok,
    ).toBe(false);
  });

  it("rejects unknown keys", () => {
    expect(
      validate({ ...validPurchaseAssessment(), impulseScore: known(50) }).ok,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  calculateRationalityScore,
  evaluateImpulseFriction,
  mapImpulseControl,
  mapRationalityScale,
  mapUrgency,
} from "@/domain";
import { known, unknown } from "./fixtures";

describe("rationality dimension mappings", () => {
  it.each([
    [1, 0],
    [2, 25],
    [3, 50],
    [4, 75],
    [5, 100],
  ] as const)("maps scale answer %i to %i", (answer, score) => {
    expect(mapRationalityScale(answer)).toBe(score);
  });

  it.each([
    ["can_wait_one_month_or_longer", 50],
    ["needed_within_one_month", 65],
    ["needed_within_one_week_for_specific_reason", 80],
    ["immediate_essential_necessity", 100],
  ] as const)("maps urgency %s to %i", (answer, score) => {
    expect(mapUrgency(answer)).toBe(score);
  });

  it.each([
    [1, 100],
    [2, 75],
    [3, 50],
    [4, 25],
    [5, 0],
  ] as const)("maps impulse level %i to control score %i", (level, score) => {
    expect(mapImpulseControl(level)).toBe(score);
  });
});

describe("calculateRationalityScore", () => {
  const complete = {
    need: known(4 as const),
    urgency: known("needed_within_one_month" as const),
    alternatives: known(3 as const),
    utility: known(5 as const),
    impulseLevel: known(2 as const),
  };

  it("calculates the approved weighted integer score", () => {
    expect(calculateRationalityScore(complete)).toEqual({
      status: "calculated",
      score: 74,
      dimensions: {
        need: 75,
        urgency: 65,
        alternatives: 50,
        utility: 100,
        impulseControl: 75,
      },
    });
  });

  it("uses round-half-up when the weighted sum is exactly halfway", () => {
    const result = calculateRationalityScore({
      need: known(2 as const),
      urgency: known("needed_within_one_week_for_specific_reason" as const),
      alternatives: known(1 as const),
      utility: known(1 as const),
      impulseLevel: known(5 as const),
    });
    expect(result).toMatchObject({ status: "calculated", score: 20 });
  });

  it("returns null and names every missing dimension without reweighting", () => {
    expect(
      calculateRationalityScore({
        ...complete,
        need: unknown,
        utility: unknown,
      }),
    ).toEqual({
      status: "unavailable",
      score: null,
      missingDimensions: ["need", "utility"],
    });
  });

  it("keeps the merged low-urgency answer neutral at 50", () => {
    expect(mapUrgency("can_wait_one_month_or_longer")).toBe(50);
  });
});

describe("evaluateImpulseFriction", () => {
  it("activates for impulse level 3 or higher even without social pressure", () => {
    expect(
      evaluateImpulseFriction({
        need: known(5 as const),
        impulseLevel: known(3 as const),
        socialPressure: known(false),
      }),
    ).toEqual({
      status: "active",
      evidence: ["impulse_level_at_least_3"],
    });
  });

  it("activates for social pressure with Need answer 2", () => {
    expect(
      evaluateImpulseFriction({
        need: known(2 as const),
        impulseLevel: known(1 as const),
        socialPressure: known(true),
      }),
    ).toEqual({
      status: "active",
      evidence: ["social_pressure_with_low_need"],
    });
  });

  it("does not activate the social-pressure rule when social pressure is absent", () => {
    expect(
      evaluateImpulseFriction({
        need: known(2 as const),
        impulseLevel: known(1 as const),
        socialPressure: known(false),
      }),
    ).toEqual({ status: "inactive", evidence: [] });
  });

  it("keeps missing social pressure undetermined instead of assuming no", () => {
    expect(
      evaluateImpulseFriction({
        need: known(2 as const),
        impulseLevel: known(1 as const),
        socialPressure: unknown,
      }),
    ).toEqual({
      status: "undetermined",
      missingFields: ["socialPressure"],
    });
  });

  it("keeps all missing trigger inputs visible", () => {
    expect(
      evaluateImpulseFriction({
        need: unknown,
        impulseLevel: unknown,
        socialPressure: unknown,
      }),
    ).toEqual({
      status: "undetermined",
      missingFields: ["need", "impulseLevel", "socialPressure"],
    });
  });
});

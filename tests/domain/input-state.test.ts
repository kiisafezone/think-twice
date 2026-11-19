import { describe, expect, it } from "vitest";
import {
  inputStateSchema,
  isKnown,
  requiredInputSchema,
  rupiahSchema,
  type InputState,
} from "@/domain";

const required = requiredInputSchema(rupiahSchema);
const withNotApplicable = inputStateSchema(rupiahSchema);

describe("input states", () => {
  it("keeps a confirmed zero as a known value", () => {
    const parsed = required.safeParse({ status: "known", value: 0 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ status: "known", value: 0 });
    }
  });

  it("keeps unknown distinct from a confirmed zero", () => {
    const zero = required.parse({ status: "known", value: 0 });
    const missing = required.parse({ status: "unknown" });
    expect(missing).not.toEqual(zero);
    expect(missing).toEqual({ status: "unknown" });
  });

  it("accepts not_applicable only where it is allowed", () => {
    expect(
      withNotApplicable.safeParse({ status: "not_applicable" }).success,
    ).toBe(true);
    expect(required.safeParse({ status: "not_applicable" }).success).toBe(
      false,
    );
  });

  it.each<unknown>([
    null,
    undefined,
    "",
    0,
    {},
    { status: "known" },
    { status: "blank" },
    { status: "unknown", value: 0 },
    { status: "known", value: -1 },
    { status: "known", value: null },
    { status: "known", value: "" },
  ])("rejects %j instead of coercing it to unknown or zero", (raw) => {
    expect(required.safeParse(raw).success).toBe(false);
  });

  it("narrows known values with isKnown", () => {
    const known: InputState<number> = { status: "known", value: 5 };
    const unknown: InputState<number> = { status: "unknown" };
    const notApplicable: InputState<number> = { status: "not_applicable" };
    expect(isKnown(known)).toBe(true);
    expect(isKnown(unknown)).toBe(false);
    expect(isKnown(notApplicable)).toBe(false);
  });
});

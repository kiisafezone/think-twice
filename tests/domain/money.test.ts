import { describe, expect, it } from "vitest";
import { rupiahSchema, signedRupiahSchema } from "@/domain";

describe("rupiahSchema", () => {
  it.each<unknown>([0, 1, 10_000_000, Number.MAX_SAFE_INTEGER])(
    "accepts the non-negative safe integer %s",
    (value) => {
      expect(rupiahSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each<unknown>([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
    "1000",
    null,
    undefined,
  ])("rejects %s", (value) => {
    expect(rupiahSchema.safeParse(value).success).toBe(false);
  });
});

describe("signedRupiahSchema", () => {
  it.each<unknown>([-1, 0, 1, -Number.MAX_SAFE_INTEGER])(
    "accepts the safe integer %s",
    (value) => {
      expect(signedRupiahSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each<unknown>([1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1, "-1"])(
    "rejects %s",
    (value) => {
      expect(signedRupiahSchema.safeParse(value).success).toBe(false);
    },
  );
});

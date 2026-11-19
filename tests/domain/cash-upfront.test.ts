import { describe, expect, it } from "vitest";
import { deriveCashUpfront } from "@/domain";
import { known, unknown } from "./fixtures";

describe("deriveCashUpfront", () => {
  it("derives cash upfront as purchase price plus additional fees", () => {
    expect(deriveCashUpfront(known(10_000_000), known(25_000))).toEqual({
      status: "known",
      value: 10_025_000,
    });
  });

  it("returns unknown when purchase price is unknown", () => {
    expect(deriveCashUpfront(unknown, known(25_000))).toEqual({
      status: "unknown",
    });
  });

  it("returns unknown when additional fees are unknown", () => {
    expect(deriveCashUpfront(known(10_000_000), unknown)).toEqual({
      status: "unknown",
    });
  });

  it("reports overflow instead of returning an unsafe amount", () => {
    expect(
      deriveCashUpfront(known(Number.MAX_SAFE_INTEGER), known(1)),
    ).toEqual({
      status: "invalid",
      reason: "unsafe_integer_overflow",
    });
  });
});

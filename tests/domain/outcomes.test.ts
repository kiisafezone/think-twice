import { describe, expect, expectTypeOf, it } from "vitest";
import {
  DISPOSITIONS,
  OUTCOMES,
  OUTCOME_DISPOSITION,
  OUTCOME_LABELS,
  type Verdict,
} from "@/domain";

describe("canonical outcomes", () => {
  it("defines exactly the five canonical outcomes", () => {
    expect([...OUTCOMES]).toEqual([
      "safe_to_buy",
      "buy_with_caution",
      "wait_and_reassess",
      "financially_risky",
      "do_not_buy",
    ]);
  });

  it("uses the canonical user-facing labels", () => {
    expect(OUTCOME_LABELS).toEqual({
      safe_to_buy: "Safe to Buy",
      buy_with_caution: "Buy with Caution",
      wait_and_reassess: "Wait & Reassess",
      financially_risky: "Financially Risky",
      do_not_buy: "Do Not Buy",
    });
  });

  it("defines exactly the three internal dispositions", () => {
    expect([...DISPOSITIONS]).toEqual([
      "greenlight",
      "pause_and_reflect",
      "hard_pass",
    ]);
  });

  it("maps each outcome to its documented internal disposition", () => {
    expect(OUTCOME_DISPOSITION).toEqual({
      safe_to_buy: "greenlight",
      buy_with_caution: "greenlight",
      wait_and_reassess: "pause_and_reflect",
      financially_risky: "pause_and_reflect",
      do_not_buy: "hard_pass",
    });
  });

  it("does not expose dispositions as user-facing outcomes", () => {
    for (const disposition of DISPOSITIONS) {
      expect((OUTCOMES as readonly string[]).includes(disposition)).toBe(false);
    }
  });

  it("ties each verdict to its only valid disposition at the type level", () => {
    expectTypeOf<
      Extract<Verdict, { outcome: "do_not_buy" }>["disposition"]
    >().toEqualTypeOf<"hard_pass">();
    expectTypeOf<
      Extract<Verdict, { outcome: "safe_to_buy" }>["disposition"]
    >().toEqualTypeOf<"greenlight">();
  });
});

import { describe, expect, it } from "vitest";
import { createShareSummary } from "../../src/features/decision/lib/share-summary";

describe("privacy-safe decision share summary", () => {
  it("shares the verdict, decisive reason, and next steps only", () => {
    const summary = createShareSummary({
      verdict: { outcome: "wait_and_reassess", disposition: "pause_and_reflect" },
      explanation: {
        decisiveReason: "Sebagian informasi penting belum tersedia.",
        supportingFactors: ["Dorongan impulsif terdeteksi."],
      },
      nextSteps: ["Lengkapi informasi yang belum tersedia."],
    });

    expect(summary).toContain("Wait & Reassess");
    expect(summary).toContain("Sebagian informasi penting belum tersedia.");
    expect(summary).toContain("Lengkapi informasi yang belum tersedia.");
  });

  it("does not include item identity, scores, or financial amounts", () => {
    const summary = createShareSummary({
      verdict: { outcome: "financially_risky", disposition: "pause_and_reflect" },
      explanation: {
        decisiveReason: "Ruang keuangan untuk pembelian ini terbatas.",
        supportingFactors: [],
      },
      nextSteps: ["Tinjau kembali nominal dana awal."],
    });

    expect(summary).not.toContain("Laptop kerja");
    expect(summary).not.toContain("Rp");
    expect(summary).not.toContain("/100");
    expect(summary).not.toContain("pendapatan");
    expect(summary).not.toContain("saldo");
  });
});

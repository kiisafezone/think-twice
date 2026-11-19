import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DecisionResultPanel from "../../src/features/decision/components/decision-result-panel";
import { financialProfileSchema } from "../../src/domain/financial-profile";
import { purchaseAssessmentInputSchema } from "../../src/domain/purchase-assessment";
import { purchaseInputSchema } from "../../src/domain/purchase";

const purchase = purchaseInputSchema.parse({
  itemName: "Laptop kerja",
  category: "Elektronik",
  purchasePrice: { status: "known", value: 10_000_000 },
  additionalFees: { status: "known", value: 0 },
  paymentPlan: { financingClass: "cash" },
});

const purchaseAssessment = purchaseAssessmentInputSchema.parse({
  need: { status: "known", value: 5 },
  urgency: { status: "known", value: "immediate_essential_necessity" },
  alternatives: { status: "known", value: 5 },
  utility: { status: "known", value: 5 },
  impulseLevel: { status: "known", value: 1 },
  socialPressure: { status: "known", value: false },
});

function financialProfile(availableCash: { status: "known"; value: number } | { status: "unknown" }) {
  return financialProfileSchema.parse({
    netMonthlyIncome: { status: "known", value: 10_000_000 },
    essentialMonthlyExpenses: { status: "known", value: 1_000_000 },
    existingMonthlyDebtPayments: { status: "known", value: 0 },
    otherCommittedMonthlyExpenses: { status: "known", value: 0 },
    availableCash,
    protectedSavings: { status: "not_applicable" },
    protectedSavingsDesignation: { status: "not_opted_in" },
  });
}

describe("Decision Intelligence result presentation", () => {
  it("renders the canonical verdict and separate affordability and rationality results", () => {
    const html = renderToStaticMarkup(createElement(DecisionResultPanel, {
      purchase,
      purchaseAssessment,
      financialProfile: financialProfile({ status: "known", value: 100_000_000 }),
    }));

    expect(html).toContain("Safe to Buy");
    expect(html).toContain("Financial Reality Check");
    expect(html).toContain("Purchase Decision Assessment");
    expect(html).toContain("100");
    expect(html).toContain("Mengapa hasil ini muncul?");
    expect(html).toContain("Langkah berikutnya");
  });

  it("does not present a favorable result when required financial data is unknown", () => {
    const html = renderToStaticMarkup(createElement(DecisionResultPanel, {
      purchase,
      purchaseAssessment,
      financialProfile: financialProfile({ status: "unknown" }),
    }));

    expect(html).toContain("Wait &amp; Reassess");
    expect(html).toContain("Kas yang benar-benar tersedia diperlukan");
    expect(html).not.toContain("Safe to Buy");
  });
});

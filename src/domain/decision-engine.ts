import type { DecisionInput } from "./decision-input";
import {
  calculateAffordabilityScore,
  deriveMonthlyFreeCash,
  type AffordabilityScoreResult,
} from "./financial-calculations";
import type { RequiredInput } from "./input-state";
import { OUTCOME_DISPOSITION, type Outcome, type Verdict } from "./outcomes";
import { deriveCashUpfront } from "./purchase";
import {
  calculateRationalityScore,
  evaluateImpulseFriction,
} from "./rationality-calculations";
import type {
  AssessmentResult,
  DecisionResult,
  MissingField,
  VerdictReason,
} from "./results";
import type { Rupiah } from "./money";
import { deriveEffectiveAvailableCash } from "./financial-profile";

export const DECISION_RULE_VERSION = "v1";

const WHY: Record<string, string> = {
  "purchase.purchasePrice": "Harga barang diperlukan untuk menghitung total pembayaran dan dampaknya pada kas.",
  "purchase.additionalFees": "Biaya tambahan diperlukan agar kebutuhan dana awal tidak diremehkan.",
  "purchase.paymentPlan.upfrontPayment": "Dana awal menentukan berapa banyak kas yang harus tersedia sekarang.",
  "purchase.paymentPlan.installment.monthlyInstallment": "Nominal cicilan diperlukan untuk menilai beban pembayaran bulanan.",
  "financialProfile.availableCash": "Kas yang benar-benar tersedia diperlukan untuk menilai kecukupan dana awal.",
  "financialProfile.netMonthlyIncome": "Pendapatan bersih diperlukan untuk menghitung sisa kas bulanan.",
  "financialProfile.essentialMonthlyExpenses": "Pengeluaran pokok diperlukan agar sisa kas tidak dinilai terlalu tinggi.",
  "financialProfile.existingMonthlyDebtPayments": "Cicilan dan utang yang sudah berjalan mengurangi sisa kas bulanan.",
  "financialProfile.otherCommittedMonthlyExpenses": "Komitmen rutin lain juga mengurangi sisa kas yang tersedia.",
  "purchaseAssessment.need": "Tingkat kebutuhan membantu membedakan kebutuhan nyata dan keinginan.",
  "purchaseAssessment.urgency": "Waktu kebutuhan membantu membedakan urgensi nyata dari dorongan sesaat.",
  "purchaseAssessment.alternatives": "Alternatif yang dipertimbangkan membantu menilai apakah pilihan ini sudah dibandingkan.",
  "purchaseAssessment.utility": "Manfaat yang diharapkan membantu menilai nilai guna pembelian.",
  "purchaseAssessment.impulseLevel": "Tingkat dorongan pembelian diperlukan untuk menilai kontrol impuls.",
  "purchaseAssessment.socialPressure": "Tekanan sosial adalah pemicu perilaku yang dinilai secara terpisah dan tidak boleh diasumsikan tidak ada.",
};

function missing(assessment: MissingField["assessment"], field: string): MissingField {
  return { assessment, field, whyItMatters: WHY[field] ?? "Jawaban ini diperlukan agar hasil penilaian dapat dipercaya." };
}

function isUnknown<T>(input: RequiredInput<T>): boolean {
  return input.status === "unknown";
}

function asAssessment(
  kind: "affordability" | "rationality",
  score: number | null,
  status: "calculated" | "unavailable" | "invalid",
  missingFields: readonly MissingField[],
  reasons: readonly string[],
  error?: "unsafe_integer_overflow",
): AssessmentResult {
  const base = {
    kind,
    reasons,
    completeness: { isComplete: missingFields.length === 0, missingFields },
    assumptions: [],
    ruleVersion: DECISION_RULE_VERSION,
  } as const;
  if (status === "invalid") {
    return { ...base, status, score: null, error: error ?? "unsafe_integer_overflow" };
  }
  if (status === "unavailable" || score === null) return { ...base, status: "unavailable", score: null };
  return { ...base, status: "calculated", score };
}

function verdict(outcome: Outcome): Verdict {
  return { outcome, disposition: OUTCOME_DISPOSITION[outcome] } as Verdict;
}

export function evaluateDecision(input: DecisionInput): DecisionResult {
  const profile = input.financialProfile;
  const monthlyFreeCash = deriveMonthlyFreeCash({
    netMonthlyIncome: profile.netMonthlyIncome,
    essentialMonthlyExpenses: profile.essentialMonthlyExpenses,
    existingMonthlyDebtPayments: profile.existingMonthlyDebtPayments,
    otherCommittedMonthlyExpenses: profile.otherCommittedMonthlyExpenses,
  });
  const effectiveCash = deriveEffectiveAvailableCash(profile);
  const paymentPlan = input.purchase.paymentPlan;
  const cashClass = paymentPlan.financingClass === "cash";
  const financedPlan = paymentPlan.financingClass === "financed" ? paymentPlan : null;
  const cashUpfront = deriveCashUpfront(
    input.purchase.purchasePrice,
    input.purchase.additionalFees,
  );

  const financialMissing: MissingField[] = [];
  if (cashClass) {
    if (isUnknown(input.purchase.purchasePrice)) financialMissing.push(missing("affordability", "purchase.purchasePrice"));
    if (isUnknown(input.purchase.additionalFees)) financialMissing.push(missing("affordability", "purchase.additionalFees"));
  } else if (isUnknown(financedPlan!.upfrontPayment)) {
    financialMissing.push(missing("affordability", "purchase.paymentPlan.upfrontPayment"));
  }
  if (isUnknown(profile.availableCash)) financialMissing.push(missing("affordability", "financialProfile.availableCash"));
  if (isUnknown(profile.netMonthlyIncome)) financialMissing.push(missing("affordability", "financialProfile.netMonthlyIncome"));
  if (isUnknown(profile.essentialMonthlyExpenses)) financialMissing.push(missing("affordability", "financialProfile.essentialMonthlyExpenses"));
  if (isUnknown(profile.existingMonthlyDebtPayments)) financialMissing.push(missing("affordability", "financialProfile.existingMonthlyDebtPayments"));
  if (isUnknown(profile.otherCommittedMonthlyExpenses)) financialMissing.push(missing("affordability", "financialProfile.otherCommittedMonthlyExpenses"));
  if (!cashClass && isUnknown(financedPlan!.installment.monthlyInstallment)) {
    financialMissing.push(missing("affordability", "purchase.paymentPlan.installment.monthlyInstallment"));
  }

  const safeAvailableCash: RequiredInput<Rupiah> =
    effectiveCash.status === "known"
      ? { status: "known", value: effectiveCash.value }
      : { status: "unknown" };

  let affordabilityCalculation: AffordabilityScoreResult;
  if (effectiveCash.status === "invalid") {
    affordabilityCalculation = calculateAffordabilityScore(cashClass
      ? { financingClass: "cash", upfront: cashUpfront, availableCash: { status: "unknown" }, monthlyFreeCash }
      : {
          financingClass: "financed",
          upfront: financedPlan!.upfrontPayment,
          availableCash: { status: "unknown" },
          monthlyInstallment: financedPlan!.installment.monthlyInstallment,
          monthlyFreeCash,
        });
    affordabilityCalculation = {
      status: "invalid",
      score: null,
      reason: "unsafe_integer_overflow",
      penalties: affordabilityCalculation.penalties,
      hardPass: affordabilityCalculation.hardPass,
    };
  } else {
    affordabilityCalculation = calculateAffordabilityScore(cashClass
      ? { financingClass: "cash", upfront: cashUpfront, availableCash: safeAvailableCash, monthlyFreeCash }
      : {
          financingClass: "financed",
          upfront: financedPlan!.upfrontPayment,
          availableCash: safeAvailableCash,
          monthlyInstallment: financedPlan!.installment.monthlyInstallment,
          monthlyFreeCash,
        });
  }

  if (monthlyFreeCash.status === "unknown") {
    for (const [field, value] of [
      ["financialProfile.netMonthlyIncome", profile.netMonthlyIncome],
      ["financialProfile.essentialMonthlyExpenses", profile.essentialMonthlyExpenses],
      ["financialProfile.existingMonthlyDebtPayments", profile.existingMonthlyDebtPayments],
      ["financialProfile.otherCommittedMonthlyExpenses", profile.otherCommittedMonthlyExpenses],
    ] as const) {
      if (isUnknown(value) && !financialMissing.some((entry) => entry.field === field)) {
        financialMissing.push(missing("affordability", field));
      }
    }
  }

  const rationalityInput = input.purchaseAssessment;
  const rationalityCalculation = calculateRationalityScore({
    need: rationalityInput.need,
    urgency: rationalityInput.urgency,
    alternatives: rationalityInput.alternatives,
    utility: rationalityInput.utility,
    impulseLevel: rationalityInput.impulseLevel,
  });
  const friction = evaluateImpulseFriction({
    need: rationalityInput.need,
    impulseLevel: rationalityInput.impulseLevel,
    socialPressure: rationalityInput.socialPressure,
  });

  const rationalityMissing: MissingField[] = [];
  if (rationalityCalculation.status === "unavailable") {
    for (const field of rationalityCalculation.missingDimensions) {
      rationalityMissing.push(missing("rationality", `purchaseAssessment.${field}`));
    }
  }
  if (friction.status === "undetermined" && isUnknown(rationalityInput.socialPressure)) {
    rationalityMissing.push(missing("rationality", "purchaseAssessment.socialPressure"));
  }

  const affordabilityStatus =
    affordabilityCalculation.status === "invalid" ? "invalid" :
    affordabilityCalculation.status === "unavailable" ? "unavailable" : "calculated";
  const affordabilityReasons = affordabilityCalculation.status === "calculated"
    ? [`Penilaian keterjangkauan dihitung dari penalti dampak kas, beban cicilan, dan tekanan keuangan.`]
    : affordabilityCalculation.status === "invalid"
      ? ["Perhitungan kas melewati batas angka aman sehingga skor belum dapat ditentukan."]
      : affordabilityCalculation.reason === "cash_impact_hard_pass"
        ? ["Dana awal yang dibutuhkan melebihi kas yang tersedia, sehingga skor keterjangkauan tidak dapat dihitung."]
        : ["Skor keterjangkauan belum dapat dihitung karena ada data keuangan yang belum diketahui."];
  const affordability = asAssessment(
    "affordability",
    affordabilityCalculation.score,
    affordabilityStatus,
    financialMissing,
    affordabilityReasons,
    affordabilityCalculation.status === "invalid" ? affordabilityCalculation.reason : undefined,
  );
  const rationality = asAssessment(
    "rationality",
    rationalityCalculation.status === "calculated" ? rationalityCalculation.score : null,
    rationalityCalculation.status === "calculated" ? "calculated" : "unavailable",
    rationalityMissing,
    rationalityCalculation.status === "calculated"
      ? ["Skor rasionalitas dihitung dari kebutuhan, urgensi, alternatif, manfaat, dan kontrol impuls."]
      : ["Skor rasionalitas belum dapat dihitung karena satu atau lebih dimensi wajib belum dijawab."],
  );

  const allMissing = [...financialMissing, ...rationalityMissing];
  const impulseFriction = {
    status: friction.status,
    evidence: friction.status === "active" ? friction.evidence : [],
  } as const;

  const reasons: VerdictReason[] = [];
  let outcome: Outcome | null = null;
  const affordabilityScore = affordabilityCalculation.status === "calculated"
    ? affordabilityCalculation.score : null;
  const upfrontExceeds = affordabilityCalculation.hardPass &&
    (affordabilityCalculation.penalties.cashImpact.status === "hard_pass" ||
      (affordabilityCalculation.penalties.cashImpact.status === "known" &&
       affordabilityCalculation.penalties.cashImpact.hardPass));
  const negativeCashWithNewRepayment = !cashClass &&
    monthlyFreeCash.status === "known" && monthlyFreeCash.value < 0;
  const hardPassByScore = affordabilityScore !== null && affordabilityScore < 35;

  if (hardPassByScore || negativeCashWithNewRepayment || upfrontExceeds) {
    outcome = "do_not_buy";
    if (hardPassByScore) reasons.push({
      priority: 1, ruleId: "financial.affordability_below_35",
      explanation: "Skor keterjangkauan berada di bawah 35, sehingga pembelian ini terlalu membebani kondisi keuangan yang dihitung.",
    });
    if (negativeCashWithNewRepayment) reasons.push({
      priority: 1, ruleId: "financial.new_repayment_with_negative_free_cash",
      explanation: "Sisa kas bulanan saat ini negatif. Menambahkan kewajiban cicilan baru akan menambah tekanan pada arus kas.",
    });
    if (upfrontExceeds) reasons.push({
      priority: 1, ruleId: "financial.upfront_exceeds_available_cash",
      explanation: "Dana awal yang dibutuhkan melebihi kas yang tersedia untuk pembelian ini.",
    });
  }

  const cashUseAbove80 = affordabilityCalculation.penalties.cashImpact.status === "known" &&
    affordabilityCalculation.penalties.cashImpact.penalty === 40;
  const financialRiskByScore = affordabilityScore !== null &&
    affordabilityScore >= 35 && affordabilityScore <= 59;
  if (outcome === null && (financialRiskByScore || cashUseAbove80)) {
    outcome = "financially_risky";
    if (financialRiskByScore) reasons.push({
      priority: 2, ruleId: "financial.affordability_35_to_59",
      explanation: "Skor keterjangkauan berada pada rentang 35–59, sehingga ruang keuangan untuk pembelian ini terbatas.",
    });
    if (cashUseAbove80) reasons.push({
      priority: 2, ruleId: "financial.cash_use_above_80_percent",
      explanation: "Dana awal akan menggunakan lebih dari 80% kas yang tersedia, sehingga sisa likuiditas menjadi sangat terbatas.",
    });
  }

  const rationalityBelow50 = rationalityCalculation.status === "calculated" &&
    rationalityCalculation.score < 50;
  const calculationInvalid = affordabilityCalculation.status === "invalid";
  const criticalMissing = allMissing.length > 0 || friction.status === "undetermined";
  if (outcome === null && (rationalityBelow50 || friction.status === "active" || criticalMissing || calculationInvalid)) {
    outcome = "wait_and_reassess";
    if (rationalityBelow50) reasons.push({
      priority: 3, ruleId: "behavior.rationality_below_50",
      explanation: "Skor rasionalitas berada di bawah 50. Pertimbangkan kembali kebutuhan, alternatif, manfaat, dan dorongan pembelian.",
    });
    if (friction.status === "active") reasons.push({
      priority: 3, ruleId: "behavior.impulse_friction_active",
      explanation: "Ada tanda dorongan impulsif atau tekanan sosial. Beri jeda sebelum mengambil keputusan.",
    });
    if (criticalMissing) reasons.push({
      priority: 3, ruleId: "data.critical_information_missing",
      explanation: "Sebagian informasi penting belum tersedia, sehingga keputusan belum dapat dinilai secara menyeluruh.",
    });
    if (calculationInvalid) reasons.push({
      priority: 3, ruleId: "calculation.unsafe_integer_overflow",
      explanation: "Perhitungan menghasilkan angka di luar batas aman. Periksa kembali nominal yang digunakan sebelum melanjutkan.",
    });
  }

  if (outcome === null && affordabilityScore !== null && affordabilityScore >= 80) {
    outcome = "safe_to_buy";
    reasons.push({
      priority: 4, ruleId: "greenlight.affordability_at_least_80",
      explanation: "Berdasarkan data yang diberikan, pembelian berada dalam batas keterjangkauan yang dihitung dan tidak memicu aturan penundaan.",
    });
  } else if (outcome === null && affordabilityScore !== null && affordabilityScore >= 60 && affordabilityScore <= 79) {
    outcome = "buy_with_caution";
    reasons.push({
      priority: 4, ruleId: "greenlight.affordability_60_to_79",
      explanation: "Pembelian masih berada dalam rentang keterjangkauan, tetapi tetap mengurangi ruang keuangan sehingga perlu direncanakan dengan cermat.",
    });
  }

  // A complete validated input must resolve to one of the five canonical outcomes.
  // If a score is unexpectedly unavailable without a listed missing field, fail
  // conservatively rather than infer a favorable result.
  if (outcome === null) {
    outcome = "wait_and_reassess";
    reasons.push({
      priority: 3, ruleId: "data.assessment_unavailable",
      explanation: "Hasil penilaian belum dapat dipastikan dari data yang tersedia. Lengkapi informasi sebelum mengambil keputusan.",
    });
  }

  const nextSteps: Record<Outcome, readonly string[]> = {
    do_not_buy: [
      "Pertimbangkan menurunkan nominal cicilan atau memilih opsi dengan dana awal lebih kecil.",
      "Jika mempertimbangkan tenor lebih panjang, bandingkan total pembayaran dan seluruh biaya terlebih dahulu.",
      "Pilihan paling aman saat ini adalah menunda sampai kas tersedia atau sisa kas bulanan membaik.",
    ],
    financially_risky: [
      "Tinjau kembali nominal dana awal dan pastikan masih ada kas untuk kebutuhan penting.",
      "Pertimbangkan opsi yang lebih rendah biayanya atau tunda sampai ruang keuangan lebih longgar.",
    ],
    wait_and_reassess: [
      "Lengkapi informasi yang belum tersedia dan tinjau kembali alasan serta waktu pembelian.",
      "Jika ada dorongan impulsif atau tekanan sosial, beri jeda sebelum memutuskan.",
    ],
    buy_with_caution: [
      "Pastikan pembelian tidak mengganggu kebutuhan pokok dan komitmen yang sudah berjalan.",
      "Sisakan ruang untuk pengeluaran tak terduga sebelum menyelesaikan pembelian.",
    ],
    safe_to_buy: [
      "Periksa kembali rincian harga, biaya, dan kebutuhan sebelum melakukan pembayaran.",
      "Tetap sisakan dana untuk kebutuhan rutin dan kondisi tak terduga.",
    ],
  };

  return {
    ruleVersion: DECISION_RULE_VERSION,
    affordability,
    rationality,
    derivedMetrics: [],
    impulseFriction,
    verdict: verdict(outcome),
    verdictReasons: reasons,
    explanation: {
      decisiveReason: reasons[0]?.explanation ?? "Keputusan belum dapat ditentukan.",
      supportingFactors: reasons.slice(1).map((reason) => reason.explanation),
    },
    missingFields: allMissing,
    assumptions: [
      "Penilaian menggunakan data yang diberikan dan tidak terhubung ke rekening atau penyedia kredit.",
      "Perhitungan cicilan hanya mendukung jadwal bulanan pada V1.",
    ],
    nextSteps: nextSteps[outcome],
  };
}

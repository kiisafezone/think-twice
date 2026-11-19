"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { decisionInputSchema } from "../../../domain/decision-input";
import { evaluateDecision } from "../../../domain/decision-engine";
import { OUTCOME_LABELS } from "../../../domain/outcomes";
import type { PurchaseInput } from "../../../domain/purchase";
import type { PurchaseAssessmentInput } from "../../../domain/purchase-assessment";
import type { FinancialProfile } from "../../../domain/financial-profile";
import type { AssessmentResult, DecisionResult } from "../../../domain/results";
import {
  createDecisionHistoryStore,
  type SavedDecision,
} from "../../history/storage/local-decision-history";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const outcomeDescriptions = {
  safe_to_buy: "Data yang diberikan menunjukkan pembelian berada dalam batas keterjangkauan yang dihitung dan tidak memicu aturan penundaan.",
  buy_with_caution: "Pembelian masih berada dalam rentang keterjangkauan, tetapi akan mengurangi ruang keuangan.",
  wait_and_reassess: "Ada informasi penting yang belum tersedia atau faktor perilaku yang perlu ditinjau sebelum memutuskan.",
  financially_risky: "Ruang keuangan untuk pembelian ini terbatas atau penggunaan kas awal terlalu tinggi.",
  do_not_buy: "Kondisi keuangan saat ini memicu aturan yang membuat pembelian ini tidak layak dilanjutkan.",
} as const;

function assessmentStatus(result: AssessmentResult) {
  if (result.status === "calculated") return "Dihitung";
  if (result.status === "invalid") return "Tidak valid untuk dihitung";
  return "Belum dapat dihitung";
}

function AssessmentCard({
  title,
  description,
  result,
}: {
  title: string;
  description: string;
  result: AssessmentResult;
}) {
  return (
    <article className="decision-assessment-card">
      <div className="decision-card-heading">
        <h3>{title}</h3>
        <span>{assessmentStatus(result)}</span>
      </div>
      <p className="decision-score">
        {result.score === null ? "—" : result.score}
        <small>{result.score === null ? "" : " / 100"}</small>
      </p>
      <p className="decision-card-description">{description}</p>
      {result.reasons.map((reason) => <p className="decision-assessment-reason" key={reason}>{reason}</p>)}
      {result.status === "invalid" ? (
        <p className="decision-assessment-reason">Periksa kembali nominal. Sistem tidak mengganti angka yang tidak aman dengan nilai perkiraan.</p>
      ) : null}
    </article>
  );
}

function createRecordId() {
  return `decision-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function shareText(result: DecisionResult) {
  const label = OUTCOME_LABELS[result.verdict.outcome];
  const lines = [
    "THINK TWICE.",
    "Hasil Decision Intelligence",
    `Rekomendasi: ${label}`,
    "",
    result.explanation.decisiveReason,
    "",
    "Langkah berikutnya:",
    ...result.nextSteps.map((step) => `• ${step}`),
    "",
    "Hasil ini merupakan alat bantu refleksi berdasarkan informasi yang diberikan, bukan jaminan hasil finansial.",
    "Think twice today. Thank yourself tomorrow.",
  ];
  return lines.join("\n");
}

function makeSavedDecision(
  id: string,
  purchase: PurchaseInput,
  result: DecisionResult,
): SavedDecision {
  return {
    id,
    createdAt: new Date().toISOString(),
    itemName: purchase.itemName,
    category: purchase.category,
    ruleVersion: result.ruleVersion,
    outcome: result.verdict.outcome,
    affordabilityStatus: result.affordability.status,
    affordabilityScore: result.affordability.score,
    rationalityStatus: result.rationality.status,
    rationalityScore: result.rationality.score,
    decisiveReason: result.explanation.decisiveReason,
    supportingFactors: [...result.explanation.supportingFactors],
    nextSteps: [...result.nextSteps],
    missingFields: result.missingFields.map((field) => ({ ...field })),
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DecisionResultPanel({
  purchase,
  purchaseAssessment,
  financialProfile,
}: {
  purchase: PurchaseInput;
  purchaseAssessment: PurchaseAssessmentInput;
  financialProfile: FinancialProfile;
}) {
  const result = useMemo(() => {
    const parsed = decisionInputSchema.safeParse({
      purchase,
      purchaseAssessment,
      financialProfile,
    });
    return parsed.success ? evaluateDecision(parsed.data) : null;
  }, [purchase, purchaseAssessment, financialProfile]);

  const [history, setHistory] = useState<SavedDecision[]>([]);
  const [historyStatus, setHistoryStatus] = useState<"loading" | "ready" | "corrupt" | "unavailable">("loading");
  const [historyMessage, setHistoryMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const savedId = useRef<string | null>(null);

  useEffect(() => {
    try {
      const store = createDecisionHistoryStore(window.localStorage);
      const loaded = store.read();
      setHistory(loaded.records);
      setHistoryStatus(loaded.status);
    } catch {
      setHistoryStatus("unavailable");
    }
  }, []);

  if (!result) {
    return (
      <section className="decision-panel" role="alert" aria-labelledby="decision-error-title">
        <p className="section-kicker">DECISION INTELLIGENCE</p>
        <h2 id="decision-error-title">Penilaian belum dapat digabungkan.</h2>
        <p className="section-description">Ada data yang tidak sesuai dengan kontrak penilaian. Periksa kembali tahap sebelumnya. Tidak ada rekomendasi yang dibuat.</p>
      </section>
    );
  }

  const outcome = result.verdict.outcome;
  const preview = shareText(result);
  const alreadySaved = savedId.current !== null && history.some((record) => record.id === savedId.current);

  function saveCurrentDecision() {
    try {
      const store = createDecisionHistoryStore(window.localStorage);
      const id = savedId.current ?? createRecordId();
      const saved = store.save(makeSavedDecision(id, purchase, result));
      if (saved.status === "ok") {
        savedId.current = id;
        setHistory(saved.records);
        setHistoryStatus("ready");
        setHistoryMessage("Hasil keputusan disimpan di browser ini.");
      } else {
        setHistoryMessage(
          saved.status === "corrupt"
            ? "Riwayat lama tidak dapat dibaca. Data tidak ditimpa agar tidak hilang."
            : saved.status === "invalid_record"
              ? "Hasil ini tidak memenuhi format penyimpanan."
              : "Penyimpanan browser tidak tersedia. Tidak ada data yang disimpan.",
        );
      }
    } catch {
      setHistoryMessage("Penyimpanan browser tidak tersedia. Tidak ada data yang disimpan.");
    }
  }

  async function shareCurrentDecision() {
    setShareMessage("");
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "THINK TWICE. — Hasil keputusan", text: preview });
        setShareMessage("Ringkasan berhasil diserahkan ke fitur berbagi perangkat.");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(preview);
        setShareMessage("Ringkasan disalin. Kamu bisa menempelkannya di aplikasi pilihanmu.");
        return;
      }
      setShareMessage("Fitur berbagi atau salin tidak tersedia di browser ini. Kamu tetap dapat menyalin pratinjau di bawah.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareMessage("Berbagi dibatalkan. Tidak ada ringkasan yang dikirim.");
      } else {
        setShareMessage("Ringkasan belum dapat dibagikan. Pratinjau tetap tersedia untuk disalin manual.");
      }
    }
  }

  function deleteRecord(id: string) {
    try {
      const deleted = createDecisionHistoryStore(window.localStorage).remove(id);
      if (deleted.status === "ok") {
        setHistory(deleted.records);
        setHistoryMessage("Satu riwayat keputusan dihapus dari browser ini.");
        if (savedId.current === id) savedId.current = null;
      } else {
        setHistoryMessage("Riwayat tidak dapat diperbarui. Data belum dihapus.");
      }
    } catch {
      setHistoryMessage("Penyimpanan browser tidak tersedia. Riwayat belum dihapus.");
    }
  }

  function clearHistory() {
    try {
      const cleared = createDecisionHistoryStore(window.localStorage).clear();
      if (cleared.status === "ok") {
        setHistory([]);
        savedId.current = null;
        setHistoryMessage("Semua riwayat lokal dihapus dari browser ini.");
        setConfirmClear(false);
      } else {
        setHistoryMessage("Riwayat belum dapat dihapus.");
      }
    } catch {
      setHistoryMessage("Penyimpanan browser tidak tersedia. Riwayat belum dapat dihapus.");
    }
  }

  return (
    <section className="decision-panel" aria-labelledby="decision-title" aria-live="polite">
      <div className="eyebrow"><span className="eyebrow-dot" /> LANGKAH 04 · DECISION INTELLIGENCE</div>
      <div className="decision-intro">
        <p className="section-kicker">HASIL PENILAIAN V1 · ATURAN {result.ruleVersion.toUpperCase()}</p>
        <h2 id="decision-title">Inilah yang perlu kamu pertimbangkan.</h2>
        <p className="section-description">Penilaian keuangan dan alasan membeli tetap ditampilkan terpisah. Rekomendasi akhir mengikuti urutan aturan yang telah ditetapkan.</p>
      </div>

      <article className={`decision-verdict decision-verdict--${outcome}`} aria-labelledby="decision-outcome-title">
        <p className="decision-verdict-label">REKOMENDASI</p>
        <h3 id="decision-outcome-title">{OUTCOME_LABELS[outcome]}</h3>
        <p>{outcomeDescriptions[outcome]}</p>
        <p className="decision-decisive-reason">{result.explanation.decisiveReason}</p>
      </article>

      <div className="decision-assessments" aria-label="Hasil dua penilaian terpisah">
        <AssessmentCard
          title="Financial Reality Check"
          description="Skor keterjangkauan berdasarkan dampak kas, beban cicilan, dan tekanan keuangan."
          result={result.affordability}
        />
        <AssessmentCard
          title="Purchase Decision Assessment"
          description="Skor rasionalitas berdasarkan kebutuhan, urgensi, alternatif, manfaat, dan kontrol impuls."
          result={result.rationality}
        />
      </div>

      <section className="decision-detail-section" aria-labelledby="decision-factors-title">
        <h3 id="decision-factors-title">Mengapa hasil ini muncul?</h3>
        <ol className="decision-reason-list">
          {result.verdictReasons.map((reason) => (
            <li key={reason.ruleId}>
              <span>{reason.explanation}</span>
              <small>Aturan: {reason.ruleId}</small>
            </li>
          ))}
        </ol>
        {result.impulseFriction.status !== "undetermined" ? (
          <p className="decision-inline-note">
            Impulse friction: <strong>{result.impulseFriction.status === "active" ? "terdeteksi" : "tidak terdeteksi"}</strong>
            {result.impulseFriction.evidence.length > 0 ? ` — ${result.impulseFriction.evidence.join("; ")}` : ""}
          </p>
        ) : (
          <p className="decision-inline-note">Impulse friction belum dapat ditentukan karena satu atau lebih jawaban pemicunya belum diketahui.</p>
        )}
        {result.explanation.supportingFactors.length > 0 ? (
          <>
            <h4>Faktor pendukung</h4>
            <ul>{result.explanation.supportingFactors.map((factor) => <li key={factor}>{factor}</li>)}</ul>
          </>
        ) : null}
      </section>

      <section className="decision-detail-section" aria-labelledby="decision-completeness-title">
        <h3 id="decision-completeness-title">Kelengkapan informasi</h3>
        {result.missingFields.length === 0 ? (
          <p className="decision-complete-note">Semua informasi wajib untuk penilaian yang dihitung telah tersedia.</p>
        ) : (
          <>
            <p className="section-description">Informasi berikut belum tersedia. Skor yang memerlukannya tidak dibuat secara parsial.</p>
            <ul className="decision-missing-list">
              {result.missingFields.map((field) => (
                <li key={`${field.assessment}:${field.field}`}>
                  <strong>{field.assessment === "affordability" ? "Financial Reality Check" : "Purchase Decision Assessment"} · {field.field}</strong>
                  <span>{field.whyItMatters}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="decision-detail-section" aria-labelledby="decision-next-steps-title">
        <h3 id="decision-next-steps-title">Langkah berikutnya</h3>
        <ol className="decision-next-steps">
          {result.nextSteps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <details className="decision-assumptions">
        <summary>Asumsi dan batasan penilaian</summary>
        <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        <p>THINK TWICE. membantu menyusun pertimbangan. Keputusan akhir tetap berada di tanganmu.</p>
      </details>

      <section className="decision-share-section" aria-labelledby="decision-share-title">
        <h3 id="decision-share-title">Bagikan ringkasan</h3>
        <p className="section-description">Pratinjau ini tidak memuat nama barang, harga, pendapatan, saldo, utang, cicilan, atau jawaban mentah. Periksa isinya sebelum membagikan.</p>
        <label className="decision-preview-label" htmlFor="decision-share-preview">Pratinjau yang akan dibagikan</label>
        <textarea id="decision-share-preview" readOnly rows={9} value={preview} />
        <div className="confirmation-actions">
          <button className="button-primary" type="button" onClick={shareCurrentDecision}>Bagikan ringkasan</button>
        </div>
        {shareMessage ? <p className="decision-feedback" role="status">{shareMessage}</p> : null}
      </section>

      <section className="decision-history-section" aria-labelledby="decision-history-title">
        <h3 id="decision-history-title">Riwayat keputusan di perangkat ini</h3>
        <p className="section-description">Penyimpanan hanya berjalan setelah kamu memilih simpan. Riwayat memuat nama barang, kategori, hasil, skor, alasan, dan langkah berikutnya; tidak menyimpan nominal keuangan atau jawaban mentah.</p>
        <p className="decision-storage-warning">localStorage berada di profil browser dan bukan penyimpanan terenkripsi. Orang atau perangkat lunak lain yang memiliki akses ke profil browser ini mungkin dapat membacanya. Riwayat dapat hilang jika data browser dihapus.</p>
        <div className="confirmation-actions">
          <button className="button-primary" type="button" onClick={saveCurrentDecision} disabled={alreadySaved}> {alreadySaved ? "Sudah disimpan" : "Simpan hasil ini"}</button>
        </div>
        {historyMessage ? <p className="decision-feedback" role="status">{historyMessage}</p> : null}
        {historyStatus === "loading" ? <p className="section-description">Memuat riwayat lokal…</p> : null}
        {historyStatus === "corrupt" ? <p className="field-error" role="alert">Data riwayat tidak dapat dibaca. Data lama tidak diubah atau ditimpa.</p> : null}
        {historyStatus === "unavailable" ? <p className="field-error" role="alert">Penyimpanan lokal tidak tersedia pada browser ini.</p> : null}
        {history.length > 0 ? (
          <div className="decision-history-list">
            {history.map((record) => (
              <article className="decision-history-item" key={record.id}>
                <div>
                  <p className="decision-history-date">{formatDate(record.createdAt)}</p>
                  <h4>{record.itemName}</h4>
                  <p>{record.category} · {OUTCOME_LABELS[record.outcome]}</p>
                  <p className="decision-history-scores">
                    Keterjangkauan: {record.affordabilityScore === null ? "—" : `${record.affordabilityScore}/100`} ·
                    Rasionalitas: {record.rationalityScore === null ? "—" : `${record.rationalityScore}/100`}
                  </p>
                </div>
                <button className="button-secondary" type="button" onClick={() => deleteRecord(record.id)} aria-label={`Hapus riwayat ${record.itemName}`}>Hapus</button>
              </article>
            ))}
          </div>
        ) : historyStatus === "ready" ? (
          <p className="decision-empty-history">Belum ada keputusan yang disimpan di browser ini.</p>
        ) : null}
        {history.length > 0 ? (
          <div className="confirmation-actions">
            {confirmClear ? (
              <>
                <span className="decision-confirm-copy">Hapus seluruh riwayat dari browser ini?</span>
                <button className="button-primary" type="button" onClick={clearHistory}>Ya, hapus semua</button>
                <button className="button-secondary" type="button" onClick={() => setConfirmClear(false)}>Batal</button>
              </>
            ) : (
              <button className="button-secondary" type="button" onClick={() => setConfirmClear(true)}>Hapus semua riwayat</button>
            )}
          </div>
        ) : null}
      </section>
    </section>
  );
}

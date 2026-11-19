"use client";

import { useState, type FormEvent } from "react";
import {
  purchaseAssessmentInputSchema,
  type PurchaseAssessmentInput,
  type UrgencyAnswer,
} from "../domain/purchase-assessment";

type ScaleAnswer = 1 | 2 | 3 | 4 | 5;

type AssessmentForm = {
  need: ScaleAnswer | null;
  urgency: UrgencyAnswer | "";
  alternatives: ScaleAnswer | null;
  utility: ScaleAnswer | null;
  impulseLevel: ScaleAnswer | null;
  socialPressure: boolean | null;
  potentialRegret: string;
};

const initialForm: AssessmentForm = {
  need: null,
  urgency: "",
  alternatives: null,
  utility: null,
  impulseLevel: null,
  socialPressure: null,
  potentialRegret: "",
};

const urgencyOptions: { value: UrgencyAnswer; label: string; detail: string }[] = [
  {
    value: "can_wait_one_month_or_longer",
    label: "Bisa menunggu satu bulan atau lebih",
    detail: "Tidak ada konsekuensi penting jika pembelian ditunda.",
  },
  {
    value: "needed_within_one_month",
    label: "Dibutuhkan dalam satu bulan",
    detail: "Ada kebutuhan dalam waktu dekat, tetapi tidak harus minggu ini.",
  },
  {
    value: "needed_within_one_week_for_specific_reason",
    label: "Dibutuhkan dalam satu minggu",
    detail: "Ada alasan spesifik yang membuat waktunya cukup dekat.",
  },
  {
    value: "immediate_essential_necessity",
    label: "Kebutuhan esensial saat ini",
    detail: "Penundaan akan mengganggu kebutuhan penting saat ini.",
  },
];

const impulseOptions: { value: ScaleAnswer; label: string; detail: string }[] = [
  { value: 1, label: "Sudah direncanakan", detail: "Pembelian ini sudah dipikirkan sebelum muncul keinginan saat ini." },
  { value: 2, label: "Ada sedikit godaan", detail: "Ada ketertarikan, tetapi keputusan masih terasa terkendali." },
  { value: 3, label: "Keinginan spontan", detail: "Keinginan muncul tiba-tiba dan belum banyak dipertimbangkan." },
  { value: 4, label: "Dorongan sangat kuat", detail: "Saya merasa sangat ingin membeli sekarang." },
  { value: 5, label: "FOMO atau tekanan emosional kuat", detail: "Saya takut tertinggal, kehilangan kesempatan, atau terdorong emosi." },
];

function ScaleQuestion({
  name,
  title,
  description,
  low,
  high,
  value,
  onChange,
  error,
}: {
  name: string;
  title: string;
  description: string;
  low: string;
  high: string;
  value: ScaleAnswer | null;
  onChange: (value: ScaleAnswer) => void;
  error?: string;
}) {
  return (
    <fieldset className="assessment-question" aria-describedby={`${name}-description`}>
      <legend>{title}</legend>
      <p className="assessment-description" id={`${name}-description`}>{description}</p>
      <div className="scale-options">
        {([1, 2, 3, 4, 5] as const).map((option) => (
          <label className={`scale-option${value === option ? " is-selected" : ""}`} key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div className="scale-anchors"><span>{low}</span><span>{high}</span></div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </fieldset>
  );
}

export default function PurchaseAssessmentForm({
  onComplete,
}: {
  onComplete: (assessment: PurchaseAssessmentInput) => void;
}) {
  const [form, setForm] = useState<AssessmentForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof AssessmentForm>(key: K, value: AssessmentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = {
      need: form.need === null ? { status: "unknown" as const } : { status: "known" as const, value: form.need },
      urgency: form.urgency === "" ? { status: "unknown" as const } : { status: "known" as const, value: form.urgency },
      alternatives: form.alternatives === null ? { status: "unknown" as const } : { status: "known" as const, value: form.alternatives },
      utility: form.utility === null ? { status: "unknown" as const } : { status: "known" as const, value: form.utility },
      impulseLevel: form.impulseLevel === null ? { status: "unknown" as const } : { status: "known" as const, value: form.impulseLevel },
      socialPressure: form.socialPressure === null ? { status: "unknown" as const } : { status: "known" as const, value: form.socialPressure },
      ...(form.potentialRegret.trim()
        ? { potentialRegret: { status: "known" as const, value: form.potentialRegret.trim() } }
        : {}),
    };
    const result = purchaseAssessmentInputSchema.safeParse(candidate);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] = "Jawaban ini perlu dilengkapi agar penilaian tidak memakai asumsi.";
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onComplete(result.data);
  }

  return (
    <section className="assessment-panel" aria-labelledby="assessment-title">
      <div className="eyebrow"><span className="eyebrow-dot" /> LANGKAH 02 · PURCHASE DECISION ASSESSMENT</div>
      <div className="assessment-intro">
        <p className="section-kicker">PAHAMI ALASAN DI BALIK PEMBELIAN</p>
        <h2 id="assessment-title">Sebelum membeli, apa yang sebenarnya kamu butuhkan?</h2>
        <p className="section-description">
          Tidak ada jawaban yang dinilai baik atau buruk. Jawab sesuai keadaanmu saat ini.
          Jawaban ini menilai pertimbangan pembelian, bukan kemampuan finansial.
        </p>
      </div>

      <form className="assessment-form" onSubmit={handleSubmit} noValidate>
        <ScaleQuestion
          name="need"
          title="1. Seberapa besar kebutuhanmu terhadap barang atau jasa ini?"
          description="Pertimbangkan apakah ini kebutuhan penting atau lebih merupakan keinginan."
          low="Lebih merupakan keinginan"
          high="Kebutuhan yang sangat penting"
          value={form.need}
          onChange={(value) => update("need", value)}
          error={errors.need}
        />

        <fieldset className="assessment-question">
          <legend>2. Seberapa mendesak pembelian ini?</legend>
          <p className="assessment-description">Pilih berdasarkan konsekuensi nyata jika kamu menunda pembelian.</p>
          <div className="assessment-choice-list">
            {urgencyOptions.map((option) => (
              <label className={`assessment-choice${form.urgency === option.value ? " is-selected" : ""}`} key={option.value}>
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={form.urgency === option.value}
                  onChange={() => update("urgency", option.value)}
                />
                <span><strong>{option.label}</strong><small>{option.detail}</small></span>
              </label>
            ))}
          </div>
          {errors.urgency ? <p className="field-error" role="alert">{errors.urgency}</p> : null}
        </fieldset>

        <ScaleQuestion
          name="alternatives"
          title="3. Seberapa jauh kamu sudah mempertimbangkan alternatif?"
          description="Misalnya menunda, memperbaiki barang yang ada, menyewa, meminjam, atau memilih opsi lain yang sesuai."
          low="Belum mempertimbangkan alternatif"
          high="Sudah membandingkan alternatif dengan matang"
          value={form.alternatives}
          onChange={(value) => update("alternatives", value)}
          error={errors.alternatives}
        />

        <ScaleQuestion
          name="utility"
          title="4. Seberapa besar manfaat yang akan kamu dapatkan?"
          description="Pikirkan manfaat nyata, relevansi dengan kebutuhan, dan seberapa sering akan digunakan."
          low="Manfaat sangat kecil"
          high="Manfaat sangat besar dan relevan"
          value={form.utility}
          onChange={(value) => update("utility", value)}
          error={errors.utility}
        />

        <fieldset className="assessment-question">
          <legend>5. Seberapa kuat dorongan untuk membeli saat ini?</legend>
          <p className="assessment-description">Pilih kondisi yang paling mendekati alasan dan perasaanmu sekarang.</p>
          <div className="assessment-choice-list">
            {impulseOptions.map((option) => (
              <label className={`assessment-choice${form.impulseLevel === option.value ? " is-selected" : ""}`} key={option.value}>
                <input
                  type="radio"
                  name="impulseLevel"
                  value={option.value}
                  checked={form.impulseLevel === option.value}
                  onChange={() => update("impulseLevel", option.value)}
                />
                <span><strong>{option.value}. {option.label}</strong><small>{option.detail}</small></span>
              </label>
            ))}
          </div>
          {errors.impulseLevel ? <p className="field-error" role="alert">{errors.impulseLevel}</p> : null}
        </fieldset>

        <fieldset className="assessment-question">
          <legend>6. Apakah ada tekanan atau ekspektasi dari orang lain?</legend>
          <p className="assessment-description">Contohnya ajakan teman, tuntutan keluarga, tren kelompok, atau keinginan mendapat pengakuan.</p>
          <div className="binary-options">
            <label className={`binary-option${form.socialPressure === false ? " is-selected" : ""}`}>
              <input type="radio" name="socialPressure" checked={form.socialPressure === false} onChange={() => update("socialPressure", false)} />
              <span>Tidak ada</span>
            </label>
            <label className={`binary-option${form.socialPressure === true ? " is-selected" : ""}`}>
              <input type="radio" name="socialPressure" checked={form.socialPressure === true} onChange={() => update("socialPressure", true)} />
              <span>Ada</span>
            </label>
          </div>
          {errors.socialPressure ? <p className="field-error" role="alert">{errors.socialPressure}</p> : null}
        </fieldset>

        <div className="assessment-question">
          <label htmlFor="potentialRegret">7. Jika membeli sekarang, apa yang mungkin kamu sesali nanti? <span className="optional-label">Opsional</span></label>
          <p className="assessment-description">Gunakan ruang ini untuk refleksi. Jawaban ini tidak menambah atau mengurangi skor.</p>
          <textarea
            id="potentialRegret"
            rows={3}
            value={form.potentialRegret}
            onChange={(event) => update("potentialRegret", event.target.value)}
            placeholder="Contoh: mungkin saya akan menyesal karena ada kebutuhan lain yang lebih penting."
          />
        </div>

        {Object.values(errors).some(Boolean) ? (
          <p className="form-error-summary" role="alert">Lengkapi semua pertanyaan wajib. Jika belum dapat menjawab, sistem tidak akan mengarang jawaban untukmu.</p>
        ) : null}

        <div className="assessment-actions">
          <p>Jawaban refleksi bersifat pribadi dan tetap berada di halaman ini.</p>
          <button className="button-primary" type="submit">Simpan penilaian perilaku <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>
  );
}

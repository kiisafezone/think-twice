"use client";

import { useState, type FormEvent } from "react";
import { purchaseInputSchema, type PurchaseInput } from "../domain/purchase";
import PurchaseAssessmentForm from "./purchase-assessment-form";
import type { PurchaseAssessmentInput } from "../domain/purchase-assessment";

type AmountField = {
  value: string;
  unknown: boolean;
};

type FormState = {
  itemName: string;
  category: string;
  purchasePrice: AmountField;
  additionalFees: AmountField;
  financingClass: "" | "cash" | "financed";
  upfrontPayment: AmountField;
  monthlyInstallment: AmountField;
  installmentCount: AmountField;
  feeTreatment: "unknown" | "installment_includes_fees" | "installment_excludes_fees";
};

type FormErrors = Record<string, string>;

const initialForm: FormState = {
  itemName: "",
  category: "",
  purchasePrice: { value: "", unknown: false },
  additionalFees: { value: "", unknown: false },
  financingClass: "",
  upfrontPayment: { value: "", unknown: false },
  monthlyInstallment: { value: "", unknown: false },
  installmentCount: { value: "", unknown: false },
  feeTreatment: "unknown",
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function amountInput(field: AmountField) {
  if (field.unknown) return { status: "unknown" as const };
  return {
    status: "known" as const,
    value: field.value.trim() === "" ? Number.NaN : Number(field.value),
  };
}

function displayAmount(field: { status: string; value?: number }) {
  return field.status === "known" && typeof field.value === "number"
    ? currency.format(field.value)
    : "Belum diketahui";
}

function fieldError(errors: FormErrors, key: string) {
  return errors[key] ? (
    <p className="field-error" id={`${key}-error`}>
      {errors[key]}
    </p>
  ) : null;
}

function AmountFieldInput({
  id,
  label,
  hint,
  field,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  field: AmountField;
  error?: string;
  onChange: (next: AmountField) => void;
}) {
  return (
    <div className="field">
      <div className="field-heading">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </div>
      <div className="amount-control">
        <span aria-hidden="true">Rp</span>
        <input
          id={id}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="0"
          value={field.value}
          disabled={field.unknown}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange({ ...field, value: event.target.value })}
        />
      </div>
      <label className="unknown-toggle">
        <input
          type="checkbox"
          checked={field.unknown}
          onChange={(event) => onChange({ ...field, unknown: event.target.checked })}
        />
        <span>Belum diketahui</span>
      </label>
      {error ? <p className="field-error" id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}


export default function PurchaseIntake() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [validatedPurchase, setValidatedPurchase] = useState<PurchaseInput | null>(null);
  const [validatedAssessment, setValidatedAssessment] = useState<PurchaseAssessmentInput | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) =>
      key === "financingClass" ? {} : { ...current, [key]: "" },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const paymentPlan =
      form.financingClass === "cash"
        ? { financingClass: "cash" as const }
        : form.financingClass === "financed"
          ? {
              financingClass: "financed" as const,
              upfrontPayment: amountInput(form.upfrontPayment),
              installment: {
                repaymentSchedule: "monthly" as const,
                monthlyInstallment: amountInput(form.monthlyInstallment),
                installmentCount: form.installmentCount.unknown
                  ? { status: "unknown" as const }
                  : {
                      status: "known" as const,
                      value:
                        form.installmentCount.value.trim() === ""
                          ? Number.NaN
                          : Number(form.installmentCount.value),
                    },
                feeTreatment:
                  form.feeTreatment === "unknown"
                    ? { status: "unknown" as const }
                    : { status: "known" as const, value: form.feeTreatment },
              },
            }
          : { financingClass: "" };

    const result = purchaseInputSchema.safeParse({
      itemName: form.itemName,
      category: form.category,
      purchasePrice: amountInput(form.purchasePrice),
      additionalFees: amountInput(form.additionalFees),
      paymentPlan,
    });

    if (!result.success) {
      const nextErrors: FormErrors = {};
      const formFields = new Set([
        "itemName",
        "category",
        "purchasePrice",
        "additionalFees",
        "paymentPlan",
        "upfrontPayment",
        "monthlyInstallment",
        "installmentCount",
        "feeTreatment",
      ]);
      for (const issue of result.error.issues) {
        const path =
          issue.path.map(String).reverse().find((part) => formFields.has(part)) ??
          "form";
        nextErrors[path] =
          issue.code === "too_small" && path === "installmentCount"
            ? "Jumlah cicilan harus minimal 1 bulan."
            : issue.code === "too_small"
              ? "Nilai tidak boleh kurang dari nol."
              : issue.code === "invalid_type"
                ? "Masukkan angka bulat yang valid atau tandai belum diketahui."
                : issue.message === "blank_text"
                  ? "Bagian ini perlu diisi."
                  : "Periksa kembali nilai yang dimasukkan.";
      }
      setErrors(nextErrors);
      setValidatedPurchase(null);
      return;
    }

    setErrors({});
    setValidatedPurchase(result.data);
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setValidatedPurchase(null);
    setValidatedAssessment(null);
  }

  if (validatedPurchase) {
    const isCash = validatedPurchase.paymentPlan.financingClass === "cash";
    return (
      <main className="page-shell">
        <header className="site-header">
          <a className="wordmark" href="/" aria-label="THINK TWICE, beranda">THINK TWICE<span>.</span></a>
          <span className="header-note">PERSONAL FINANCIAL DECISION COMPANION</span>
        </header>
        <section className="confirmation-panel" aria-live="polite">
          <div className="eyebrow"><span className="eyebrow-dot" /> LANGKAH 01 · DETAIL PEMBELIAN</div>
          <div className="confirmation-mark" aria-hidden="true">✓</div>
          <h1>Detail pembelian sudah diperiksa.</h1>
          <p className="lead-copy">
            Data ini valid dan tersedia sementara di halaman ini. Belum ada penilaian
            kemampuan finansial atau rekomendasi pembelian yang dibuat.
          </p>
          <div className="summary-card">
            <div className="summary-topline">
              <span>RINGKASAN PEMBELIAN</span>
              <span className="summary-status">Tervalidasi</span>
            </div>
            <h2>{validatedPurchase.itemName}</h2>
            <p className="summary-category">{validatedPurchase.category}</p>
            <dl className="summary-list">
              <div>
                <dt>Harga pembelian</dt>
                <dd>{displayAmount(validatedPurchase.purchasePrice)}</dd>
              </div>
              <div>
                <dt>Biaya tambahan</dt>
                <dd>{displayAmount(validatedPurchase.additionalFees)}</dd>
              </div>
              <div>
                <dt>Pola pembayaran</dt>
                <dd>{isCash ? "Dibayar penuh sekarang" : "Menambah cicilan bulanan"}</dd>
              </div>
              {!isCash ? (
                <>
                  <div>
                    <dt>Dana awal</dt>
                    <dd>{displayAmount(validatedPurchase.paymentPlan.financingClass === "financed" ? validatedPurchase.paymentPlan.upfrontPayment : { status: "unknown" })}</dd>
                  </div>
                  <div>
                    <dt>Cicilan per bulan</dt>
                    <dd>{displayAmount(validatedPurchase.paymentPlan.financingClass === "financed" ? validatedPurchase.paymentPlan.installment.monthlyInstallment : { status: "unknown" })}</dd>
                  </div>
                  <div>
                    <dt>Jumlah cicilan</dt>
                    <dd>{validatedPurchase.paymentPlan.financingClass === "financed" && validatedPurchase.paymentPlan.installment.installmentCount.status === "known" ? `${validatedPurchase.paymentPlan.installment.installmentCount.value} bulan` : "Belum diketahui"}</dd>
                  </div>
                  <div>
                    <dt>Biaya pada cicilan</dt>
                    <dd>
                      {validatedPurchase.paymentPlan.financingClass === "financed" &&
                      validatedPurchase.paymentPlan.installment.feeTreatment.status === "known"
                        ? validatedPurchase.paymentPlan.installment.feeTreatment.value === "installment_includes_fees"
                          ? "Sudah termasuk"
                          : "Belum termasuk"
                        : "Belum diketahui"}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
          <PurchaseAssessmentForm onComplete={setValidatedAssessment} />
          {validatedAssessment ? (
            <div className="assessment-complete" role="status">
              <strong>Purchase Decision Assessment tersimpan.</strong>
              <p>Jawaban refleksi sudah divalidasi. Belum ada rekomendasi akhir; kondisi keuangan masih perlu dinilai secara terpisah.</p>
              <button className="button-secondary" type="button" onClick={() => setValidatedAssessment(null)}>Ubah jawaban penilaian</button>
            </div>
          ) : null}
          <p className="privacy-note">
            <strong>Privasi:</strong> detail ini tidak dikirim ke server dan akan hilang
            ketika halaman dimuat ulang atau ditutup.
          </p>
          <div className="confirmation-actions">
            <button className="button-primary" type="button" onClick={() => { setValidatedPurchase(null); setValidatedAssessment(null); }}>
              Ubah detail
            </button>
            <button className="button-secondary" type="button" onClick={resetForm}>
              Mulai dari awal
            </button>
          </div>
        </section>
        <footer className="site-footer">
          <span>THINK TWICE.</span>
          <span>Think twice today. Thank yourself tomorrow.</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="THINK TWICE, beranda">THINK TWICE<span>.</span></a>
        <span className="header-note">PERSONAL FINANCIAL DECISION COMPANION</span>
      </header>

      <section className="intro-section">
        <div className="eyebrow"><span className="eyebrow-dot" /> A MOMENT BEFORE YOU BUY</div>
        <h1>Jeda sebentar.<br /><em>Pikirkan dua kali.</em></h1>
        <p className="lead-copy">
          Sebelum memutuskan, pahami dulu apa yang ingin dibeli dan bagaimana
          cara pembayarannya. Tidak ada penilaian yang dibuat sebelum informasi
          yang diperlukan tersedia.
        </p>
      </section>

      <div className="progress-row" aria-label="Tahap penilaian">
        <div className="progress-step is-current"><span>01</span><strong>Detail pembelian</strong></div>
        <div className="progress-line" />
        <div className="progress-step"><span>02</span><strong>Alasan membeli</strong></div>
        <div className="progress-line" />
        <div className="progress-step"><span>03</span><strong>Kondisi keuangan</strong></div>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-heading">
          <div>
            <p className="section-kicker">LANGKAH 01 DARI 03</p>
            <h2>Apa yang ingin kamu beli?</h2>
            <p className="section-description">Mulai dari informasi dasar. Kamu bisa menandai nominal yang belum diketahui.</p>
          </div>
          <span className="section-number">01</span>
        </div>

        <div className="form-grid">
          <div className="field field-full">
            <label htmlFor="itemName">Nama barang atau layanan</label>
            <input
              id="itemName"
              type="text"
              placeholder="Contoh: Laptop untuk bekerja"
              value={form.itemName}
              aria-invalid={Boolean(errors.itemName)}
              aria-describedby={errors.itemName ? "itemName-error" : undefined}
              onChange={(event) => update("itemName", event.target.value)}
            />
            {fieldError(errors, "itemName")}
          </div>
          <div className="field field-full">
            <label htmlFor="category">Kategori</label>
            <input
              id="category"
              type="text"
              placeholder="Contoh: Elektronik"
              value={form.category}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "category-error" : undefined}
              onChange={(event) => update("category", event.target.value)}
            />
            {fieldError(errors, "category")}
          </div>
          <AmountFieldInput
            id="purchasePrice"
            label="Harga pembelian"
            hint="Nominal sebelum biaya tambahan"
            field={form.purchasePrice}
            error={errors.purchasePrice}
            onChange={(value) => update("purchasePrice", value)}
          />
          <AmountFieldInput
            id="additionalFees"
            label="Biaya tambahan"
            hint="Isi 0 jika tidak ada"
            field={form.additionalFees}
            error={errors.additionalFees}
            onChange={(value) => update("additionalFees", value)}
          />
        </div>

        <div className="subsection-divider" />
        <fieldset className="payment-fieldset" aria-describedby={errors.paymentPlan ? "paymentPlan-error" : undefined}>
          <legend>Bagaimana pola pembayarannya?</legend>
          <p className="field-hint">Pilih berdasarkan kewajiban pembayaran, bukan nama layanan atau penyedia.</p>
          <div className="choice-grid">
            <label className={form.financingClass === "cash" ? "choice-card is-selected" : "choice-card"}>
              <input
                type="radio"
                name="financingClass"
                value="cash"
                checked={form.financingClass === "cash"}
                onChange={() => update("financingClass", "cash")}
              />
              <span className="choice-icon" aria-hidden="true">↗</span>
              <span className="choice-title">Dibayar penuh sekarang</span>
              <span className="choice-description">Seluruh harga dan biaya dibayar di awal, tanpa cicilan baru.</span>
            </label>
            <label className={form.financingClass === "financed" ? "choice-card is-selected" : "choice-card"}>
              <input
                type="radio"
                name="financingClass"
                value="financed"
                checked={form.financingClass === "financed"}
                onChange={() => update("financingClass", "financed")}
              />
              <span className="choice-icon" aria-hidden="true">↘</span>
              <span className="choice-title">Menambah cicilan bulanan</span>
              <span className="choice-description">Ada dana awal dan/atau kewajiban pembayaran bulanan baru.</span>
            </label>
          </div>
          {fieldError(errors, "paymentPlan")}
        </fieldset>

        {form.financingClass === "financed" ? (
          <>
            <div className="subsection-divider" />
            <div className="form-heading compact-heading">
              <div>
                <p className="section-kicker">RINCIAN PEMBAYARAN</p>
                <h2>Bagaimana cicilannya?</h2>
                <p className="section-description">V1 saat ini hanya mendukung jadwal cicilan bulanan.</p>
              </div>
            </div>
            <div className="form-grid">
              <AmountFieldInput
                id="upfrontPayment"
                label="Dana awal"
                hint="Dibayar saat pembelian"
                field={form.upfrontPayment}
                error={errors.upfrontPayment}
                onChange={(value) => update("upfrontPayment", value)}
              />
              <AmountFieldInput
                id="monthlyInstallment"
                label="Cicilan per bulan"
                hint="Nominal setiap bulan"
                field={form.monthlyInstallment}
                error={errors.monthlyInstallment}
                onChange={(value) => update("monthlyInstallment", value)}
              />
              <div className="field">
                <div className="field-heading">
                  <label htmlFor="installmentCount">Jumlah cicilan</label>
                  <span className="field-hint">Dalam bulan</span>
                </div>
                <input
                  id="installmentCount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Contoh: 12"
                  value={form.installmentCount.value}
                  disabled={form.installmentCount.unknown}
                  aria-invalid={Boolean(errors.installmentCount)}
                  aria-describedby={errors.installmentCount ? "installmentCount-error" : undefined}
                  onChange={(event) => update("installmentCount", { ...form.installmentCount, value: event.target.value })}
                />
                <label className="unknown-toggle">
                  <input
                    type="checkbox"
                    checked={form.installmentCount.unknown}
                    onChange={(event) => update("installmentCount", { ...form.installmentCount, unknown: event.target.checked })}
                  />
                  <span>Belum diketahui</span>
                </label>
                {fieldError(errors, "installmentCount")}
              </div>
              <div className="field">
                <label htmlFor="feeTreatment">Apakah cicilan sudah termasuk biaya?</label>
                <select
                  id="feeTreatment"
                  value={form.feeTreatment}
                  aria-invalid={Boolean(errors.feeTreatment)}
                  aria-describedby={errors.feeTreatment ? "feeTreatment-error" : undefined}
                  onChange={(event) => update("feeTreatment", event.target.value as FormState["feeTreatment"])}
                >
                  <option value="unknown">Belum diketahui</option>
                  <option value="installment_includes_fees">Sudah termasuk biaya</option>
                  <option value="installment_excludes_fees">Belum termasuk biaya</option>
                </select>
                {fieldError(errors, "feeTreatment")}
              </div>
            </div>
          </>
        ) : null}

        {Object.keys(errors).length > 0 ? (
          <p className="form-error-summary" role="alert">
            Ada informasi yang perlu diperiksa. Perbaiki bagian yang ditandai atau tandai nominal yang belum diketahui.
          </p>
        ) : null}

        <div className="form-actions">
          <p>Data yang belum diketahui tidak akan dianggap nol.</p>
          <button className="button-primary" type="submit">
            Periksa detail pembelian <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      <aside className="reassurance-note">
        <span className="reassurance-icon" aria-hidden="true">i</span>
        <p>
          <strong>Belum perlu mengambil keputusan.</strong> Langkah ini hanya
          mengumpulkan detail pembelian. Alasan membeli dan kondisi keuangan
          akan dinilai secara terpisah pada tahap berikutnya.
        </p>
      </aside>

      <footer className="site-footer">
        <span>THINK TWICE.</span>
        <span>Think twice today. Thank yourself tomorrow.</span>
      </footer>
    </main>
  );
}

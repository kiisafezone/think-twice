"use client";

import { useState, type FormEvent } from "react";
import {
  deriveEffectiveAvailableCash,
  financialProfileSchema,
  type FinancialProfile,
} from "../../../domain/financial-profile";
import { deriveMonthlyFreeCash } from "../../../domain/financial-calculations";

type AmountField = {
  value: string;
  unknown: boolean;
};

type ProtectedSavingsMode = "known" | "unknown" | "not_applicable";

type FormState = {
  netMonthlyIncome: AmountField;
  essentialMonthlyExpenses: AmountField;
  existingMonthlyDebtPayments: AmountField;
  otherCommittedMonthlyExpenses: AmountField;
  availableCash: AmountField;
  protectedSavingsMode: ProtectedSavingsMode;
  protectedSavingsAmount: string;
};

type FormErrors = Record<string, string>;

const emptyAmount = (): AmountField => ({ value: "", unknown: false });

const initialForm: FormState = {
  netMonthlyIncome: emptyAmount(),
  essentialMonthlyExpenses: emptyAmount(),
  existingMonthlyDebtPayments: emptyAmount(),
  otherCommittedMonthlyExpenses: emptyAmount(),
  availableCash: emptyAmount(),
  protectedSavingsMode: "unknown",
  protectedSavingsAmount: "",
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

function formatAmount(value: number) {
  return currency.format(value);
}

function profileAmount(input: { status: string; value?: number }) {
  return input.status === "known" && typeof input.value === "number"
    ? formatAmount(input.value)
    : "Belum diketahui";
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
  hint: string;
  field: AmountField;
  error?: string;
  onChange: (next: AmountField) => void;
}) {
  return (
    <div className="field">
      <div className="field-heading">
        <label htmlFor={id}>{label}</label>
        <span className="field-hint">{hint}</span>
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
          aria-describedby={error ? id + "-error" : undefined}
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
      {error ? <p className="field-error" id={id + "-error"}>{error}</p> : null}
    </div>
  );
}

function FinancialSummary({
  profile,
  onEdit,
}: {
  profile: FinancialProfile;
  onEdit: () => void;
}) {
  const monthlyFreeCash = deriveMonthlyFreeCash({
    netMonthlyIncome: profile.netMonthlyIncome,
    essentialMonthlyExpenses: profile.essentialMonthlyExpenses,
    existingMonthlyDebtPayments: profile.existingMonthlyDebtPayments,
    otherCommittedMonthlyExpenses: profile.otherCommittedMonthlyExpenses,
  });
  const effectiveCash = deriveEffectiveAvailableCash(profile);
  const protectedSavings = profile.protectedSavings.status === "known"
    ? formatAmount(profile.protectedSavings.value)
    : profile.protectedSavings.status === "not_applicable"
      ? "Tidak ada dana terlindungi yang dipisahkan"
      : "Belum diketahui";
  const designatedAmount = profile.protectedSavingsDesignation.status === "opted_in"
    ? profile.protectedSavingsDesignation.amount
    : 0;

  return (
    <section className="financial-summary" aria-labelledby="financial-summary-title">
      <div className="summary-topline">
        <span>RINGKASAN KONDISI KEUANGAN</span>
        <span className="summary-status">Tervalidasi</span>
      </div>
      <h3 id="financial-summary-title">Data keuangan tersimpan sementara.</h3>
      <p className="section-description">
        Ini adalah ringkasan input dan perhitungan dasar, bukan skor keterjangkauan atau rekomendasi pembelian.
      </p>
      <dl className="summary-list financial-summary-list">
        <div><dt>Pendapatan bersih per bulan</dt><dd>{profileAmount(profile.netMonthlyIncome)}</dd></div>
        <div><dt>Pengeluaran pokok per bulan</dt><dd>{profileAmount(profile.essentialMonthlyExpenses)}</dd></div>
        <div><dt>Cicilan dan utang yang berjalan</dt><dd>{profileAmount(profile.existingMonthlyDebtPayments)}</dd></div>
        <div><dt>Komitmen rutin lainnya</dt><dd>{profileAmount(profile.otherCommittedMonthlyExpenses)}</dd></div>
        <div className="financial-derived-row">
          <dt>Sisa kas bulanan</dt>
          <dd>{monthlyFreeCash.status === "known" ? formatAmount(monthlyFreeCash.value) : monthlyFreeCash.status === "invalid" ? "Tidak dapat dihitung: batas angka aman terlampaui" : "Belum dapat dihitung"}</dd>
        </div>
        <div><dt>Kas tersedia yang dilaporkan</dt><dd>{profileAmount(profile.availableCash)}</dd></div>
        <div><dt>Saldo dana terlindungi</dt><dd>{protectedSavings}</dd></div>
        <div><dt>Dana terlindungi yang disertakan</dt><dd>{formatAmount(designatedAmount)}</dd></div>
        <div className="financial-derived-row">
          <dt>Kas yang dihitung untuk pembelian</dt>
          <dd>{effectiveCash.status === "known" ? formatAmount(effectiveCash.value) : effectiveCash.status === "invalid" ? "Tidak dapat dihitung: batas angka aman terlampaui" : "Belum dapat dihitung"}</dd>
        </div>
      </dl>
      {profile.protectedSavingsDesignation.status === "opted_in" ? (
        <p className="financial-disclosure-note">
          Kamu memilih menyertakan {formatAmount(profile.protectedSavingsDesignation.amount)} dari dana terlindungi.
          {effectiveCash.status === "known"
            ? " Nominal tersebut ditambahkan ke kas yang dihitung dan tidak lagi diperlakukan sebagai dana yang tetap terlindungi untuk keadaan darurat atau tujuan yang ditetapkan."
            : " Nominal tersebut sudah ditandai untuk disertakan, tetapi total kas yang dihitung tetap belum dapat diketahui karena kas tersedia belum diketahui atau perhitungannya melewati batas angka aman."}
        </p>
      ) : (
        <p className="privacy-note">
          Dana darurat dan tabungan yang dialokasikan untuk tujuan tertentu tetap dikecualikan dari kas yang dihitung.
        </p>
      )}
      <div className="confirmation-actions">
        <button className="button-secondary" type="button" onClick={onEdit}>Ubah kondisi keuangan</button>
      </div>
    </section>
  );
}

export default function FinancialRealityCheckForm({
  profile,
  onComplete,
  onEdit,
}: {
  profile: FinancialProfile | null;
  onComplete: (profile: FinancialProfile) => void;
  onEdit: () => void;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [includeProtectedSavings, setIncludeProtectedSavings] = useState(false);
  const [designationAmount, setDesignationAmount] = useState("");
  const [disclosureAcknowledged, setDisclosureAcknowledged] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  const protectedBalance = form.protectedSavingsMode === "known" && form.protectedSavingsAmount.trim() !== ""
    ? Number(form.protectedSavingsAmount)
    : Number.NaN;
  const designatedValue = designationAmount.trim() === "" ? Number.NaN : Number(designationAmount);
  const designationIsValid =
    Number.isSafeInteger(protectedBalance) &&
    protectedBalance >= 0 &&
    Number.isSafeInteger(designatedValue) &&
    designatedValue >= 0 &&
    designatedValue <= protectedBalance;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const protectedSavings =
      form.protectedSavingsMode === "not_applicable"
        ? { status: "not_applicable" as const }
        : form.protectedSavingsMode === "unknown"
          ? { status: "unknown" as const }
          : {
              status: "known" as const,
              value: form.protectedSavingsAmount.trim() === "" ? Number.NaN : Number(form.protectedSavingsAmount),
            };

    const protectedSavingsDesignation = includeProtectedSavings
      ? {
          status: "opted_in" as const,
          amount: designationAmount.trim() === "" ? Number.NaN : Number(designationAmount),
          ...(disclosureAcknowledged ? { disclosureAcknowledged: true as const } : {}),
        }
      : { status: "not_opted_in" as const };

    const candidate = {
      netMonthlyIncome: amountInput(form.netMonthlyIncome),
      essentialMonthlyExpenses: amountInput(form.essentialMonthlyExpenses),
      existingMonthlyDebtPayments: amountInput(form.existingMonthlyDebtPayments),
      otherCommittedMonthlyExpenses: amountInput(form.otherCommittedMonthlyExpenses),
      availableCash: amountInput(form.availableCash),
      protectedSavings,
      protectedSavingsDesignation,
    };

    const result = financialProfileSchema.safeParse(candidate);
    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (field === "protectedSavings" && includeProtectedSavings) {
          nextErrors.protectedSavings = "Saldo dana terlindungi harus diketahui sebelum sebagian dana dapat disertakan.";
        } else if (field === "protectedSavingsDesignation") {
          nextErrors.protectedSavingsDesignation =
            issue.message === "protected_savings_designation_exceeds_known_balance"
              ? "Nominal yang disertakan tidak boleh melebihi saldo dana terlindungi."
              : "Masukkan nominal dan setujui penjelasan dampaknya sebelum melanjutkan.";
        } else if (issue.code === "too_small") {
          nextErrors[field] = "Nilai tidak boleh kurang dari nol.";
        } else if (issue.code === "invalid_type") {
          nextErrors[field] = "Masukkan angka bulat yang valid atau tandai belum diketahui.";
        } else {
          nextErrors[field] = "Periksa kembali informasi yang dimasukkan.";
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onComplete(result.data);
  }

  if (profile) return <FinancialSummary profile={profile} onEdit={onEdit} />;

  return (
    <section className="financial-panel" aria-labelledby="financial-title">
      <div className="eyebrow"><span className="eyebrow-dot" /> LANGKAH 03 · FINANCIAL REALITY CHECK</div>
      <div className="assessment-intro">
        <p className="section-kicker">PAHAMI KONDISI KEUANGAN SEBENARNYA</p>
        <h2 id="financial-title">Seberapa besar ruang keuangan yang benar-benar tersedia?</h2>
        <p className="section-description">
          Masukkan kondisi bulanan dan kas yang dapat digunakan. Nilai yang belum diketahui boleh ditandai secara eksplisit; sistem tidak akan menganggapnya nol.
        </p>
      </div>

      <form className="financial-form" onSubmit={handleSubmit} noValidate>
        <div className="form-heading compact-heading">
          <div>
            <p className="section-kicker">ARUS KAS BULANAN</p>
            <h3>Pendapatan dan komitmen rutin</h3>
            <p className="section-description">Gunakan nominal bersih per bulan. Jangan menghitung limit kartu kredit atau limit PayLater sebagai pendapatan.</p>
          </div>
        </div>
        <div className="form-grid">
          <AmountFieldInput
            id="netMonthlyIncome"
            label="Pendapatan bersih per bulan"
            hint="Setelah potongan"
            field={form.netMonthlyIncome}
            error={errors.netMonthlyIncome}
            onChange={(value) => update("netMonthlyIncome", value)}
          />
          <AmountFieldInput
            id="essentialMonthlyExpenses"
            label="Pengeluaran pokok per bulan"
            hint="Tempat tinggal, makan, transportasi"
            field={form.essentialMonthlyExpenses}
            error={errors.essentialMonthlyExpenses}
            onChange={(value) => update("essentialMonthlyExpenses", value)}
          />
          <AmountFieldInput
            id="existingMonthlyDebtPayments"
            label="Cicilan dan utang yang berjalan"
            hint="Total kewajiban bulanan saat ini"
            field={form.existingMonthlyDebtPayments}
            error={errors.existingMonthlyDebtPayments}
            onChange={(value) => update("existingMonthlyDebtPayments", value)}
          />
          <AmountFieldInput
            id="otherCommittedMonthlyExpenses"
            label="Komitmen rutin lainnya"
            hint="Pengeluaran tetap di luar kebutuhan pokok dan utang"
            field={form.otherCommittedMonthlyExpenses}
            error={errors.otherCommittedMonthlyExpenses}
            onChange={(value) => update("otherCommittedMonthlyExpenses", value)}
          />
        </div>

        <div className="subsection-divider" />
        <div className="form-heading compact-heading">
          <div>
            <p className="section-kicker">LIKUIDITAS</p>
            <h3>Kas yang tersedia untuk pembelian</h3>
            <p className="section-description">
              Masukkan uang likuid yang benar-benar dapat digunakan. Kecualikan dana darurat, tabungan berpos, dana titipan, serta limit kredit atau PayLater.
            </p>
          </div>
        </div>
        <div className="form-grid">
          <AmountFieldInput
            id="availableCash"
            label="Kas tersedia"
            hint="Di luar dana yang dilindungi"
            field={form.availableCash}
            error={errors.availableCash}
            onChange={(value) => update("availableCash", value)}
          />
        </div>

        <fieldset className="protected-savings-fieldset" aria-describedby={errors.protectedSavings ? "protectedSavings-error" : undefined}>
          <legend>Apakah kamu memiliki dana yang dilindungi atau dialokasikan?</legend>
          <p className="section-description">
            Contohnya dana darurat atau tabungan untuk tujuan tertentu. Dana ini tidak masuk ke kas tersedia secara otomatis.
          </p>
          <div className="protected-savings-options">
            <label className={form.protectedSavingsMode === "known" ? "protected-savings-option is-selected" : "protected-savings-option"}>
              <input
                type="radio"
                name="protectedSavingsMode"
                checked={form.protectedSavingsMode === "known"}
                onChange={() => update("protectedSavingsMode", "known")}
              />
              <span>Ada, saldonya diketahui</span>
            </label>
            <label className={form.protectedSavingsMode === "unknown" ? "protected-savings-option is-selected" : "protected-savings-option"}>
              <input
                type="radio"
                name="protectedSavingsMode"
                checked={form.protectedSavingsMode === "unknown"}
                onChange={() => {
                  update("protectedSavingsMode", "unknown");
                  setIncludeProtectedSavings(false);
                  setDisclosureAcknowledged(false);
                }}
              />
              <span>Belum tahu</span>
            </label>
            <label className={form.protectedSavingsMode === "not_applicable" ? "protected-savings-option is-selected" : "protected-savings-option"}>
              <input
                type="radio"
                name="protectedSavingsMode"
                checked={form.protectedSavingsMode === "not_applicable"}
                onChange={() => {
                  update("protectedSavingsMode", "not_applicable");
                  setIncludeProtectedSavings(false);
                  setDisclosureAcknowledged(false);
                }}
              />
              <span>Tidak ada</span>
            </label>
          </div>
          {form.protectedSavingsMode === "known" ? (
            <div className="protected-balance-field">
              <label htmlFor="protectedSavingsAmount">Total saldo dana terlindungi</label>
              <div className="amount-control">
                <span aria-hidden="true">Rp</span>
                <input
                  id="protectedSavingsAmount"
                  type="number"
                  aria-invalid={Boolean(errors.protectedSavings)}
                  aria-describedby={errors.protectedSavings ? "protectedSavings-error" : undefined}
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.protectedSavingsAmount}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, protectedSavingsAmount: event.target.value }));
                    setErrors((current) => ({ ...current, protectedSavings: "", protectedSavingsDesignation: "" }));
                    setDisclosureAcknowledged(false);
                  }}
                />
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className="protected-opt-in">
          <label className="protected-opt-in-toggle">
            <input
              type="checkbox"
              checked={includeProtectedSavings}
              disabled={form.protectedSavingsMode !== "known"}
              onChange={(event) => {
                setIncludeProtectedSavings(event.target.checked);
                setDisclosureAcknowledged(false);
                setErrors((current) => ({ ...current, protectedSavingsDesignation: "" }));
              }}
            />
            <span><strong>Saya ingin menyertakan sebagian dana terlindungi.</strong><small>Ini pilihan sadar, bukan pengaturan otomatis.</small></span>
          </label>
          {form.protectedSavingsMode !== "known" ? (
            <p className="field-hint">Untuk menyertakan dana terlindungi, pilih “Ada, saldonya diketahui” dan masukkan saldo terlebih dahulu.</p>
          ) : null}
          {includeProtectedSavings ? (
            <div className="protected-opt-in-details">
              <label htmlFor="protectedDesignationAmount">Nominal yang ingin disertakan</label>
              <div className="amount-control">
                <span aria-hidden="true">Rp</span>
                <input
                  id="protectedDesignationAmount"
                  type="number"
                  aria-invalid={Boolean(errors.protectedSavingsDesignation) || (designationAmount.trim() !== "" && !designationIsValid)}
                  aria-describedby={errors.protectedSavingsDesignation ? "protectedDesignation-error" : undefined}
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="Masukkan nominal"
                  value={designationAmount}
                  onChange={(event) => {
                    setDesignationAmount(event.target.value);
                    setDisclosureAcknowledged(false);
                    setErrors((current) => ({ ...current, protectedSavingsDesignation: "" }));
                  }}
                />
              </div>
              {designationAmount.trim() !== "" && !designationIsValid ? (
                <p className="field-error" id="protectedDesignation-error" role="alert">Nominal harus berupa angka bulat dan tidak boleh melebihi saldo dana terlindungi.</p>
              ) : null}
              {designationIsValid ? (
                <div className="financial-disclosure">
                  <strong>Perhatikan dampaknya</strong>
                  <p>
                    Kamu akan menambahkan {formatAmount(designatedValue)} ke kas yang dihitung untuk pembelian.
                    Jumlah ini mengurangi dana yang tetap terlindungi untuk keadaan darurat atau tujuan yang sudah kamu tetapkan.
                  </p>
                  <label className="disclosure-acknowledgement">
                    <input
                      type="checkbox"
                      checked={disclosureAcknowledged}
                      onChange={(event) => {
                        setDisclosureAcknowledged(event.target.checked);
                        setErrors((current) => ({ ...current, protectedSavingsDesignation: "" }));
                      }}
                    />
                    <span>Saya memahami dan menyetujui bahwa nominal tersebut akan dihitung sebagai kas yang tersedia.</span>
                  </label>
                </div>
              ) : (
                <p className="field-hint">Masukkan nominal yang tidak melebihi saldo dana terlindungi untuk melihat dampaknya sebelum menyetujui.</p>
              )}
              {errors.protectedSavingsDesignation ? <p className="field-error" id="protectedDesignation-error" role="alert">{errors.protectedSavingsDesignation}</p> : null}
            </div>
          ) : null}
          {errors.protectedSavings ? <p className="field-error" id="protectedSavings-error" role="alert">{errors.protectedSavings}</p> : null}
        </div>

        {Object.values(errors).some(Boolean) ? (
          <p className="form-error-summary" role="alert">
            Ada informasi yang perlu diperiksa. Nominal wajib harus valid atau ditandai belum diketahui.
          </p>
        ) : null}

        <div className="form-actions">
          <p>Data keuangan tetap berada di halaman ini dan belum menghasilkan rekomendasi.</p>
          <button className="button-primary" type="submit">
            Simpan kondisi keuangan <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}

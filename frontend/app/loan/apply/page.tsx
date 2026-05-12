"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { fetchBackend } from "@/lib/backend";
import { CheckCircle, Description, MonetizationOn, Schedule, Storefront } from "@mui/icons-material";

const tenorOptions = ["3 months", "6 months", "9 months", "12 months", "18 months"];
const purposeOptions = ["Inventory restock", "Equipment purchase", "Staff expansion", "Working capital buffer", "Store upgrade"];

export default function LoanApplyPage() {
  const [form, setForm] = useState({
    amount: "",
    purpose: purposeOptions[0],
    tenor: tenorOptions[1],
    revenueSource: "",
    proposal: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.amount.trim()) nextErrors.amount = "Enter the amount you want to request";
    if (!form.revenueSource.trim()) nextErrors.revenueSource = "Explain how this loan will be repaid";
    if (!form.proposal.trim()) nextErrors.proposal = "Add a short business proposal";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError("");

    try {
      await fetchBackend("/loans/applications", {
        method: "POST",
        bodyJson: {
          amountKobo: String(Number(form.amount.replace(/[^\d]/g, "")) * 100),
          purpose: form.purpose,
          tenor: form.tenor,
          revenueSource: form.revenueSource,
          proposal: form.proposal,
        },
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit loan application");
    }
  };

  return (
    <AppShell role="user" title="Apply for Loan">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00] mb-3">Loan application</p>
              <h1 className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Request a facility directly
              </h1>
              <p className="text-sm text-[#94a3b8] mt-2 max-w-2xl">
                Submit the amount you need, what it is for, and how your business will repay it. Lenders can review this alongside your TraceScore and transaction history.
              </p>
            </div>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl p-6 space-y-5"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Loan amount" error={errors.amount} icon={MonetizationOn}>
                    <input
                      type="text"
                      value={form.amount}
                      onChange={(event) => handleChange("amount", event.target.value)}
                      placeholder="e.g. ₦750,000"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[#161616] text-[#f0f0f0] outline-none border"
                      style={{ borderColor: errors.amount ? "#dc2626" : "#1e1e1e" }}
                    />
                  </Field>

                  <Field label="Repayment tenor" icon={Schedule}>
                    <select
                      value={form.tenor}
                      onChange={(event) => handleChange("tenor", event.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-[#161616] text-[#f0f0f0] outline-none border"
                      style={{ borderColor: "#1e1e1e" }}
                    >
                      {tenorOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Purpose of loan" icon={Storefront}>
                  <select
                    value={form.purpose}
                    onChange={(event) => handleChange("purpose", event.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#161616] text-[#f0f0f0] outline-none border"
                    style={{ borderColor: "#1e1e1e" }}
                  >
                    {purposeOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Repayment source" error={errors.revenueSource} icon={Schedule}>
                  <textarea
                    value={form.revenueSource}
                    onChange={(event) => handleChange("revenueSource", event.target.value)}
                    rows={3}
                    placeholder="Describe the revenue stream that will repay this facility."
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#161616] text-[#f0f0f0] outline-none border resize-none"
                    style={{ borderColor: errors.revenueSource ? "#dc2626" : "#1e1e1e" }}
                  />
                </Field>

                <Field label="Business proposal" error={errors.proposal} icon={Description}>
                  <textarea
                    value={form.proposal}
                    onChange={(event) => handleChange("proposal", event.target.value)}
                    rows={5}
                    placeholder="Explain how the money will be used, expected returns, and why the facility is needed now."
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#161616] text-[#f0f0f0] outline-none border resize-none"
                    style={{ borderColor: errors.proposal ? "#dc2626" : "#1e1e1e" }}
                  />
                </Field>

                <div className="flex gap-3">
                  <Link
                    href="/loan"
                    className="px-5 py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}
                  >
                    Back to Loans
                  </Link>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "#ff6b00" }}
                  >
                    Submit Application
                  </button>
                </div>
                {submitError ? <p className="text-xs text-[#f87171]">{submitError}</p> : null}
              </form>
            ) : (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                    <CheckCircle style={{ fontSize: 24, color: "#16a34a" }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                      Loan application submitted
                    </h2>
                    <p className="text-sm text-[#cbd5e1] mt-2">
                      Your request for <span className="font-semibold text-[#f0f0f0]">{form.amount}</span> has been recorded and will be reviewed with your score profile and cashflow history.
                    </p>
                    <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                      <div className="space-y-2 text-sm">
                        <Row label="Purpose" value={form.purpose} />
                        <Row label="Tenor" value={form.tenor} />
                        <Row label="Status" value="Under review" />
                      </div>
                    </div>
                    <div className="mt-5 flex gap-3">
                      <Link
                        href="/loan/offer"
                        className="px-5 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "#ff6b00" }}
                      >
                        View Loan Offers
                      </Link>
                      <Link
                        href="/loan"
                        className="px-5 py-3 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}
                      >
                        Back to Loans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                What lenders want to see
              </h2>
              <div className="space-y-3 text-sm text-[#cbd5e1]">
                <p>1. A clear reason for the loan and how it grows the business.</p>
                <p>2. A believable repayment source tied to your sales or operations.</p>
                <p>3. A request amount that matches your current score and transaction history.</p>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Fast path
              </h2>
              <p className="text-sm text-[#94a3b8] leading-6">
                If you already have lender offers available, you can skip the manual application and go straight to pre-qualified offers.
              </p>
              <Link
                href="/loan/offer"
                className="mt-4 inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#ff6b00" }}
              >
                Open Loan Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children,
  error,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  icon: typeof MonetizationOn;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-[#f0f0f0] mb-2">
        <Icon style={{ fontSize: 18, color: "#ff6b00" }} />
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-[#f87171] mt-2">{error}</p> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#94a3b8]">{label}</span>
      <span className="font-semibold text-[#f0f0f0] text-right">{value}</span>
    </div>
  );
}

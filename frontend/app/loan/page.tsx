"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useTraderData } from "@/hooks/use-trader-data";
import { fetchBackend, formatDateLabel, formatNairaFromKobo } from "@/lib/backend";
import {
  AccountBalanceWallet,
  ChevronRight,
  Payments,
  Timeline,
  EditNote,
  RemoveRedEye,
  Close,
  BarChart,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";

// ─── raw shape from /api/v1/score/explain ─────────────────────────────────
interface BackendFactor {
  text: string;
  direction: "positive" | "negative";
}
interface BackendExplainResponse {
  score: number;
  pd: string | number;
  factors: BackendFactor[];
  modelVersion: string;
}

// ─── fetch ────────────────────────────────────────────────────────────────
async function fetchScoreExplain(): Promise<BackendExplainResponse> {
  return fetchBackend<BackendExplainResponse>("/api/v1/score/explain");
}

// ─── drawer ───────────────────────────────────────────────────────────────────
function LenderViewDrawer({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<BackendExplainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    fetchScoreExplain()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  });

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          backgroundColor: "#0d0d0d",
          borderLeft: "1px solid #1e1e1e",
          animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#3b1d09" }}
            >
              <RemoveRedEye style={{ fontSize: 18, color: "#ff6b00" }} />
            </div>
            <div>
              <p
                className="text-base font-bold text-[#f0f0f0]"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Lender's view of you
              </p>
              <p className="text-xs text-[#64748b]">
                How lenders assess your profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#1a1a1a]"
          >
            <Close style={{ fontSize: 18, color: "#64748b" }} />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-[#ff6b00] border-t-transparent"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              <p className="text-sm text-[#64748b]">Fetching your score…</p>
            </div>
          )}

          {error && (
            <div
              className="rounded-2xl p-5 flex gap-3"
              style={{ backgroundColor: "#1a0a0a", border: "1px solid #3b1111" }}
            >
              <Warning style={{ fontSize: 20, color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-semibold text-[#f0f0f0]">Could not load score</p>
                <p className="text-xs text-[#94a3b8] mt-1">{error}</p>
              </div>
            </div>
          )}

          {data && (
            <>
              {/* score ring card */}
              <div
                className="rounded-2xl p-6 flex items-center gap-6"
                style={{ backgroundColor: bandBg, border: `1px solid ${scoreColor}22` }}
              >
                <div className="relative shrink-0 w-24 h-24">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#1e1e1e" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - data.score / 850)}`}
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: scoreColor, fontFamily: "Epilogue, sans-serif" }}
                    >
                      {data.score}
                    </span>
                    <span className="text-[9px] text-[#64748b] uppercase tracking-widest">/ 850</span>
                  </div>
                </div>

                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em] mb-1"
                    style={{ color: scoreColor }}
                  >
                    {data.band}
                  </p>
                  <p
                    className="text-xl font-bold text-[#f0f0f0] leading-tight"
                    style={{ fontFamily: "Epilogue, sans-serif" }}
                  >
                    Credit score
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{data.summary}</p>
                </div>
              </div>

              {/* factors */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b] mb-3">
                  Score factors
                </p>
                <div className="space-y-3">
                  {data.factors.map((f, i) => {
                    const icon =
                      f.impact === "positive" ? (
                        <CheckCircle style={{ fontSize: 16, color: "#22c55e" }} />
                      ) : f.impact === "negative" ? (
                        <Warning style={{ fontSize: 16, color: "#ef4444" }} />
                      ) : (
                        <Info style={{ fontSize: 16, color: "#94a3b8" }} />
                      );

                    const accent =
                      f.impact === "positive" ? "#22c55e"
                      : f.impact === "negative" ? "#ef4444"
                      : "#94a3b8";

                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 flex gap-3"
                        style={{
                          backgroundColor: "#111111",
                          border: "1px solid #1e1e1e",
                          borderLeft: `3px solid ${accent}`,
                        }}
                      >
                        <div className="mt-0.5 shrink-0">{icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-[#f0f0f0] capitalize">{f.label}</p>
                          <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{f.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* recommendation */}
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: "#111111", border: "1px solid #ff6b0022" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart style={{ fontSize: 16, color: "#ff6b00" }} />
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#ff6b00]">
                    Lender recommendation
                  </p>
                </div>
                <p className="text-sm text-[#cbd5e1] leading-relaxed">{data.recommendation}</p>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid #1a1a1a" }}>
          <p className="text-xs text-[#475569] text-center">
            Score is indicative and based on your activity on this platform.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [showLenderView, setShowLenderView] = useState(false);
  const { activeLoan: backendLoan, offers } = useTraderData();

  const visibleLoan = backendLoan
    ? {
        lender: backendLoan.lenderName,
        facility: `${formatNairaFromKobo(backendLoan.principalKobo)} facility`,
        remaining: formatNairaFromKobo(
          Number(backendLoan.principalKobo) - Number(backendLoan.amountRepaidKobo)
        ),
        monthlyRepayment: backendLoan.repaymentPctLabel,
        nextDueDate: backendLoan.nextDueDate
          ? formatDateLabel(backendLoan.nextDueDate)
          : "Pending",
        amount: formatNairaFromKobo(backendLoan.principalKobo),
      }
    : null;

  const visibleOffers = offers.map((offer) => ({
    id: offer.id,
    name: offer.lenderName,
    amount: formatNairaFromKobo(offer.amountKobo),
    rate: offer.rateLabel,
    tenor: offer.tenorLabel,
  }));

  return (
    <AppShell role="user" title="Loans">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          {/* ── left column ── */}
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00] mb-3">
                Loan hub
              </p>
              <h1
                className="text-3xl font-bold text-[#f0f0f0]"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Manage your offers and active facility
              </h1>
              <p className="text-sm text-[#94a3b8] mt-2 max-w-2xl">
                This page is the main place for loans. Review pre-qualified offers, open your
                active repayment page, and track what is currently available to you.
              </p>

              {/* lender view trigger */}
              <button
                onClick={() => setShowLenderView(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0" }}
              >
                <RemoveRedEye style={{ fontSize: 16, color: "#ff6b00" }} />
                See what lenders see
                <span
                  className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}
                >
                  Score
                </span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/loan/active"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#3b1d09" }}
                >
                  <Timeline style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Active Loan
                </p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Open your repayment progress, next due date, and remaining balance.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">{visibleLoan?.amount ?? "No active loan"}</span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Open <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>

              <Link
                href="/loan/apply"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#3b1d09" }}
                >
                  <EditNote style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Apply for Loan
                </p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Submit a direct request with amount, purpose, repayment source, and business proposal.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">Direct request</span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Apply <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>

              <Link
                href="/loan/offer"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#3b1d09" }}
                >
                  <AccountBalanceWallet style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Loan Offers
                </p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Review your lender offers and accept the facility that fits your business best.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">
                    {visibleOffers.length > 0 ? `${visibleOffers.length} offers ready` : "No offers yet"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Review <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* ── right column ── */}
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <h2
                className="text-lg font-bold text-[#f0f0f0] mb-4"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Current facility snapshot
              </h2>
              {visibleLoan ? (
                <div className="space-y-3 text-sm">
                  <Row label="Lender" value={visibleLoan.lender} />
                  <Row label="Facility" value={visibleLoan.facility} />
                  <Row label="Outstanding" value={visibleLoan.remaining} />
                  <Row label="Repayment mode" value={visibleLoan.monthlyRepayment} />
                  <Row label="Next due date" value={visibleLoan.nextDueDate} />
                </div>
              ) : (
                <p className="text-sm text-[#94a3b8]">No active loan facility found.</p>
              )}
            </div>

            {visibleOffers[0] && (
              <div
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <h2
                  className="text-lg font-bold text-[#f0f0f0] mb-4"
                  style={{ fontFamily: "Epilogue, sans-serif" }}
                >
                  Top visible offer
                </h2>
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}
                >
                  <p className="text-sm font-semibold text-[#f0f0f0]">{visibleOffers[0].name}</p>
                  <p
                    className="text-2xl font-bold text-[#f0f0f0] mt-2"
                    style={{ fontFamily: "Epilogue, sans-serif" }}
                  >
                    {visibleOffers[0].amount}
                  </p>
                  <div className="space-y-1 mt-3 text-sm text-[#94a3b8]">
                    <p>Rate: <span className="font-semibold text-[#f0f0f0]">{visibleOffers[0].rate}</span></p>
                    <p>Tenor: <span className="font-semibold text-[#f0f0f0]">{visibleOffers[0].tenor}</span></p>
                  </div>
                  <Link
                    href={`/loan/offer?offer=${visibleOffers[0].id}`}
                    className="mt-4 w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "#ff6b00" }}
                  >
                    Review this offer
                  </Link>
                </div>
              </div>
            )}

            <Link
              href="/loan/apply"
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#3b1d09" }}
              >
                <EditNote style={{ fontSize: 22, color: "#ff6b00" }} />
              </div>
              <div>
                <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Need a custom request?
                </p>
                <p className="text-sm text-[#94a3b8] mt-1">
                  Open the direct loan application form and submit your proposal.
                </p>
              </div>
            </Link>

            <Link
              href="/payments"
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#3b1d09" }}
              >
                <Payments style={{ fontSize: 22, color: "#ff6b00" }} />
              </div>
              <div>
                <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Make a repayment
                </p>
                <p className="text-sm text-[#94a3b8] mt-1">
                  Open payments and settle your next installment.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showLenderView && <LenderViewDrawer onClose={() => setShowLenderView(false)} />}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#94a3b8]">{label}</span>
      <span className="font-semibold text-[#f0f0f0]">{value}</span>
    </div>
  );
}
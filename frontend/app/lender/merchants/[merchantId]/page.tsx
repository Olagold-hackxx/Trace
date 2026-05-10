"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TRACE_SCORES, TRANSACTIONS, JOBS } from "@/lib/mock-data";
import { TRADERS } from "@/lib/constants";
import { formatNaira, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Work,
  Wallet,
  EmojiEvents,
  CheckCircle,
  ArrowBack,
  LocationOn,
  Business,
  Cancel,
  InfoOutlined,
} from "@mui/icons-material";
import Link from "next/link";

const scoreBreakdown = [
  { label: "Revenue Consistency", value: 85 },
  { label: "Repayment History",   value: 92 },
  { label: "Transaction Volume",  value: 78 },
  { label: "Business History",    value: 88 },
  { label: "Job Hiring Activity", value: 81 },
];

export default function MerchantDetailPage({ params }: { params: { merchantId: string } }) {
  const trader = TRADERS.find((t) => t.id === params.merchantId);
  const traceScore = TRACE_SCORES[params.merchantId as keyof typeof TRACE_SCORES];
  const merchantTransactions = TRANSACTIONS.filter((t) => t.traderId === params.merchantId);
  const merchantJobs = JOBS.filter((j) => j.traderId === params.merchantId);
  const totalRevenue = merchantTransactions.reduce(
    (sum, t) => (t.type === "payment_received" ? sum + t.amount : sum),
    0
  );

  if (!trader || !traceScore) {
    return (
      <AppShell role="lender">
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
          <p className="text-[#9B99B5]">Merchant not found</p>
        </div>
      </AppShell>
    );
  }

  const score = traceScore.score;
  const scoreColor = score >= 750 ? "#F5A623" : score >= 700 ? "#22C55E" : "#FF6B35";
  const circumference = 54 * 2 * Math.PI;
  const strokeDash = ((score / 850) * 100 / 100) * circumference;

  return (
    <AppShell role="lender">
      <div className="min-h-screen p-6 md:p-8 space-y-6" style={{ backgroundColor: "#0A0A0F" }}>

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/lender/traders"
            className="flex items-center gap-2 text-sm font-semibold text-[#5C5A78] hover:text-[#F0EFE8] transition-colors"
          >
            <ArrowBack sx={{ fontSize: "18px" }} />
            Back to Traders
          </Link>
          <span className="text-[#3A3A58]">/</span>
          <span className="text-sm text-[#9B99B5]">{trader.name}</span>
        </div>

        {/* Hero header */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
        >
          {/* Top banner */}
          <div
            className="h-28 w-full"
            style={{ background: "linear-gradient(135deg, #1C1020 0%, #141420 50%, #0F1A1C 100%)" }}
          />
          <div className="px-8 pb-8">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-6">
              <div className="flex items-end gap-5">
                <img
                  src={trader.image}
                  alt={trader.name}
                  className="w-24 h-24 rounded-2xl object-cover object-top border-4"
                  style={{ borderColor: "#0A0A0F" }}
                />
                <div className="pb-1">
                  <h1 className="text-2xl font-black text-[#F0EFE8]">{trader.name}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-sm text-[#5C5A78]">
                      <Business sx={{ fontSize: "15px" }} />
                      {trader.owner}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-[#5C5A78]">
                      <LocationOn sx={{ fontSize: "15px", color: "#FF6B35" }} />
                      {trader.location}
                    </div>
                  </div>
                </div>
              </div>
              <span
                className="text-xs font-black px-4 py-2 rounded-full"
                style={{ backgroundColor: "#22C55E20", color: "#22C55E", border: "1px solid #22C55E40" }}
              >
                ✓ Verified Trader
              </span>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "TraceScore", value: String(score), color: scoreColor },
                { label: "Weekly Revenue", value: formatNaira(totalRevenue), color: "#22C55E" },
                { label: "Active Jobs", value: String(merchantJobs.length), color: "#FF6B35" },
                { label: "Account Balance", value: formatNaira(245500), color: "#F5A623" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                  <p className="text-xs text-[#5C5A78] mb-1">{s.label}</p>
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Score gauge + breakdown */}
          <div className="space-y-6">
            {/* Gauge */}
            <div
              className="rounded-3xl p-6 flex flex-col items-center"
              style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
            >
              <p className="text-sm font-black text-[#F0EFE8] mb-5 self-start">TraceScore</p>
              <div className="relative w-44 h-44 mb-4">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ backgroundColor: scoreColor }} />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A40" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black text-[#F0EFE8]">{score}</p>
                  <p className="text-xs text-[#5C5A78]">/ 850</p>
                </div>
              </div>
              <div
                className="px-4 py-1.5 rounded-full text-sm font-black"
                style={{ backgroundColor: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
              >
                {score >= 750 ? "Excellent" : score >= 700 ? "Good" : "Fair"}
              </div>
            </div>

            {/* Score breakdown */}
            <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <p className="text-sm font-black text-[#F0EFE8] mb-5">Score Breakdown</p>
              <div className="space-y-4">
                {scoreBreakdown.map((s) => {
                  const c = s.value >= 85 ? "#F5A623" : s.value >= 75 ? "#22C55E" : "#FF6B35";
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#9B99B5]">{s.label}</span>
                        <span className="font-black text-[#F0EFE8]">{s.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
                        <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${c}80, ${c})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Middle: Risk assessment */}
          <div className="space-y-6">
            <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <h2 className="text-lg font-black text-[#F0EFE8] mb-5">Risk Assessment</h2>

              <div className="space-y-5">
                <p className="text-sm text-[#9B99B5] leading-7">
                  {trader.name} demonstrates strong financial discipline with consistent monthly revenues exceeding ₦1.8M.
                  The business has maintained a 100% repayment rate and actively hires verified workers through Trace Jobs,
                  indicating reliable operations and team management.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-5" style={{ borderTop: "1px solid #2A2A40" }}>
                  {[
                    { label: "Business History", value: "24 months", color: "#F5A623" },
                    { label: "Repayment Rate", value: "100%", color: "#22C55E" },
                    { label: "Transactions", value: `${merchantTransactions.length} verified`, color: "#FF6B35" },
                    { label: "Jobs Posted", value: String(merchantJobs.length), color: "#A855F7" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                      <p className="text-xs text-[#5C5A78] mb-1">{s.label}</p>
                      <p className="font-black" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendation banner */}
                <div
                  className="flex items-start gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: "#22C55E10", border: "1px solid #22C55E30" }}
                >
                  <CheckCircle sx={{ fontSize: "20px", color: "#22C55E", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p className="text-sm font-black text-[#22C55E]">Recommended for Approval</p>
                    <p className="text-xs text-[#5C5A78] mt-1">Strong credit profile · Consistent revenue · Active hiring history</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <h2 className="text-lg font-black text-[#F0EFE8]">Recent Transactions</h2>
                <span className="text-xs text-[#5C5A78]">{merchantTransactions.length} total</span>
              </div>
              <div className="divide-y" style={{ borderColor: "#1C1C2E" }}>
                {merchantTransactions.slice(0, 5).map((txn) => {
                  const isIn = txn.type === "payment_received";
                  return (
                    <div key={txn.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#0F0F1A] transition-colors">
                      <div>
                        <p className="text-sm font-bold text-[#F0EFE8]">{isIn ? "Payment In" : "Worker Payout"}</p>
                        <p className="text-xs text-[#5C5A78] mt-0.5">{txn.source} · {formatDate(txn.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: isIn ? "#22C55E" : "#FF6B35" }}>
                          {isIn ? "+" : "-"}{formatNaira(txn.amount)}
                        </p>
                        <span className="text-xs text-[#22C55E]">Completed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Decision card */}
          <div>
            <div className="rounded-3xl p-6 sticky top-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <h2 className="text-lg font-black text-[#F0EFE8] mb-6">Underwriting Decision</h2>

              {/* Amount display */}
              <div className="rounded-2xl p-5 mb-5 text-center" style={{ background: "linear-gradient(135deg, #1C1020 0%, #141420 100%)", border: "1px solid #FF6B3530" }}>
                <p className="text-xs text-[#5C5A78] mb-2 uppercase tracking-widest font-bold">Recommended Amount</p>
                <p className="text-4xl font-black text-[#F0EFE8]">₦500,000</p>
                <p className="text-xs text-[#5C5A78] mt-2">18% APR · 12-month term</p>
              </div>

              {/* Key signals */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Score threshold", check: true },
                  { label: "Revenue consistency", check: true },
                  { label: "No prior defaults", check: true },
                  { label: "Active business ops", check: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-none" style={{ backgroundColor: "#22C55E20" }}>
                      <CheckCircle sx={{ fontSize: "14px", color: "#22C55E" }} />
                    </div>
                    <p className="text-sm text-[#9B99B5]">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#22C55E", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
                >
                  <CheckCircle sx={{ fontSize: "18px" }} />
                  Approve Application
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition-all hover:bg-[#EF444420]"
                  style={{ border: "1px solid #2A2A40", color: "#EF4444" }}
                >
                  <Cancel sx={{ fontSize: "18px" }} />
                  Reject
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-[#9B99B5] transition-all hover:text-[#F0EFE8] hover:bg-[#1C1C2E]"
                  style={{ border: "1px solid #2A2A40" }}
                >
                  <InfoOutlined sx={{ fontSize: "18px" }} />
                  Request More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

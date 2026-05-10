"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowBack,
  TrendingUp,
  Wallet,
  Work,
  Business,
  CheckCircle,
  Cancel,
  AccessTime,
  ExpandMore,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  Warning,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const merchant = {
  id: "amaka-foods",
  name: "Amaka Foods",
  owner: "Amaka Okonkwo",
  type: "Food & Beverage",
  location: "Yaba, Lagos",
  phone: "+234 801 234 5678",
  email: "amaka@amakafoods.ng",
  since: "March 2023",
  traceScore: 742,
  scoreGrade: "Excellent",
  requestedAmount: 2500000,
  purpose: "Working Capital Expansion",
  riskBand: "Low",
  status: "Pending Review",
};

const scoreFactors = [
  { label: "Payment History", score: 90, weight: "35%", color: "#ff6b00" },
  { label: "Revenue Consistency", score: 74, weight: "25%", color: "#ff6b00" },
  { label: "Business Longevity", score: 68, weight: "20%", color: "#ff6b00" },
  { label: "Employment Record", score: 55, weight: "10%", color: "#7c3aed" },
  { label: "Lender Trust", score: 82, weight: "10%", color: "#ff6b00" },
];

const revenueHistory = [
  { month: "Nov", revenue: 380000, payments: 42 },
  { month: "Dec", revenue: 520000, payments: 58 },
  { month: "Jan", revenue: 410000, payments: 45 },
  { month: "Feb", revenue: 490000, payments: 54 },
  { month: "Mar", revenue: 580000, payments: 63 },
  { month: "Apr", revenue: 620000, payments: 69 },
  { month: "May", revenue: 710000, payments: 78 },
];

const scoreHistory = [
  { month: "Nov", score: 695 },
  { month: "Dec", score: 708 },
  { month: "Jan", score: 715 },
  { month: "Feb", score: 720 },
  { month: "Mar", score: 728 },
  { month: "Apr", score: 735 },
  { month: "May", score: 742 },
];

const loanHistory = [
  { id: "TRC-001", amount: "₦500,000", lender: "FirstBank", rate: "18% p.a.", status: "Repaid", date: "Jun 2023" },
  { id: "TRC-002", amount: "₦1,200,000", lender: "Access Bank", rate: "20% p.a.", status: "Repaid", date: "Dec 2023" },
  { id: "TRC-003", amount: "₦800,000", lender: "Zenith Capital", rate: "17% p.a.", status: "Active", date: "Feb 2024" },
];

const recentTransactions = [
  { date: "May 10", desc: "Market sale — Table 4", amount: "₦45,000", type: "Credit" },
  { date: "May 10", desc: "Supplier payment — Okafor Farms", amount: "₦28,000", type: "Debit" },
  { date: "May 09", desc: "Catering — Okeke Wedding", amount: "₦120,000", type: "Credit" },
  { date: "May 09", desc: "Rent payment — Market stall", amount: "₦15,000", type: "Debit" },
  { date: "May 08", desc: "Bulk food sale", amount: "₦67,500", type: "Credit" },
  { date: "May 07", desc: "Staff wages", amount: "₦48,000", type: "Debit" },
  { date: "May 07", desc: "Event catering — UNILAG", amount: "₦95,000", type: "Credit" },
  { date: "May 06", desc: "Equipment purchase", amount: "₦32,000", type: "Debit" },
];

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}

export default function MerchantCreditFilePage() {
  const [decision, setDecision] = useState<"approve" | "decline" | null>(null);
  const [loanAmount, setLoanAmount] = useState("2500000");
  const [interestRate, setInterestRate] = useState("18");
  const [tenor, setTenor] = useState("12");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const scoreColor = merchant.traceScore >= 700 ? "#16a34a" : merchant.traceScore >= 500 ? "#d97706" : "#dc2626";
  const scoreBg = merchant.traceScore >= 700 ? "#dcfce7" : merchant.traceScore >= 500 ? "#fef3c7" : "#fee2e2";

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link href="/lender/traders" className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f0f0f0] transition-colors">
            <ArrowBack style={{ fontSize: 18 }} />
            Back to Merchants
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#111111] rounded-2xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}>
              {merchant.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{merchant.name}</h1>
              <p className="text-[#cbd5e1] text-sm mt-1">{merchant.owner} · {merchant.type}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <LocationOn style={{ fontSize: 14 }} />{merchant.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <CalendarToday style={{ fontSize: 14 }} />Member since {merchant.since}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">TraceScore</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: scoreColor }}>{merchant.traceScore}</p>
              <Badge label={merchant.scoreGrade} color={scoreColor} bg={scoreBg} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">Requested</p>
              <p className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>₦2.5M</p>
              <Badge label={merchant.riskBand + " Risk"} color="#16a34a" bg="#dcfce7" />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">Avg Monthly</p>
              <p className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>₦547K</p>
              <Badge label="Revenue" color="#ff6b00" bg="#3b1d09" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* TraceScore Breakdown */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>TraceScore Breakdown</h2>
              <div className="space-y-4">
                {scoreFactors.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#f0f0f0]">{f.label}</span>
                        <span className="text-xs text-[#94a3b8]">(weight: {f.weight})</span>
                      </div>
                      <span className="font-bold text-[#f0f0f0]">{f.score}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                      <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: f.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: "#1e1e1e" }}>
                <div>
                  <p className="text-sm text-[#94a3b8]">Composite Score</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: "#ff6b00" }}>742 / 900</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#94a3b8]">Score Trend (30d)</p>
                  <p className="text-lg font-bold" style={{ color: "#16a34a" }}>+7 points ↑</p>
                </div>
              </div>
            </div>

            {/* Score History Chart */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Score History — 7 Months</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[680, 760]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "#f0f0f0", fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5} dot={{ fill: "#ff6b00", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Revenue & Payment Volume</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueHistory} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => [`₦${v.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ff6b00" name="Revenue (₦)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="payments" fill="#1e1e1e" name="No. of Payments" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Loan History */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                      {["Loan ID", "Amount", "Lender", "Rate", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left pb-3 font-semibold text-[#94a3b8] pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loanHistory.map((loan) => (
                      <tr key={loan.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                        <td className="py-3 pr-4 font-mono text-[#cbd5e1] text-xs">{loan.id}</td>
                        <td className="py-3 pr-4 font-semibold text-[#f0f0f0]">{loan.amount}</td>
                        <td className="py-3 pr-4 text-[#cbd5e1]">{loan.lender}</td>
                        <td className="py-3 pr-4 text-[#cbd5e1]">{loan.rate}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            label={loan.status}
                            color={loan.status === "Repaid" ? "#16a34a" : "#ff6b00"}
                            bg={loan.status === "Repaid" ? "#dcfce7" : "#3b1d09"}
                          />
                        </td>
                        <td className="py-3 text-[#94a3b8]">{loan.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" }}>
                <CheckCircle style={{ fontSize: 20, color: "#16a34a" }} />
                <p className="text-sm font-semibold text-[#16a34a]">100% repayment rate across all 3 prior loans. Zero defaults.</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Recent Transactions (Last 30 Days)</h2>
              <div className="space-y-2">
                {recentTransactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ backgroundColor: "#161616" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.type === "Credit" ? "#dcfce7" : "#fee2e2" }}>
                        {t.type === "Credit"
                          ? <TrendingUp style={{ fontSize: 16, color: "#16a34a" }} />
                          : <Wallet style={{ fontSize: 16, color: "#dc2626" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f0f0f0]">{t.desc}</p>
                        <p className="text-xs text-[#94a3b8]">{t.date}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{ color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                      {t.type === "Credit" ? "+" : "-"}{t.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Business Profile</h2>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Business, label: "Business Type", val: merchant.type },
                  { icon: LocationOn, label: "Location", val: merchant.location },
                  { icon: Phone, label: "Phone", val: merchant.phone },
                  { icon: Email, label: "Email", val: merchant.email },
                  { icon: CalendarToday, label: "Member Since", val: merchant.since },
                  { icon: Work, label: "Jobs Posted", val: "12 jobs, 38 workers hired" },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon style={{ fontSize: 16, color: "#94a3b8", marginTop: 2 }} />
                    <div>
                      <p className="text-[#94a3b8] text-xs">{label}</p>
                      <p className="text-[#f0f0f0] font-medium">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Summary */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Risk Summary</h2>
              <div className="space-y-3">
                {[
                  { label: "Risk Band", val: "Low", color: "#16a34a", bg: "#dcfce7" },
                  { label: "Default Probability", val: "1.8%", color: "#16a34a", bg: "#dcfce7" },
                  { label: "Debt-to-Revenue", val: "14%", color: "#d97706", bg: "#fef3c7" },
                  { label: "Collections Flag", val: "None", color: "#16a34a", bg: "#dcfce7" },
                  { label: "Fraud Risk", val: "Minimal", color: "#16a34a", bg: "#dcfce7" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-sm text-[#cbd5e1]">{r.label}</span>
                    <Badge label={r.val} color={r.color} bg={r.bg} />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <div className="flex items-start gap-2">
                  <Warning style={{ fontSize: 16, color: "#d97706", marginTop: 1 }} />
                  <p className="text-xs text-[#cbd5e1]">Debt-to-revenue slightly elevated due to active ₦800K loan. Within acceptable threshold.</p>
                </div>
              </div>
            </div>

            {/* Loan Application */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-1" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Application</h2>
              <p className="text-xs text-[#94a3b8] mb-4">Purpose: {merchant.purpose}</p>

              {submitted ? (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: decision === "approve" ? "#dcfce7" : "#fee2e2", border: `1px solid ${decision === "approve" ? "#bbf7d0" : "#fecaca"}` }}>
                  {decision === "approve" ? <CheckCircle style={{ fontSize: 32, color: "#16a34a" }} /> : <Cancel style={{ fontSize: 32, color: "#dc2626" }} />}
                  <p className="text-sm font-bold mt-2" style={{ color: decision === "approve" ? "#16a34a" : "#dc2626" }}>
                    {decision === "approve" ? "Loan Approved!" : "Application Declined"}
                  </p>
                  <p className="text-xs text-[#cbd5e1] mt-1">
                    {decision === "approve" ? `₦${parseInt(loanAmount).toLocaleString()} at ${interestRate}% p.a. for ${tenor} months.` : "Merchant will be notified."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Loan Amount (₦)</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                      style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                      style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Tenor (months)</label>
                    <select
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                      style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                    >
                      {["3", "6", "9", "12", "18", "24"].map((m) => (
                        <option key={m} value={m}>{m} months</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Decision Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Add internal notes..."
                      className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none"
                      style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setDecision("approve"); handleSubmit(); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#16a34a" }}
                    >
                      <CheckCircle style={{ fontSize: 18 }} />
                      Approve
                    </button>
                    <button
                      onClick={() => { setDecision("decline"); handleSubmit(); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      <Cancel style={{ fontSize: 18 }} />
                      Decline
                    </button>
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]" style={{ borderColor: "#1e1e1e" }}>
                    <AccessTime style={{ fontSize: 16, marginRight: 6 }} />
                    Request More Info
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

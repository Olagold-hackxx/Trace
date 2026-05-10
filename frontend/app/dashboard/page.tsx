"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Work,
  Receipt,
  AccountBalance,
  ContentCopy,
  Add,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  AccessTime,
  Cancel,
  ChevronRight,
  People,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const revenueData = [
  { month: "Dec", revenue: 320000, expenses: 98000 },
  { month: "Jan", revenue: 410000, expenses: 125000 },
  { month: "Feb", revenue: 385000, expenses: 110000 },
  { month: "Mar", revenue: 520000, expenses: 142000 },
  { month: "Apr", revenue: 490000, expenses: 135000 },
  { month: "May", revenue: 710000, expenses: 180000 },
];

const transactions = [
  { id: "TRX001", date: "May 10, 2026", desc: "Market sale — Yaba table 4", type: "Credit", amount: 45000, status: "Success" },
  { id: "TRX002", date: "May 10, 2026", desc: "Supplier payment — Okafor Farms", type: "Debit", amount: 28000, status: "Success" },
  { id: "TRX003", date: "May 09, 2026", desc: "Catering — Okeke Wedding", type: "Credit", amount: 120000, status: "Success" },
  { id: "TRX004", date: "May 09, 2026", desc: "Rent — Market stall", type: "Debit", amount: 15000, status: "Success" },
  { id: "TRX005", date: "May 08, 2026", desc: "Bulk food sale", type: "Credit", amount: 67500, status: "Success" },
  { id: "TRX006", date: "May 08, 2026", desc: "Payment link — Ngozi Adeyemi", type: "Credit", amount: 35000, status: "Pending" },
  { id: "TRX007", date: "May 07, 2026", desc: "Staff wages", type: "Debit", amount: 48000, status: "Success" },
  { id: "TRX008", date: "May 07, 2026", desc: "Event catering — UNILAG dept", type: "Credit", amount: 95000, status: "Success" },
];

const activeJobs = [
  { title: "Sales Assistant", workers: 2, status: "Active", pay: "₦8,500/day", daysLeft: 3 },
  { title: "Market Supervisor", workers: 1, status: "Active", pay: "₦12,000/day", daysLeft: 1 },
  { title: "Delivery Rider", workers: 3, status: "Completed", pay: "₦6,000/day", daysLeft: 0 },
];

const scoreFactors = [
  { label: "Payment History", pct: 90, color: "#ff6b00" },
  { label: "Revenue Consistency", pct: 74, color: "#ff6b00" },
  { label: "Business Longevity", pct: 60, color: "#ff6b00" },
  { label: "Employment Record", pct: 45, color: "#7c3aed" },
  { label: "Lender Trust", pct: 82, color: "#2563eb" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    Success: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
    Pending: { color: "#d97706", bg: "#fef3c7", icon: AccessTime },
    Failed: { color: "#dc2626", bg: "#fee2e2", icon: Cancel },
  };
  const s = map[status] || map.Pending;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
      <Icon style={{ fontSize: 12 }} />{status}
    </span>
  );
}

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const paymentLink = "https://pay.trace.ng/amaka-foods";

  const copy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell role="user">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Good morning, Amaka 👋
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1">Saturday, May 10, 2026 · Amaka Foods</p>
          </div>
          <Link
            href="/payments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#ff6b00" }}
          >
            <Add style={{ fontSize: 18 }} />
            Request Payment
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Revenue (May)" value="₦710,000" icon={Wallet} trend={18.3} color="#ff6b00" />
          <MetricCard label="Pending Payments" value="₦45,200" icon={Receipt} color="#d97706" sub="2 transactions pending" />
          <MetricCard label="TraceScore" value="742 / 900" icon={TrendingUp} trend={1.2} trendLabel="this month" color="#16a34a" />
          <MetricCard label="Available Balance" value="₦128,450" icon={AccountBalance} trend={-3.1} color="#2563eb" />
        </div>

        {/* Payment link bar */}
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <span className="text-sm text-[#f0f0f0] font-mono">{paymentLink}</span>
          </div>
          <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616]" style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}>
            <ContentCopy style={{ fontSize: 16 }} />
            {copied ? "Copied!" : "Copy link"}
          </button>
          <div className="hidden lg:block text-xs text-[#94a3b8]">Your Trace payment link · share with anyone</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue chart */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Revenue Overview</h2>
                <div className="flex gap-4 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#ff6b00" }} />Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#334155" }} />Expenses</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }}
                    formatter={(v: number) => `₦${v.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="expenses" stroke="#334155" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Transactions */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Recent Transactions</h2>
                <Link href="/payments" className="text-sm font-semibold" style={{ color: "#ff6b00" }}>View all →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                      {["Date", "Description", "Type", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left pb-3 font-semibold text-[#94a3b8] pr-4 text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                        <td className="py-3 pr-4 text-xs text-[#94a3b8] whitespace-nowrap">{t.date}</td>
                        <td className="py-3 pr-4 font-medium text-[#f0f0f0]">{t.desc}</td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1 text-xs">
                            {t.type === "Credit"
                              ? <ArrowDownward style={{ fontSize: 14, color: "#16a34a" }} />
                              : <ArrowUpward style={{ fontSize: 14, color: "#dc2626" }} />}
                            <span style={{ color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>{t.type}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold" style={{ color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                          {t.type === "Credit" ? "+" : "-"}₦{t.amount.toLocaleString()}
                        </td>
                        <td className="py-3"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right — widgets */}
          <div className="space-y-6">
            {/* TraceScore widget */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>TraceScore</h2>
                <Link href="/tracescore" className="text-xs font-semibold" style={{ color: "#ff6b00" }}>Full report →</Link>
              </div>
              {/* Gauge */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                    <circle cx="100" cy="100" r="75" fill="none" stroke="#1e1e1e" strokeWidth="14" />
                    <circle cx="100" cy="100" r="75" fill="none" stroke="#ff6b00" strokeWidth="14"
                      strokeDasharray={`${2 * Math.PI * 75 * 0.742} ${2 * Math.PI * 75}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>742</p>
                    <p className="text-xs font-semibold" style={{ color: "#ff6b00" }}>Excellent</p>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] mt-2">+7 points this month</p>
              </div>
              {/* Factors */}
              <div className="space-y-3">
                {scoreFactors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#cbd5e1]">{f.label}</span>
                      <span className="font-semibold text-[#f0f0f0]">{f.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                      <div className="h-full rounded-full" style={{ width: `${f.pct}%`, backgroundColor: f.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Pre-qualified */}
              <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-xs text-[#94a3b8]">Pre-qualified for</p>
                <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>₦2,500,000</p>
                <p className="text-xs text-[#94a3b8]">from 3 verified lenders</p>
              </div>
            </div>

            {/* Active jobs */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Active Jobs</h2>
                <Link href="/jobs" className="text-xs font-semibold" style={{ color: "#ff6b00" }}>View all →</Link>
              </div>
              <div className="space-y-3">
                {activeJobs.map((j) => (
                  <div key={j.title} className="p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#f0f0f0]">{j.title}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: j.status === "Active" ? "#dcfce7" : "#161616", color: j.status === "Active" ? "#16a34a" : "#94a3b8" }}>
                        {j.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8]">{j.workers} worker{j.workers !== 1 ? "s" : ""} · {j.pay}</p>
                    {j.daysLeft > 0 && <p className="text-xs text-[#d97706] mt-1">{j.daysLeft} day{j.daysLeft !== 1 ? "s" : ""} left</p>}
                  </div>
                ))}
              </div>
              <Link href="/jobs" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]" style={{ borderColor: "#1e1e1e" }}>
                <Add style={{ fontSize: 18 }} />Post a Job
              </Link>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Request Payment", href: "/payments", icon: Wallet, color: "#ff6b00", bg: "#3b1d09" },
                  { label: "Post a Job", href: "/jobs", icon: Work, color: "#ff6b00", bg: "#3b1d09" },
                  { label: "View Score", href: "/tracescore", icon: TrendingUp, color: "#16a34a", bg: "#dcfce7" },
                  { label: "Find Workers", href: "/marketplace", icon: People, color: "#2563eb", bg: "#172554" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link key={a.label} href={a.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl text-center text-xs font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: a.bg, color: a.color }}>
                      <Icon style={{ fontSize: 24 }} />
                      {a.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

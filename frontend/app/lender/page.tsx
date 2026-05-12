"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import Link from "next/link";
import { useLenderData } from "@/hooks/use-lender-data";
import { formatDateLabel, formatNairaFromKobo } from "@/lib/backend";
import {
  AccountBalance, TrendingUp, People, Warning, CheckCircle, AccessTime,
  ChevronRight,
} from "@mui/icons-material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";

const repaymentTrend = [
  { month: "Nov", repaid: 3200000, disbursed: 4000000 },
  { month: "Dec", repaid: 4800000, disbursed: 5500000 },
  { month: "Jan", repaid: 5200000, disbursed: 6000000 },
  { month: "Feb", repaid: 6100000, disbursed: 7200000 },
  { month: "Mar", repaid: 7400000, disbursed: 8500000 },
  { month: "Apr", repaid: 8900000, disbursed: 9800000 },
  { month: "May", repaid: 5200000, disbursed: 11000000 },
];

const sectorData = [
  { name: "Food & Bev", value: 14, color: "#ff6b00" },
  { name: "Retail", value: 5, color: "#ff6b00" },
  { name: "Logistics", value: 2, color: "#7c3aed" },
  { name: "Fashion", value: 1, color: "#d97706" },
  { name: "Services", value: 1, color: "#16a34a" },
];

const scoreDistribution = [
  { band: "750+", count: 8 },
  { band: "700–749", count: 9 },
  { band: "650–699", count: 4 },
  { band: "600–649", count: 2 },
];

const statusStyle: Record<string, { color: string; bg: string }> = {
  Pending: { color: "#d97706", bg: "#fef3c7" },
  "Under Review": { color: "#ff6b00", bg: "#3b1d09" },
  "Info Needed": { color: "#dc2626", bg: "#fee2e2" },
  Approved: { color: "#16a34a", bg: "#dcfce7" },
};

const riskStyle: Record<string, { color: string; bg: string }> = {
  Low: { color: "#16a34a", bg: "#dcfce7" },
  Medium: { color: "#d97706", bg: "#fef3c7" },
  High: { color: "#dc2626", bg: "#fee2e2" },
};

function Badge({ label, style }: { label: string; style: { color: string; bg: string } }) {
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: style.color, backgroundColor: style.bg }}>{label}</span>;
}

export default function LenderDashboardPage() {
  const { summary, applications, merchants } = useLenderData();
  const topMerchants = merchants.slice(0, 5);

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Welcome back, Zenith Capital</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Saturday, May 10, 2026 · Lender Dashboard</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total AUM" value={formatNairaFromKobo(summary?.totalAumKobo)} icon={AccountBalance} color="#ff6b00" />
          <MetricCard label="Active Loans" value={String(summary?.activeLoans ?? 0)} icon={TrendingUp} sub={`${applications.length} applications in pipeline`} color="#ff6b00" />
          <MetricCard label="Merchants" value={String(merchants.length)} icon={People} color="#ff6b00" />
          <MetricCard label="Pipeline" value={String(applications.length)} icon={Warning} sub="Live backend approvals" color="#dc2626" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Repayment trend */}
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Disbursement vs Repayment</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={repaymentTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }} formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="disbursed" fill="#334155" name="Disbursed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repaid" fill="#ff6b00" name="Repaid" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio mix */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-base font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Portfolio by Sector</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 8, fontSize: 12, color: "#f0f0f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {sectorData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[#cbd5e1]">{s.name}</span>
                  </div>
                  <span className="font-semibold text-[#f0f0f0]">{s.value} loans</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score distribution */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Portfolio Score Distribution</h2>
          <div className="grid grid-cols-4 gap-4">
            {scoreDistribution.map((b) => (
              <div key={b.band} className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{b.count}</p>
                <p className="text-xs text-[#94a3b8] mt-1">Score {b.band}</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                  <div className="h-full rounded-full" style={{ width: `${(b.count / 23) * 100}%`, backgroundColor: "#ff6b00" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" }}>
            <CheckCircle style={{ fontSize: 20, color: "#16a34a" }} />
            <p className="text-sm font-semibold text-[#16a34a]">74% of portfolio is above TraceScore 700 — excellent credit quality.</p>
          </div>
        </div>

        {/* Loan pipeline */}
        <div className="bg-[#111111] rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#1e1e1e" }}>
            <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Pipeline</h2>
            <Link href="/lender/approvals" className="text-sm font-semibold" style={{ color: "#ff6b00" }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Merchant", "Type", "Score", "Amount", "Risk", "Status", "Days", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-xs text-[#94a3b8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const merchant = merchants.find((item) => item.id === app.userId);
                  const amount = Number(app.amountKobo);
                  const normalizedStatus = app.status.replace(/_/g, " ");
                  return (
                  <tr key={app.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#ff6b00" }}>{merchant?.businessName?.[0] ?? merchant?.fullName?.[0] ?? "M"}</div>
                        <div>
                          <p className="font-semibold text-[#f0f0f0]">{merchant?.businessName ?? merchant?.fullName ?? "Merchant"}</p>
                          <p className="text-xs text-[#94a3b8]">{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#cbd5e1]">{merchant?.businessType ?? "General"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "#ff6b00" }}>Live</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#f0f0f0]">{formatNairaFromKobo(amount)}</td>
                    <td className="px-5 py-4"><Badge label={amount > 100000000 ? "High" : amount > 50000000 ? "Medium" : "Low"} style={amount > 100000000 ? riskStyle.High : amount > 50000000 ? riskStyle.Medium : riskStyle.Low} /></td>
                    <td className="px-5 py-4"><Badge label={normalizedStatus} style={statusStyle[normalizedStatus] || statusStyle.Pending} /></td>
                    <td className="px-5 py-4 text-[#94a3b8] text-xs">{formatDateLabel(app.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/lender/merchants/${app.userId}`} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ff6b00" }}>
                        Review <ChevronRight style={{ fontSize: 14 }} />
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top merchants */}
        <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Top Performing Merchants</h2>
            <Link href="/lender/traders" className="text-sm font-semibold" style={{ color: "#ff6b00" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {topMerchants.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <span className="text-sm font-bold text-[#94a3b8] w-5">{i + 1}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#ff6b00" }}>{(m.businessName ?? m.fullName)[0]}</div>
                <div className="flex-1">
                  <p className="font-semibold text-[#f0f0f0] text-sm">{m.businessName ?? m.fullName}</p>
                  <p className="text-xs text-[#94a3b8]">{m.businessType ?? "Trader"} · {m.marketName ?? "Lagos"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-[#94a3b8]">Role</p>
                    <p className="font-bold text-[#f0f0f0]">{m.role}</p>
                  </div>
                  <CheckCircle style={{ fontSize: 20, color: "#16a34a" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

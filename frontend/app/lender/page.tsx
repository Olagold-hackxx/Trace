"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import Link from "next/link";
import { useLenderData } from "@/hooks/use-lender-data";
import { formatDateLabel, formatNairaFromKobo } from "@/lib/backend";
import { Spinner } from "@/components/ui/spinner";
import {
  AccountBalance, TrendingUp, People, Warning, CheckCircle,
  ChevronRight,
} from "@mui/icons-material";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";

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

const SECTOR_COLORS = ["#ff6b00", "#2563eb", "#7c3aed", "#d97706", "#16a34a", "#0891b2", "#be185d"];

export default function LenderDashboardPage() {
  const { user, summary, applications, merchants, loading } = useLenderData();
  const topMerchants = merchants.slice(0, 5);

  // Derive sector distribution from real merchant data
  const sectorData = (() => {
    const counts: Record<string, number> = {};
    merchants.forEach((m) => {
      const sector = m.businessType ?? "General";
      counts[sector] = (counts[sector] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: SECTOR_COLORS[i % SECTOR_COLORS.length] }));
  })();

  if (loading) {
    return (
      <AppShell role="lender">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading portfolio data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Welcome back, {user?.businessName ?? user?.fullName ?? "Lender"}</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Live portfolio overview from the backend</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total AUM" value={formatNairaFromKobo(summary?.totalAumKobo)} icon={AccountBalance} color="#ff6b00" />
          <MetricCard label="Active Loans" value={String(summary?.activeLoans ?? 0)} icon={TrendingUp} sub={`${applications.length} applications in pipeline`} color="#ff6b00" />
          <MetricCard label="Merchants" value={String(merchants.length)} icon={People} color="#ff6b00" />
          <MetricCard label="Pipeline" value={String(applications.length)} icon={Warning} sub="Live backend approvals" color="#dc2626" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Applications by amount */}
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Applications by Amount</h2>
            {applications.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-[#94a3b8]">No applications in pipeline</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={applications.slice(0, 10).map((a) => ({ id: a.id.slice(0, 8), amount: Math.round(Number(a.amountKobo) / 100) }))} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="id" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }} formatter={(v: number) => `₦${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="amount" fill="#ff6b00" name="Amount" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Portfolio mix */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-base font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Merchants by Sector</h2>
            {sectorData.length === 0 ? (
              <div className="flex items-center justify-center h-[160px] text-sm text-[#94a3b8]">No merchant data</div>
            ) : (
              <>
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
                  {sectorData.map((s, index) => (
                    <div key={`${s.name}-${index}`} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[#cbd5e1]">{s.name}</span>
                      </div>
                      <span className="font-semibold text-[#f0f0f0]">{s.value} merchants</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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

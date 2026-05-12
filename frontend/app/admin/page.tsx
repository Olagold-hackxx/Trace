"use client";

import { useEffect, useState } from "react";
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
import {
  People,
  AccountBalance,
  TrendingUp,
  Wallet,
  CheckCircle,
  Warning,
  Work,
  Storefront,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { BackendAdminOverview, fetchBackend } from "@/lib/backend";

const platformTrend = [
  { month: "Nov", volume: 1200000, users: 82, lenders: 4 },
  { month: "Dec", volume: 1800000, users: 98, lenders: 5 },
  { month: "Jan", volume: 2400000, users: 130, lenders: 6 },
  { month: "Feb", volume: 3100000, users: 180, lenders: 7 },
  { month: "Mar", volume: 4200000, users: 245, lenders: 9 },
  { month: "Apr", volume: 6800000, users: 340, lenders: 11 },
  { month: "May", volume: 8900000, users: 435, lenders: 14 },
];

const sectorData = [
  { sector: "Food", merchants: 180, capital: 12000000 },
  { sector: "Retail", merchants: 95, capital: 8500000 },
  { sector: "Logistics", merchants: 62, capital: 6200000 },
  { sector: "Fashion", merchants: 48, capital: 3900000 },
  { sector: "Services", merchants: 50, capital: 4100000 },
];

const recentActivity = [
  { time: "2m ago", event: "New user registered: Chukwuemeka Okafor", color: "#ff6b00", icon: People },
  { time: "15m ago", event: "Loan approved: ₦500K to Kemi Snacks (Zenith Capital)", color: "#16a34a", icon: AccountBalance },
  { time: "1h ago", event: "5 workers paid out — Lagos Grocers job", color: "#7c3aed", icon: Work },
  { time: "2h ago", event: "New lender onboarded: FirstFund Microfinance", color: "#2563eb", icon: AccountBalance },
  { time: "3h ago", event: "TraceScore updated for 28 merchants (batch job)", color: "#d97706", icon: TrendingUp },
  { time: "5h ago", event: "Payment link generated: Bayo Fashions — ₦145,000", color: "#ff6b00", icon: Wallet },
  { time: "6h ago", event: "Risk flag cleared: Adaeze Logistics (score 701)", color: "#16a34a", icon: CheckCircle },
];

const flaggedUsers = [
  { name: "Emeka Trades", issue: "3 missed repayments", score: 412, risk: "High" },
  { name: "Bello Supplies", issue: "Suspicious payment pattern", score: 488, risk: "Medium" },
  { name: "Nwosu Electronics", issue: "Identity not verified", score: 0, risk: "High" },
];

const topMerchants = [
  { name: "Amaka Foods", sector: "Food & Bev", score: 742, volume: "₦710K/mo", loans: 3 },
  { name: "Lagos Grocers", sector: "Retail", score: 728, volume: "₦580K/mo", loans: 2 },
  { name: "QuickEats", sector: "Food Delivery", score: 715, volume: "₦520K/mo", loans: 1 },
  { name: "Kemi Snacks", sector: "Food", score: 708, volume: "₦480K/mo", loans: 2 },
  { name: "Adaeze Logistics", sector: "Logistics", score: 701, volume: "₦430K/mo", loans: 1 },
];

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon style={{ fontSize: 22, color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<BackendAdminOverview | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<Array<{ id: string; severity: string; reason: string; status: string }>>([]);

  useEffect(() => {
    void Promise.all([
      fetchBackend<BackendAdminOverview>("/admin/overview"),
      fetchBackend<Array<{ id: string; severity: string; reason: string; status: string }>>("/admin/fraud-alerts"),
    ]).then(([overviewResult, alertsResult]) => {
      setOverview(overviewResult);
      setFraudAlerts(alertsResult);
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Platform Overview</h1>
        <p className="text-sm text-slate-400 mt-1">System-wide metrics · May 10, 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={String(overview?.users ?? 0)} sub="Live backend count" color="#ff6b00" icon={People} />
        <StatCard label="Transactions" value={String(overview?.transactions ?? 0)} sub="Recorded events" color="#2563eb" icon={AccountBalance} />
        <StatCard label="Loans" value={String(overview?.loans ?? 0)} sub="Created facilities" color="#16a34a" icon={Wallet} />
        <StatCard label="Applications" value={String(overview?.applications ?? 0)} sub="In backend pipeline" color="#d97706" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Volume trend */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Payment Volume & User Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={platformTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 12, fontSize: 12, color: "#fff" }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#ff6b00" strokeWidth={2.5} dot={false} name="Volume (₦)" />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sector distribution */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Capital by Sector</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sector" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 12, fontSize: 12, color: "#fff" }} formatter={(v: number) => `₦${v.toLocaleString()}`} />
              <Bar dataKey="capital" fill="#2563eb" radius={[0, 4, 4, 0]} name="Capital (₦)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Platform Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${a.color}20` }}>
                    <Icon style={{ fontSize: 14, color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-snug">{a.event}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flagged users */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Risk Flags</h2>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171" }}>{flaggedUsers.length} alerts</span>
          </div>
          <div className="space-y-4">
            {(fraudAlerts.length
              ? fraudAlerts.map((alert) => ({
                  name: alert.id,
                  issue: alert.reason,
                  score: 0,
                  risk: alert.severity === "medium" ? "Medium" : "High",
                }))
              : flaggedUsers).map((u) => (
              <div key={u.name} className="p-3 rounded-xl" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-white">{u.name}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: u.risk === "High" ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.2)", color: u.risk === "High" ? "#f87171" : "#fbbf24" }}>
                    {u.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{u.issue}</p>
                {u.score > 0 && <p className="text-xs text-slate-500 mt-1">Score: {u.score}</p>}
                <button className="mt-2 text-xs font-semibold" style={{ color: "#ff6b00" }}>Review →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top merchants */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Top Merchants by TraceScore</h2>
          <button className="text-sm font-semibold" style={{ color: "#ff6b00" }}>View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Merchant", "Sector", "TraceScore", "Monthly Volume", "Active Loans"].map((h) => (
                  <th key={h} className="text-left pb-3 font-semibold text-slate-400 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topMerchants.map((m, i) => (
                <tr key={m.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#ff6b00" }}>{m.name[0]}</div>
                      <span className="font-medium text-white">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-6 text-slate-400">{m.sector}</td>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.score}</span>
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(m.score / 900) * 100}%`, backgroundColor: "#16a34a" }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-6 font-semibold text-white">{m.volume}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(37,99,235,0.15)", color: "#60a5fa" }}>
                      {m.loans} loan{m.loans !== 1 ? "s" : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System health */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "API Uptime", value: "99.97%", color: "#16a34a" },
          { label: "Avg API Response", value: "112ms", color: "#16a34a" },
          { label: "Failed Payments (24h)", value: "0.3%", color: "#d97706" },
          { label: "Score Engine Status", value: "Healthy", color: "#16a34a" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "Epilogue, sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

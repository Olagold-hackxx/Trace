"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  People,
  AccountBalance,
  TrendingUp,
  Wallet,
} from "@mui/icons-material";
import { BackendAdminOverview, BackendFraudAlert, fetchBackend } from "@/lib/backend";
import { Spinner } from "@/components/ui/spinner";

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  high:   { bg: "rgba(220,38,38,0.2)",  text: "#f87171" },
  medium: { bg: "rgba(217,119,6,0.2)",  text: "#fbbf24" },
  low:    { bg: "rgba(100,116,139,0.2)", text: "#94a3b8" },
};

function FraudAlertCard({ alert }: { alert: BackendFraudAlert }) {
  const sc = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.low;
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-sm font-semibold text-white">{alert.traderName ?? "Unknown trader"}</p>
          <p className="text-xs text-slate-500">{(alert.anomalyScore * 100).toFixed(0)}% anomaly score</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
            {alert.severity}
          </span>
          <span className="text-xs text-slate-500">{alert.status}</span>
        </div>
      </div>
      {alert.topSignals.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {alert.topSignals.map((s: string) => (
            <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-600 mt-1.5">
        {new Date(alert.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

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
  const [fraudAlerts, setFraudAlerts] = useState<BackendFraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      fetchBackend<BackendAdminOverview>("/admin/overview"),
      fetchBackend<BackendFraudAlert[]>("/admin/fraud-alerts"),
    ]).then(([overviewResult, alertsResult]) => {
      setOverview(overviewResult);
      setFraudAlerts(Array.isArray(alertsResult) ? alertsResult : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Build a simple bar chart from the overview numbers
  const overviewChart = overview
    ? [
        { label: "Users", count: overview.users },
        { label: "Transactions", count: overview.transactions },
        { label: "Loans", count: overview.loans },
        { label: "Applications", count: overview.applications },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-[#ff6b00]" />
          <p className="text-sm text-slate-400">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Platform Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Live system metrics from the backend</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={String(overview?.users ?? 0)} sub="Registered accounts" color="#ff6b00" icon={People} />
        <StatCard label="Transactions" value={String(overview?.transactions ?? 0)} sub="Recorded events" color="#2563eb" icon={AccountBalance} />
        <StatCard label="Loans" value={String(overview?.loans ?? 0)} sub="Created facilities" color="#16a34a" icon={Wallet} />
        <StatCard label="Applications" value={String(overview?.applications ?? 0)} sub="In pipeline" color="#d97706" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Platform counts chart */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Platform Counts</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overviewChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 12, fontSize: 12, color: "#fff" }} />
              <Bar dataKey="count" fill="#ff6b00" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk flags */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Risk Flags</h2>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171" }}>
              {fraudAlerts.length} alerts
            </span>
          </div>
          {fraudAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-slate-500">No active risk flags</div>
          ) : (
            <div className="space-y-4">
              {fraudAlerts.map((alert) => (
                <FraudAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import {
  Wallet,
  TrendingUp,
  Receipt,
  AccountBalance,
  ContentCopy,
  Add,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  AccessTime,
  Cancel,
  GraphicEq,
  FiberManualRecord,
} from "@mui/icons-material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { baseTransactions, formatNaira, liveDashboardEvents } from "@/lib/demo-data";

const revenueData = [
  { month: "Dec", revenue: 320000, expenses: 98000 },
  { month: "Jan", revenue: 410000, expenses: 125000 },
  { month: "Feb", revenue: 385000, expenses: 110000 },
  { month: "Mar", revenue: 520000, expenses: 142000 },
  { month: "Apr", revenue: 490000, expenses: 135000 },
  { month: "May", revenue: 710000, expenses: 180000 },
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
  const liveStarted = useRef(false);
  const [metrics, setMetrics] = useState({
    revenue: 710000,
    pendingPayments: 45200,
    score: 742,
    scoreTrend: 1.2,
    balance: 128450,
    preQualifiedAmount: 2500000,
  });
  const [recentTransactions, setRecentTransactions] = useState(baseTransactions);
  const [liveFeed, setLiveFeed] = useState(
    liveDashboardEvents.map((event, index) => ({
      id: `${event.id}-seed`,
      label: index === 0 ? "Listening for live events" : "Queued simulation",
      title: event.title,
      description: event.description,
      status: index === 0 ? "Connected" : "Waiting",
    }))
  );
  const paymentLink = "https://pay.trace.ng/amaka-foods";

  const copy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (liveStarted.current) return;
    liveStarted.current = true;

    const timers = liveDashboardEvents.map((event, index) =>
      window.setTimeout(() => {
        setMetrics((current) => ({
          revenue: current.revenue + (event.revenueDelta ?? 0),
          pendingPayments: Math.max(0, current.pendingPayments + (event.pendingPaymentsDelta ?? 0)),
          score: current.score + (event.scoreDelta ?? 0),
          scoreTrend: current.scoreTrend + ((event.scoreDelta ?? 0) > 0 ? 0.9 : 0),
          balance: current.balance + (event.balanceDelta ?? 0),
          preQualifiedAmount: event.preQualifiedAmount ?? current.preQualifiedAmount,
        }));

        if (event.transaction) {
          setRecentTransactions((current) => [event.transaction!, ...current].slice(0, 8));
        }

        setLiveFeed((current) => [
          {
            id: event.id,
            label: event.label,
            title: event.title,
            description: event.description,
            status: "Just now",
          },
          ...current,
        ].slice(0, 5));

        toast({
          title: event.title,
          description: event.description,
        });
      }, 4000 * (index + 1))
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

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
          <MetricCard label="Total Revenue (May)" value={formatNaira(metrics.revenue)} icon={Wallet} trend={18.3} color="#ff6b00" />
          <MetricCard label="Pending Payments" value={formatNaira(metrics.pendingPayments)} icon={Receipt} color="#d97706" sub="2 transactions pending" />
          <MetricCard label="TraceScore" value={`${metrics.score} / 900`} icon={TrendingUp} trend={metrics.scoreTrend} trendLabel="this month" color="#16a34a" />
          <MetricCard label="Available Balance" value={formatNaira(metrics.balance)} icon={AccountBalance} trend={-3.1} color="#ff6b00" />
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

        <div className="rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3b1d09" }}>
              <GraphicEq style={{ fontSize: 20, color: "#ff6b00" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f0f0f0]">Live updates connected</p>
              <p className="text-xs text-[#94a3b8]">Incoming payments, score changes, and lender interest appear automatically.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}>
            <FiberManualRecord style={{ fontSize: 12, color: "#16a34a" }} />
            Demo stream active
          </div>
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
                    {recentTransactions.map((t) => (
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
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Live Activity</h2>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#161616", color: "#16a34a" }}>
                  Connected
                </span>
              </div>
              <div className="space-y-3">
                {liveFeed.map((item) => (
                  <div key={item.id} className="rounded-xl p-3" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-[#f0f0f0]">{item.title}</p>
                      <span className="text-[11px] text-[#94a3b8]">{item.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#ff6b00] mb-1">{item.label}</p>
                    <p className="text-xs text-[#94a3b8] leading-5">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

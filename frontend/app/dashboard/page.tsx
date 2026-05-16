"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useTraderData } from "@/hooks/use-trader-data";
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
  ReferenceLine,
} from "recharts";
import { BackendDailyForecast, BackendForecastResponse, BackendFraudAlert, BackendTransaction, buildBackendUrl, fetchBackend, formatDateLabel } from "@/lib/backend";
import { Spinner } from "@/components/ui/spinner";

function formatNaira(v: number) { return `₦${v.toLocaleString()}`; }

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
  const { user, virtualAccount, score, scoreHistory, summary, transactions, defaultPaymentLink, offers, loading } = useTraderData();
  const [copied, setCopied] = useState(false);
  const streamStarted = useRef(false);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    pendingPayments: 0,
    score: 0,
    scoreTrend: 0,
    balance: 0,
    preQualifiedAmount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Array<{ id: string; date: string; desc: string; type: string; amount: number; status: string }>>([]);
  const [liveFeed, setLiveFeed] = useState<Array<{ id: string; label: string; title: string; description: string; status: string }>>([]);
  const [fraudAlerts, setFraudAlerts] = useState<BackendFraudAlert[]>([]);
  const [forecastDays, setForecastDays] = useState<BackendDailyForecast[]>([]);
  const [dipWarning, setDipWarning] = useState<BackendForecastResponse["dip_warning"] | null>(null);
  const paymentLink = defaultPaymentLink?.url ?? "https://trace-nu-dusky.vercel.app/pay";
  const displayName = user?.fullName?.split(" ")[0] ?? "there";
  const businessName = user?.businessName ?? user?.fullName ?? "";

  useEffect(() => {
    // Score trend: compare latest snapshot to the oldest one we have
    let scoreTrend = 0;
    if (scoreHistory.length >= 2) {
      const latest = scoreHistory[0].score;
      const oldest = scoreHistory[scoreHistory.length - 1].score;
      scoreTrend = oldest > 0 ? Math.round(((latest - oldest) / oldest) * 1000) / 10 : 0;
    }

    setMetrics((current) => ({
      ...current,
      revenue: summary ? Math.round(summary.totalInflowKobo / 100) : current.revenue,
      balance: summary ? Math.round(summary.balanceKobo / 100) : current.balance,
      pendingPayments: transactions
        .filter((transaction) => transaction.status === "pending")
        .reduce((sum, transaction) => sum + Math.round(Number(transaction.amountKobo) / 100), 0),
      score: score?.score ?? current.score,
      scoreTrend,
      preQualifiedAmount:
        offers.length > 0 ? Math.round(Number(offers[0].amountKobo) / 100) : current.preQualifiedAmount,
    }));
  }, [offers, score?.score, scoreHistory, summary, transactions]);

  useEffect(() => {
    if (transactions.length === 0) return;

    setRecentTransactions(
      transactions.map((transaction) => ({
        id: transaction.id,
        date: formatDateLabel(transaction.occurredAt),
        desc: transaction.senderName ?? transaction.reference,
        type:
          transaction.type === "debit" || transaction.type === "loan_repayment"
            ? "Debit"
            : "Credit",
        amount: Math.round(Number(transaction.amountKobo) / 100),
        status:
          transaction.status === "success"
            ? "Success"
            : transaction.status === "failed"
              ? "Failed"
              : "Pending",
      }))
    );
  }, [transactions]);

  // Fetch existing open fraud alerts on mount
  useEffect(() => {
    fetchBackend<BackendFraudAlert[]>("/fraud-alerts")
      .then((data) => setFraudAlerts(Array.isArray(data) ? data.filter((a) => a.isAnomalous && a.status === "open") : []))
      .catch(() => { /* non-critical */ });
  }, [user?.id]);

  const copy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!user?.id || streamStarted.current) return;
    streamStarted.current = true;

    const eventSource = new EventSource(buildBackendUrl(`/stream/user/${user.id}`), {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          type: string;
          payload: Record<string, unknown>;
          createdAt: string;
        };

        if (parsed.type === "stream.connected") {
          setLiveFeed((current) => [
            {
              id: "stream.connected",
              label: "Realtime connected",
              title: "Live updates online",
              description: "Incoming payments, score changes, and fraud alerts will appear here.",
              status: "Just now",
            },
            ...current,
          ].slice(0, 5));
          return;
        }

        if (parsed.type === "transaction.created") {
          const amountKobo = Number(parsed.payload.amountKobo ?? 0);
          const reference = String(parsed.payload.reference ?? "Live transaction");
          const status = String(parsed.payload.status ?? "pending");

          setMetrics((current) => ({
            ...current,
            pendingPayments: status === "pending"
              ? current.pendingPayments + Math.round(amountKobo / 100)
              : current.pendingPayments,
          }));

          setRecentTransactions((current) => [
            {
              id: reference,
              date: formatDateLabel(parsed.createdAt),
              desc: reference,
              type: "Credit",
              amount: Math.round(amountKobo / 100),
              status: status === "success" ? "Success" : status === "failed" ? "Failed" : "Pending",
            },
            ...current,
          ].slice(0, 8));
        }

        if (parsed.type === "loan.disbursed") {
          const amountKobo = Number(parsed.payload.amountKobo ?? 0);
          setMetrics((current) => ({
            ...current,
            preQualifiedAmount: Math.round(amountKobo / 100),
          }));
        }

        if (parsed.type === "fraud.alert") {
          const penalty  = Number(parsed.payload.fraudPenalty ?? 0);
          const severity = String(parsed.payload.severity ?? "flagged");
          const signals  = Array.isArray(parsed.payload.topSignals)
            ? (parsed.payload.topSignals as string[]).map((s: string) => s.replace(/_/g, " ")).join(", ")
            : "";
          const penaltyPts = Math.round(penalty * 100);

          toast({
            title: `⚠ Fraud alert — ${severity}`,
            description: [
              signals ? `Signals: ${signals}.` : null,
              penaltyPts > 0
                ? `A temporary –${penaltyPts}-point penalty has been applied to your TraceScore pending review.`
                : "A soft penalty has been applied to your TraceScore pending review.",
            ].filter(Boolean).join(" "),
          });

          // Push into the persistent banner state
          setFraudAlerts((prev: BackendFraudAlert[]) => [
            {
              id: String(parsed.payload.transactionId ?? Date.now()),
              transactionId: String(parsed.payload.transactionId ?? ""),
              userId: user?.id ?? "",
              anomalyScore: Number(parsed.payload.anomalyScore ?? 0),
              isAnomalous: true,
              topSignals: Array.isArray(parsed.payload.topSignals) ? (parsed.payload.topSignals as string[]) : [],
              fraudPenalty: penalty,
              severity: severity as BackendFraudAlert["severity"],
              status: "open",
              createdAt: parsed.createdAt,
            },
            ...prev,
          ]);
        }

        setLiveFeed((current) => [
          {
            id: `${parsed.type}-${parsed.createdAt}`,
            label: parsed.type.replace(/\./g, " "),
            title: parsed.type === "transaction.created" ? "New live transaction" : parsed.type,
            description:
              parsed.type === "transaction.created"
                ? `Reference ${String(parsed.payload.reference ?? "n/a")} was recorded.`
                : String(parsed.payload.message ?? JSON.stringify(parsed.payload)),
            status: "Just now",
          },
          ...current,
        ].slice(0, 5));
      } catch {
        // Ignore malformed events and keep the stream alive.
      }
    };

    eventSource.onerror = () => {
      setLiveFeed((current) => [
        {
          id: "stream.error",
          label: "Realtime paused",
          title: "Live connection dropped",
          description: "The dashboard stream disconnected. Refresh to reconnect.",
          status: "Now",
        },
        ...current,
      ].slice(0, 5));
    };

    return () => {
      eventSource.close();
      streamStarted.current = false;
    };
  }, [user?.id]);

  // Pending payment count for sub-label
  const pendingCount = transactions.filter((t: BackendTransaction) => t.status === "pending").length;
  const pendingSub = pendingCount > 0 ? `${pendingCount} transaction${pendingCount === 1 ? "" : "s"} pending` : "All payments settled";

  // Revenue trend: compare this month vs last month using available transactions
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();
  const lastMonthNum  = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  for (const t of transactions) {
    if (t.type === "debit" || t.type === "loan_repayment") continue;
    const d = new Date(t.occurredAt ?? t.createdAt ?? "");
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      revenueThisMonth += Math.round(Number(t.amountKobo) / 100);
    } else if (d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYear) {
      revenueLastMonth += Math.round(Number(t.amountKobo) / 100);
    }
  }
  const revenueTrend = revenueLastMonth > 0
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 1000) / 10
    : undefined;

  // Fetch forecast on mount
  useEffect(() => {
    fetchBackend<BackendForecastResponse>("/score/forecast?horizon_days=30")
      .then((res) => {
        setForecastDays(res.daily ?? []);
        setDipWarning(res.dip_warning ?? null);
      })
      .catch(() => { /* non-critical — chart still shows historical */ });
  }, [user?.id]);

  // Build daily chart data: historical actuals + forecast always merged
  const chartData = (() => {
    const byDay: Record<string, { cashIn: number; cashOut: number }> = {};
    for (const t of transactions) {
      const day = (t.occurredAt ?? t.createdAt ?? "").slice(0, 10);
      if (!day) continue;
      if (!byDay[day]) byDay[day] = { cashIn: 0, cashOut: 0 };
      const amt = Math.round(Number(t.amountKobo) / 100);
      if (t.type === "debit" || t.type === "loan_repayment") byDay[day].cashOut += amt;
      else if (t.status === "success") byDay[day].cashIn += amt;
    }

    const historicalPoints = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, vals]) => ({
        day,
        label: new Date(day).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
        cashIn: vals.cashIn,
        cashOut: vals.cashOut,
        forecast: null as number | null,
        forecastLow: null as number | null,
        forecastHigh: null as number | null,
      }));

    if (forecastDays.length === 0) return historicalPoints;

    const existingDays = new Set(historicalPoints.map((p) => p.day));
    const forecastPoints = forecastDays
      .filter((f) => !existingDays.has(f.date))
      .map((f) => ({
        day: f.date,
        label: new Date(f.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
        cashIn: null as number | null,
        cashOut: null as number | null,
        forecast: Math.round(f.predicted_inflow_kobo / 100),
        forecastLow: Math.round(f.lower_bound_kobo / 100),
        forecastHigh: Math.round(f.upper_bound_kobo / 100),
      }));

    return [...historicalPoints, ...forecastPoints];
  })();

  const todayLabel = new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric" });

  // Fraud banner pre-computations — avoiding reduce callbacks so tsc doesn't need node_modules to infer types
  const openAlerts = fraudAlerts.filter((fa: BackendFraudAlert) => fa.isAnomalous && fa.status === "open");
  let worstAlert: BackendFraudAlert | null = null;
  let totalPenalty = 0;
  for (const fa of openAlerts) {
    totalPenalty += fa.fraudPenalty ?? 0;
    if (!worstAlert || (fa.fraudPenalty ?? 0) > (worstAlert.fraudPenalty ?? 0)) worstAlert = fa;
  }
  const adjustedScore = totalPenalty > 0 ? Math.max(300, Math.round(metrics.score * (1 - totalPenalty))) : metrics.score;
  const penaltyPts = metrics.score - adjustedScore;
  const scoreLabel = penaltyPts > 0 ? `${adjustedScore} / 850 (–${penaltyPts} pts)` : `${metrics.score} / 850`;
  const scoreColor = penaltyPts > 0 ? "#f59e0b" : "#16a34a";
  const alertSignals = worstAlert ? worstAlert.topSignals.slice(0, 3).map((s: string) => s.replace(/_/g, " ")).join(" · ") : "";
  const alertSeverityColor = worstAlert?.severity === "high" ? "#ef4444" : worstAlert?.severity === "medium" ? "#f59e0b" : "#64748b";

  if (loading) {
    return (
      <AppShell role="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading your dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="user">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Good morning, {displayName} 👋
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1">{businessName}</p>
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

        {/* Fraud alert banner — shown when there is at least one open anomaly */}
        {worstAlert && (
          <div className="rounded-2xl px-4 py-3.5 mb-5 flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: `1px solid ${alertSeverityColor}40` }}>
            <span style={{ fontSize: 20, marginTop: 1 }}>⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: alertSeverityColor }}>
                Anomaly detected on your account
                {penaltyPts > 0 && <span className="ml-2 font-normal text-slate-400">— temporary –{penaltyPts}-point TraceScore penalty applied</span>}
              </p>
              {alertSignals && <p className="text-xs text-slate-500 mt-0.5 truncate">Signals: {alertSignals}</p>}
              <p className="text-xs text-slate-600 mt-1">
                This is a soft penalty that will be lifted once the transaction is reviewed and cleared.
                {openAlerts.length > 1 && ` (${openAlerts.length} open alerts)`}
              </p>
            </div>
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Revenue" value={formatNaira(metrics.revenue)} icon={Wallet} trend={revenueTrend} trendLabel="vs last month" color="#ff6b00" />
          <MetricCard label="Pending Payments" value={formatNaira(metrics.pendingPayments)} icon={Receipt} color="#d97706" sub={pendingSub} />
          <MetricCard label="TraceScore" value={scoreLabel} icon={TrendingUp} trend={metrics.scoreTrend !== 0 ? metrics.scoreTrend : undefined} trendLabel="vs first recorded" color={scoreColor} />
          <MetricCard label="Available Balance" value={formatNaira(metrics.balance)} icon={AccountBalance} color="#ff6b00" />
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
          {virtualAccount && (
            <div className="hidden lg:block text-xs text-[#94a3b8]">
              Virtual account: {virtualAccount.accountNumber} · {virtualAccount.bankName}
            </div>
          )}
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
            Live
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cash Flow chart */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Cash Flow</h2>
                <div className="flex gap-3 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#ff6b00" }} />Actual</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#3b82f6" }} />Forecast</span>
                </div>
              </div>

              {/* Dip warning banner */}
              {dipWarning && (
                <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid #ef444430" }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-[#ef4444]">Income dip detected · {dipWarning.severity} severity</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      {new Date(dipWarning.dip_start_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} – {new Date(dipWarning.dip_end_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} · Expected gap: ₦{Math.round(dipWarning.expected_gap_kobo / 100).toLocaleString()} · Suggested loan: ₦{Math.round(dipWarning.suggested_loan_kobo / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[240px] text-sm text-[#64748b]">No transaction data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cashInGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ff6b00" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }}
                      formatter={(v: number, name: string) => {
                        const labels: Record<string, string> = { cashIn: "Actual inflow", cashOut: "Outflow", forecast: "Forecast", forecastLow: "Lower bound", forecastHigh: "Upper bound" };
                        return [`₦${v.toLocaleString()}`, labels[name] ?? name];
                      }}
                      labelFormatter={(label: string) => label}
                    />
                    <ReferenceLine x={todayLabel} stroke="#475569" strokeDasharray="4 2" label={{ value: "Today", fill: "#475569", fontSize: 10, position: "insideTopRight" }} />
                    <Area type="monotone" dataKey="forecastHigh" stroke="none" fill="url(#forecastBandGrad)" connectNulls dot={false} legendType="none" />
                    <Area type="monotone" dataKey="forecastLow" stroke="none" fill="#0d0d0d" connectNulls dot={false} legendType="none" />
                    <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" fill="url(#forecastGrad)" connectNulls dot={false} />
                    <Area type="monotone" dataKey="cashIn" stroke="#ff6b00" strokeWidth={2.5} fill="url(#cashInGrad)" connectNulls={false} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Transactions */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Recent Transactions</h2>
                <Link href="/payments" className="text-sm font-semibold" style={{ color: "#ff6b00" }}>View all →</Link>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-[#64748b]">No transactions yet</div>
              ) : (
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
              )}
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

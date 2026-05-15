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
} from "recharts";
import { buildBackendUrl, formatDateLabel } from "@/lib/backend";
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
  const { user, virtualAccount, score, summary, transactions, defaultPaymentLink, offers, loading } = useTraderData();
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
  const paymentLink = defaultPaymentLink?.url ?? "https://trace-nu-dusky.vercel.app/pay";
  const displayName = user?.fullName?.split(" ")[0] ?? "there";
  const businessName = user?.businessName ?? user?.fullName ?? "";

  useEffect(() => {
    setMetrics((current) => ({
      ...current,
      revenue: summary ? Math.round(summary.totalInflowKobo / 100) : current.revenue,
      balance: summary ? Math.round(summary.balanceKobo / 100) : current.balance,
      pendingPayments: transactions
        .filter((transaction) => transaction.status === "pending")
        .reduce((sum, transaction) => sum + Math.round(Number(transaction.amountKobo) / 100), 0),
      score: score?.score ?? current.score,
      preQualifiedAmount:
        offers.length > 0 ? Math.round(Number(offers[0].amountKobo) / 100) : current.preQualifiedAmount,
    }));
  }, [offers, score?.score, summary, transactions]);

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

  const copy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!user?.id || streamStarted.current) return;
    streamStarted.current = true;

    const eventSource = new EventSource(buildBackendUrl(`/api/v1/stream/user/${user.id}`), {
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
          toast({
            title: "Fraud alert",
            description: String(parsed.payload.message ?? "Anomalous activity detected."),
          });
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

  // Build revenue chart from real transactions
  const revenueData = (() => {
    if (transactions.length === 0) return [];
    const byMonth: Record<string, { revenue: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const month = new Date(t.occurredAt ?? t.createdAt ?? Date.now()).toLocaleDateString("en-NG", { month: "short" });
      if (!byMonth[month]) byMonth[month] = { revenue: 0, expenses: 0 };
      const amt = Math.round(Number(t.amountKobo) / 100);
      if (t.type === "debit" || t.type === "loan_repayment") byMonth[month].expenses += amt;
      else if (t.status === "success") byMonth[month].revenue += amt;
    });
    return Object.entries(byMonth).map(([month, vals]) => ({ month, ...vals }));
  })();

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
            {/* Revenue chart */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Revenue Overview</h2>
                <div className="flex gap-4 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#ff6b00" }} />Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#334155" }} />Expenses</span>
                </div>
              </div>
              {revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-sm text-[#64748b]">No transaction data yet</div>
              ) : (
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

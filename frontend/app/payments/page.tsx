"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { useTraderData } from "@/hooks/use-trader-data";
import {
  ContentCopy, CheckCircle, Wallet, TrendingUp, AccessTime, Cancel,
  Add, ArrowUpward, ArrowDownward, LinkOutlined, QrCode, Download,
} from "@mui/icons-material";
import {
  formatDateLabel,
  formatNairaFromKobo,
  BACKEND_API_BASE_URL,
} from "@/lib/backend";

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Success: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  Pending: { color: "#d97706", bg: "#fef3c7", icon: AccessTime },
  Failed: { color: "#dc2626", bg: "#fee2e2", icon: Cancel },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusConfig[status] || statusConfig.Pending;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
      <Icon style={{ fontSize: 12 }} />{status}
    </span>
  );
}

function qrUrl(slug: string) {
  const base = (BACKEND_API_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/payments/qr/${slug}`;
}

export default function PaymentsPage() {
  const { user, summary, transactions, paymentLinks, refresh } = useTraderData();
  const [tab, setTab] = useState<"transactions" | "links">("transactions");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestLink, setRequestLink] = useState("");
  const [requestQr, setRequestQr] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const mappedTransactions = transactions.map((t) => ({
    id: t.id,
    date: formatDateLabel(t.occurredAt),
    time: new Date(t.occurredAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
    desc: t.senderName ?? t.reference,
    ref: t.reference,
    type: t.type === "debit" || t.type === "loan_repayment" ? "Debit" : "Credit",
    amount: Math.round(Number(t.amountKobo) / 100),
    status: t.status === "success" ? "Success" : t.status === "failed" ? "Failed" : "Pending",
    method: t.type === "payment_link" ? "Payment link" : "Bank transfer",
  }));

  const mappedPaymentLinks = paymentLinks.map((link) => ({
    id: link.id,
    name: link.name,
    slug: link.slug,
    url: link.url.replace(/^https?:\/\//, ""),
    total: link.amountKobo && Number(link.amountKobo) > 0 ? formatNairaFromKobo(link.amountKobo) : "Flexible",
    created: formatDateLabel(link.createdAt),
    active: link.active,
  }));

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text.startsWith("http") ? text : "https://" + text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (imgUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = filename;
    a.click();
  };

  const handleGenerateLink = async () => {
    if (!requestAmount.trim()) return;
    setRequestLoading(true);
    setRequestError("");
    setRequestLink("");
    setRequestQr(null);

    try {
      const base = (BACKEND_API_BASE_URL ?? "").replace(/\/$/, "");
      const res = await fetch(`${base}/payments/qr/one-time`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountKobo: String(Number(requestAmount) * 100),
          description: requestDesc || "Trace payment request",
          email: user?.email ?? "customer@trace.app",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Could not generate payment QR");
      }

      const checkoutUrl = res.headers.get("X-Checkout-Url") ?? "";
      setRequestLink(checkoutUrl);
      const blob = await res.blob();
      setRequestQr(URL.createObjectURL(blob));
      void refresh();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not generate payment QR");
    } finally {
      setRequestLoading(false);
    }
  };

  const openRequestForm = () => {
    setShowRequestForm(true);
    setRequestLink("");
    setRequestQr(null);
    setRequestAmount("");
    setRequestDesc("");
    setRequestError("");
  };

  const closeForm = () => {
    setShowRequestForm(false);
  };

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Payments</h1>
            <p className="text-sm text-[#94a3b8] mt-1">Collect, track, and manage all your transactions</p>
          </div>
          <button
            onClick={openRequestForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#ff6b00" }}
          >
            <Add style={{ fontSize: 18 }} />Request Payment
          </button>
        </div>

        {/* ── FORM: simple inputs only ── */}
        {showRequestForm && (
          <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-base font-bold text-[#f0f0f0] mb-1" style={{ fontFamily: "Epilogue, sans-serif" }}>Request a Payment</h2>
            <p className="text-xs text-[#94a3b8] mb-5">Enter the amount — we&apos;ll generate a payment link and QR code.</p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                  style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Market sale, Catering deposit"
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                  style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                />
              </div>
            </div>

            {requestError && <p className="text-xs text-[#f87171] mb-3">{requestError}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleGenerateLink}
                disabled={requestLoading || !requestAmount}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#ff6b00" }}
              >
                <QrCode style={{ fontSize: 16 }} />
                {requestLoading ? "Generating..." : requestQr ? "Regenerate" : "Generate Link & QR"}
              </button>
              <button
                onClick={closeForm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]"
                style={{ borderColor: "#1e1e1e" }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT: link card LEFT + QR RIGHT ── */}
        {requestLink && requestQr && (
          <div className="grid lg:grid-cols-[1fr_260px] gap-4 mb-6">

            {/* Link card — styled like payment links tab */}
            <div
              className="rounded-2xl p-5 flex flex-col justify-between gap-4"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ backgroundColor: "#161616" }}>
                    <LinkOutlined style={{ fontSize: 20, color: "#ff6b00" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-[#f0f0f0] text-sm">
                        {requestDesc || "Payment Request"}
                      </p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8]">
                      {user?.businessName ?? user?.fullName ?? "Trace"} · One-time · ₦{Number(requestAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-none" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>
                  ₦{Number(requestAmount).toLocaleString()}
                </span>
              </div>

              {/* The actual URL */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-xs font-mono text-[#cbd5e1] truncate flex-1">
                  {requestLink.replace(/^https?:\/\//, "")}
                </p>
                <button
                  onClick={() => copy(requestLink, "result-link")}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:bg-[#2a2a2a] flex-none whitespace-nowrap"
                  style={{ borderColor: "#2a2a2a", color: "#f0f0f0" }}
                >
                  <ContentCopy style={{ fontSize: 13 }} />
                  {copiedId === "result-link" ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <p className="text-xs text-[#64748b]">
                Share this link or the QR code with your customer. Valid for a single payment of ₦{Number(requestAmount).toLocaleString()}.
              </p>
            </div>

            {/* QR card */}
            <div
              className="rounded-2xl p-5 flex flex-col items-center gap-3"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-sm font-semibold text-[#f0f0f0]">Scan to Pay</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>One-time</span>
              </div>

              <div className="rounded-xl p-3 w-full flex items-center justify-center" style={{ backgroundColor: "#ffffff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={requestQr}
                  alt="Payment QR code"
                  style={{ width: 170, height: 170, objectFit: "contain", display: "block" }}
                />
              </div>

              <p className="text-sm font-bold text-[#f0f0f0]">₦{Number(requestAmount).toLocaleString()}</p>

              <button
                onClick={() => handleDownloadQr(requestQr, `trace-pay-${requestAmount}.png`)}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-all hover:bg-[#161616] w-full justify-center"
                style={{ borderColor: "#1e1e1e", color: "#94a3b8" }}
              >
                <Download style={{ fontSize: 14 }} /> Download QR
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state: no form open and nothing generated yet ── */}
        {!showRequestForm && !requestLink && (
          <div
            className="rounded-2xl p-8 mb-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#161616]"
            style={{ backgroundColor: "#111111", border: "2px dashed #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
            onClick={openRequestForm}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#161616" }}>
              <LinkOutlined style={{ fontSize: 22, color: "#ff6b00" }} />
            </div>
            <p className="text-sm font-semibold text-[#f0f0f0] mb-1">Create a payment link</p>
            <p className="text-xs text-[#64748b]">Generate a QR code and checkout link to collect payment from a customer.</p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Inflow" value={formatNairaFromKobo(summary?.totalInflowKobo)} icon={Wallet} color="#ff6b00" />
          <MetricCard label="Available Balance" value={formatNairaFromKobo(summary?.balanceKobo)} icon={TrendingUp} color="#ff6b00" />
          <MetricCard
            label="Success Rate"
            value={`${mappedTransactions.length === 0 ? 0 : Math.round((mappedTransactions.filter((t) => t.status === "Success").length / mappedTransactions.length) * 100)}%`}
            sub={`${mappedTransactions.filter((t) => t.status === "Failed").length} failed records`}
            color="#16a34a"
          />
          <MetricCard
            label="Pending"
            value={`₦${mappedTransactions.filter((t) => t.status === "Pending").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`}
            icon={AccessTime}
            color="#d97706"
            sub={`${mappedTransactions.filter((t) => t.status === "Pending").length} transactions`}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <button
            onClick={() => setTab("transactions")}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "transactions" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}
          >
            Transactions ({mappedTransactions.length})
          </button>
          <button
            onClick={() => setTab("links")}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "links" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}
          >
            Payment Links ({mappedPaymentLinks.length})
          </button>
        </div>

        {/* Transactions */}
        {tab === "transactions" && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            {mappedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#161616" }}>
                  <TrendingUp style={{ fontSize: 22, color: "#94a3b8" }} />
                </div>
                <p className="text-sm font-semibold text-[#f0f0f0] mb-1">No transactions yet</p>
                <p className="text-xs text-[#64748b]">Your transactions will appear here once you start receiving payments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                      {["Date & Time", "Description", "Reference", "Method", "Type", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-[#f0f0f0]">{t.date}</p>
                          <p className="text-xs text-[#94a3b8]">{t.time}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#f0f0f0] max-w-48 truncate">{t.desc}</td>
                        <td className="px-5 py-4 font-mono text-xs text-[#94a3b8]">{t.ref}</td>
                        <td className="px-5 py-4 text-xs text-[#cbd5e1]">{t.method}</td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                            {t.type === "Credit" ? <ArrowDownward style={{ fontSize: 14 }} /> : <ArrowUpward style={{ fontSize: 14 }} />}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold whitespace-nowrap" style={{ color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                          {t.type === "Credit" ? "+" : "-"}₦{t.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payment Links */}
        {tab === "links" && (
          <div className="space-y-4">
            {mappedPaymentLinks.length === 0 ? (
              <div
                className="rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#161616]"
                style={{ backgroundColor: "#111111", border: "2px dashed #1e1e1e" }}
                onClick={openRequestForm}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#161616" }}>
                  <LinkOutlined style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-sm font-semibold text-[#f0f0f0] mb-1">No payment links yet</p>
                <p className="text-xs text-[#64748b]">Click to generate your first payment link.</p>
              </div>
            ) : (
              mappedPaymentLinks.map((link) => (
                <div
                  key={link.id}
                  className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ backgroundColor: "#161616" }}>
                      <LinkOutlined style={{ fontSize: 20, color: link.active ? "#ff6b00" : "#94a3b8" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#f0f0f0] text-sm">{link.name}</p>
                        {link.active
                          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>Active</span>
                          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#161616", color: "#94a3b8" }}>Inactive</span>}
                      </div>
                      <p className="text-xs font-mono text-[#cbd5e1]">{link.url}</p>
                      <p className="text-xs text-[#94a3b8] mt-1">Created {link.created} · {link.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      onClick={() => handleDownloadQr(qrUrl(link.slug), `trace-pay-${link.slug}.png`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[#161616]"
                      style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}
                    >
                      <QrCode style={{ fontSize: 14 }} /> QR
                    </button>
                    <button
                      onClick={() => copy(link.url, link.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[#161616]"
                      style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}
                    >
                      <ContentCopy style={{ fontSize: 14 }} />
                      {copiedId === link.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              onClick={openRequestForm}
              className="w-full py-4 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:bg-[#161616]"
              style={{ borderColor: "#1e1e1e", color: "#94a3b8" }}
            >
              <Add style={{ fontSize: 18, verticalAlign: "middle", marginRight: 8 }} />
              Generate New Payment Link
            </button>
          </div>
        )}

      </div>
    </AppShell>
  );
}

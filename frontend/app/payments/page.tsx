"use client";

import Image from "next/image";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import {
  ContentCopy, CheckCircle, Wallet, TrendingUp, AccessTime, Cancel,
  Add, ArrowUpward, ArrowDownward, LinkOutlined,
} from "@mui/icons-material";

const transactions = [
  { id: "TRX-001", date: "May 10", time: "09:14", desc: "Market sale — Yaba table 4", ref: "PAY/2026/00412", type: "Credit", amount: 45000, status: "Success", method: "Payment link" },
  { id: "TRX-002", date: "May 10", time: "08:32", desc: "Supplier payment — Okafor Farms", ref: "TRF/2026/00311", type: "Debit", amount: 28000, status: "Success", method: "Bank transfer" },
  { id: "TRX-003", date: "May 09", time: "14:55", desc: "Catering — Okeke Wedding", ref: "PAY/2026/00399", type: "Credit", amount: 120000, status: "Success", method: "Payment link" },
  { id: "TRX-004", date: "May 09", time: "11:20", desc: "Rent — Market stall fee", ref: "TRF/2026/00288", type: "Debit", amount: 15000, status: "Success", method: "Bank transfer" },
  { id: "TRX-005", date: "May 09", time: "09:05", desc: "Bulk food sale — Ikeja buyer", ref: "PAY/2026/00381", type: "Credit", amount: 67500, status: "Success", method: "Payment link" },
  { id: "TRX-006", date: "May 08", time: "16:41", desc: "Payment link — Ngozi Adeyemi", ref: "PAY/2026/00366", type: "Credit", amount: 35000, status: "Pending", method: "Payment link" },
  { id: "TRX-007", date: "May 08", time: "14:00", desc: "Staff wages — May week 1", ref: "TRF/2026/00355", type: "Debit", amount: 48000, status: "Success", method: "Bank transfer" },
  { id: "TRX-008", date: "May 07", time: "10:30", desc: "Event catering — UNILAG dept", ref: "PAY/2026/00340", type: "Credit", amount: 95000, status: "Success", method: "Payment link" },
  { id: "TRX-009", date: "May 07", time: "09:15", desc: "Equipment purchase", ref: "TRF/2026/00328", type: "Debit", amount: 32000, status: "Success", method: "Bank transfer" },
  { id: "TRX-010", date: "May 06", time: "13:45", desc: "Food sale — Surulere market", ref: "PAY/2026/00312", type: "Credit", amount: 52000, status: "Success", method: "Payment link" },
  { id: "TRX-011", date: "May 06", time: "11:00", desc: "Payment link — Failed attempt", ref: "PAY/2026/00299", type: "Credit", amount: 10000, status: "Failed", method: "Payment link" },
  { id: "TRX-012", date: "May 05", time: "15:30", desc: "Supplier restock — Groceries", ref: "TRF/2026/00285", type: "Debit", amount: 78000, status: "Success", method: "Bank transfer" },
];

const paymentLinks = [
  { id: "L1", name: "Amaka Foods — General", url: "trace.co/pay/amaka-foods", uses: 48, total: "₦1,240,000", created: "Mar 1, 2026", active: true },
  { id: "L2", name: "Catering Deposits", url: "trace.co/pay/amaka-catering", uses: 12, total: "₦380,000", created: "Apr 5, 2026", active: true },
  { id: "L3", name: "Market Stall — May", url: "trace.co/pay/amaka-may", uses: 7, total: "₦132,000", created: "May 1, 2026", active: true },
  { id: "L4", name: "Event: Okeke Wedding", url: "trace.co/pay/okeke-wed", uses: 1, total: "₦120,000", created: "May 3, 2026", active: false },
];

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

export default function PaymentsPage() {
  const [tab, setTab] = useState<"transactions" | "links">("transactions");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestDesc, setRequestDesc] = useState("");

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText("https://" + text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mainLink = "trace.co/pay/amaka-foods";

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
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#ff6b00" }}
          >
            <Add style={{ fontSize: 18 }} />Request Payment
          </button>
        </div>

        {/* Request Payment Form */}
        {showRequestForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Request a Payment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Amount (₦)</label>
                <input type="number" placeholder="e.g. 50000" value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full px-3 py-3 text-sm rounded-xl border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Description</label>
                <input type="text" placeholder="e.g. Market sale, Catering deposit" value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)}
                  className="w-full px-3 py-3 text-sm rounded-xl border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }} />
              </div>
            </div>
            {requestAmount && (
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-xs text-[#94a3b8] mb-1">Generated payment link</p>
                <p className="text-sm font-mono font-semibold text-[#f0f0f0]">
                  trace.co/pay/amaka-foods?amount={requestAmount}{requestDesc ? `&desc=${encodeURIComponent(requestDesc)}` : ""}
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#ff6b00" }}>
                Generate Link
              </button>
              <button onClick={() => setShowRequestForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]" style={{ borderColor: "#1e1e1e" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Volume" value="₦2,847,500" icon={Wallet} trend={18.3} color="#ff6b00" />
          <MetricCard label="This Month" value="₦710,000" icon={TrendingUp} trend={12.1} color="#ff6b00" />
          <MetricCard label="Success Rate" value="98.7%" sub="2 failed in 30 days" color="#16a34a" />
          <MetricCard label="Pending" value="₦45,200" icon={AccessTime} color="#d97706" sub="2 transactions" />
        </div>

        {/* Payment link + QR */}
        <div className="grid lg:grid-cols-[minmax(0,1.7fr)_320px] gap-6 mb-6">
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <div className="flex items-center gap-2 flex-none">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#161616" }}>
                <LinkOutlined style={{ fontSize: 20, color: "#ff6b00" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f0f0f0]">Your Trace Pay Link</p>
                <p className="text-xs text-[#94a3b8]">Share to accept payments instantly</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 w-full">
              <div className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm text-[#f0f0f0]" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                {mainLink}
              </div>
              <button onClick={() => copy(mainLink, "main")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] whitespace-nowrap"
                style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}>
                <ContentCopy style={{ fontSize: 16 }} />
                {copiedId === "main" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-[#f0f0f0]">Scan to Pay</p>
                <p className="text-xs text-[#94a3b8] mt-1">Customers can scan this QR code at your stall.</p>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>
                Live
              </div>
            </div>

            <div className="rounded-2xl p-4 flex items-center justify-center" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <Image
                src="/trace-pay-qr-demo.svg"
                alt="Trace payment QR code"
                width={220}
                height={220}
                className="w-full max-w-[220px] h-auto"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#94a3b8]">
              <span>Linked to `{mainLink}`</span>
              <button
                onClick={() => copy(mainLink, "qr")}
                className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[#161616]"
                style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}
              >
                {copiedId === "qr" ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <button onClick={() => setTab("transactions")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "transactions" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}>
            Transactions ({transactions.length})
          </button>
          <button onClick={() => setTab("links")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "links" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}>
            Payment Links ({paymentLinks.length})
          </button>
        </div>

        {/* Transactions */}
        {tab === "transactions" && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
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
                  {transactions.map((t) => (
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
          </div>
        )}

        {/* Payment Links */}
        {tab === "links" && (
          <div className="space-y-4">
            {paymentLinks.map((link) => (
              <div key={link.id} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
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
                    <p className="text-xs text-[#94a3b8] mt-1">Created {link.created} · {link.uses} uses · {link.total} total</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button onClick={() => copy(link.url, link.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[#161616]"
                    style={{ borderColor: "#1e1e1e", color: "#f0f0f0" }}>
                    <ContentCopy style={{ fontSize: 14 }} />
                    {copiedId === link.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowRequestForm(true)}
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

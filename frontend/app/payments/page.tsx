"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ContentCopy,
  CheckCircle,
  FileDownload,
  Wallet,
  TrendingUp,
  VerifiedUser,
  QrCode,
  Link as LinkIcon,
  AccountBalance,
  ArrowForward,
  ChevronRight,
} from "@mui/icons-material";
import { AppShell } from "@/components/layout/app-shell";

const paymentLink = "trace.co/pay/amaka-foods";
const accountNumber = "8023456789";
const qrImageSrc = "/trace-pay-qr-demo.svg";

const metrics = [
  { label: "Received Today", value: "₦18,500", sub: "+8% vs yesterday", icon: Wallet, color: "#FF6B35" },
  { label: "Verified Payments", value: "24", sub: "6 settled last 3 hrs", icon: VerifiedUser, color: "#22C55E" },
  { label: "Weekly Revenue", value: "₦126,400", sub: "+14% vs last week", icon: TrendingUp, color: "#F5A623" },
  { label: "Score Impact", value: "+12pts", sub: "Inflows lifted score", icon: TrendingUp, color: "#A855F7" },
];

const transactions = [
  { customer: "Meal payment", amount: "₦2,500", channel: "Transfer", time: "10:24 AM" },
  { customer: "Drinks payment", amount: "₦1,800", channel: "QR Code", time: "11:02 AM" },
  { customer: "Lunch order", amount: "₦4,000", channel: "Card", time: "12:18 PM" },
  { customer: "Bank transfer", amount: "₦3,200", channel: "Transfer", time: "1:05 PM" },
  { customer: "Bulk order", amount: "₦7,000", channel: "Payment Link", time: "2:41 PM" },
  { customer: "Evening sale", amount: "₦1,000", channel: "QR Code", time: "4:10 PM" },
];

const impactSignals = [
  { label: "Payment consistency", value: 86 },
  { label: "Revenue growth", value: 74 },
  { label: "Repeat payments", value: 64 },
];

export default function PaymentsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1800);
    } catch { /* ignore */ }
  };

  return (
    <AppShell role="trader">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>

        {/* Page title */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Trace Pay</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Payment Collection</h1>
          <p className="text-[#5C5A78] mt-1">Every payment builds your TraceScore and strengthens your capital profile.</p>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-[#5C5A78]">{m.label}</p>
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${m.color}20` }}>
                    <Icon sx={{ fontSize: "18px", color: m.color }} />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#F0EFE8]">{m.value}</p>
                <p className="text-xs text-[#5C5A78] mt-1">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Col 1&2: Payment Link + Virtual Account + Transactions */}
          <div className="xl:col-span-2 space-y-6">

            {/* Payment Link card */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: "#FF6B3520" }}>
                    <LinkIcon sx={{ fontSize: "20px", color: "#FF6B35" }} />
                  </div>
                  <h2 className="text-lg font-black text-[#F0EFE8]">Payment Link</h2>
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>Live</span>
                </div>
                <p className="text-sm text-[#5C5A78]">Share across WhatsApp, Instagram, SMS — one link, any channel.</p>
              </div>

              <div className="px-6 py-5">
                <div
                  className="flex items-center justify-between rounded-2xl px-5 py-4 mb-5"
                  style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}
                >
                  <div>
                    <p className="text-xs text-[#5C5A78] mb-1 uppercase tracking-widest font-bold">Your link</p>
                    <p className="text-base font-bold text-[#F0EFE8]">{paymentLink}</p>
                  </div>
                  <ArrowForward sx={{ fontSize: "20px", color: "#FF6B35" }} />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(`https://${paymentLink}`, "link")}
                    className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: "#FF6B35", boxShadow: "0 4px 20px rgba(255,107,53,0.35)" }}
                  >
                    {copiedKey === "link"
                      ? <CheckCircle sx={{ fontSize: "18px" }} />
                      : <ContentCopy sx={{ fontSize: "18px" }} />
                    }
                    {copiedKey === "link" ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-[#9B99B5] transition-all hover:text-[#F0EFE8] hover:bg-[#1C1C2E]"
                    style={{ border: "1px solid #2A2A40" }}
                  >
                    Open Checkout
                  </button>
                </div>
              </div>
            </div>

            {/* Virtual Account */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: "#3B82F620" }}>
                    <AccountBalance sx={{ fontSize: "20px", color: "#3B82F6" }} />
                  </div>
                  <h2 className="text-lg font-black text-[#F0EFE8]">Virtual Account</h2>
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>Active</span>
                </div>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Bank", value: "Trace / Squad" },
                  { label: "Account Number", value: accountNumber },
                  { label: "Account Name", value: "Amaka Foods" },
                ].map((f) => (
                  <div key={f.label} className="rounded-2xl p-4" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5C5A78] mb-2">{f.label}</p>
                    <p
                      className="font-black text-[#F0EFE8]"
                      style={{
                        fontSize: f.label === "Account Number" ? "1.4rem" : "1rem",
                        letterSpacing: f.label === "Account Number" ? "0.1em" : undefined,
                      }}
                    >
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => handleCopy(accountNumber, "account")}
                  className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", color: "#F0EFE8" }}
                >
                  {copiedKey === "account"
                    ? <CheckCircle sx={{ fontSize: "18px" }} />
                    : <ContentCopy sx={{ fontSize: "18px" }} />
                  }
                  Copy Account Number
                </button>
              </div>
            </div>

            {/* Transactions */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <div>
                  <h2 className="text-lg font-black text-[#F0EFE8]">Recent Transactions</h2>
                  <p className="text-sm text-[#5C5A78] mt-0.5">Every payment in your verified activity trail</p>
                </div>
                <span className="text-xs font-bold text-[#5C5A78] px-3 py-1.5 rounded-full" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                  Today
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: "#1C1C2E" }}>
                {transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#0F0F1A] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black" style={{ backgroundColor: "#FF6B3515", color: "#FF6B35" }}>
                        {tx.customer[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#F0EFE8]">{tx.customer}</p>
                        <p className="text-xs text-[#5C5A78]">{tx.channel} · {tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#F0EFE8]">{tx.amount}</p>
                      <span className="text-xs font-semibold text-[#22C55E]">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: QR + Score Impact */}
          <div className="space-y-6">

            {/* QR Code */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: "#F5A62320" }}>
                    <QrCode sx={{ fontSize: "20px", color: "#F5A623" }} />
                  </div>
                  <h2 className="text-lg font-black text-[#F0EFE8]">QR Code</h2>
                </div>
                <p className="text-sm text-[#5C5A78] mt-2">Display at your counter for instant in-person payments.</p>
              </div>

              <div className="p-6">
                <div className="rounded-2xl overflow-hidden p-4 mb-5" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                  <div className="rounded-xl overflow-hidden bg-white p-3">
                    <Image src={qrImageSrc} alt="QR" width={400} height={400} className="w-full h-auto" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-black text-[#F0EFE8]">Amaka Foods</p>
                    <p className="text-xs text-[#5C5A78] mt-0.5">{paymentLink}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: "#FF6B35" }}
                  >
                    <FileDownload sx={{ fontSize: "18px" }} />
                    Download
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center rounded-xl py-3 text-sm font-bold text-[#9B99B5] transition-all hover:text-[#F0EFE8]"
                    style={{ border: "1px solid #2A2A40" }}
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Score Impact */}
            <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
                <h2 className="text-lg font-black text-[#F0EFE8]">Payment Impact</h2>
                <p className="text-sm text-[#5C5A78] mt-0.5">How today&apos;s activity affects your score</p>
              </div>

              <div className="p-6 space-y-5">
                <div
                  className="rounded-2xl p-5 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg, #1C1C2E 0%, #141420 100%)", border: "1px solid #F5A62330" }}
                >
                  <div>
                    <p className="text-xs text-[#5C5A78] mb-1">Verified momentum</p>
                    <p className="text-3xl font-black" style={{ color: "#F5A623" }}>+12pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5C5A78] mb-1">TraceScore</p>
                    <p className="text-2xl font-black text-[#F0EFE8]">742</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {impactSignals.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#9B99B5] font-medium">{s.label}</span>
                        <span className="font-bold text-[#F0EFE8]">{s.value}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.value}%`, background: "linear-gradient(90deg, #FF6B35, #F5A623)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/tracescore"
                  className="flex items-center justify-between w-full rounded-xl px-5 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#FF6B35", color: "white" }}
                >
                  View Full TraceScore
                  <ChevronRight sx={{ fontSize: "18px" }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

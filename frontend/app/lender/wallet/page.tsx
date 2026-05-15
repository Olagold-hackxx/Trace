"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import { useLenderData } from "@/hooks/use-lender-data";
import { fetchBackend, formatNairaFromKobo } from "@/lib/backend";
import {
  AccountBalance,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
  CheckCircle,
  Wallet,
} from "@mui/icons-material";
import { Spinner } from "@/components/ui/spinner";

export default function LenderWalletPage() {
  const { wallet, loading, refresh } = useLenderData();

  const [provisioning, setProvisioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const handleProvision = async () => {
    setProvisioning(true);
    try {
      await fetchBackend("/lender/wallet/provision", { method: "POST" });
      await refresh();
    } finally {
      setProvisioning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setWithdrawLoading(true);
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      await fetchBackend("/lender/wallet/withdraw", {
        method: "POST",
        bodyJson: { amountKobo: String(Number(withdrawAmount) * 100) }
      });
      setWithdrawSuccess("Withdrawal initiated successfully. Funds will arrive in your settlement account.");
      setWithdrawAmount("");
      setShowWithdraw(false);
      await refresh();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed. Try again.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const available = Number(wallet?.availableKobo ?? 0);
  const deployed = Number(wallet?.deployedKobo ?? 0);
  const deposited = Number(wallet?.totalDepositedKobo ?? 0);
  const returns = Number(wallet?.totalReturnsKobo ?? 0);
  const total = available + deployed;

  if (loading) {
    return (
      <AppShell role="lender">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading wallet...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Lender Wallet</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Deposit capital, fund loans, and withdraw returns</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Available", value: formatNairaFromKobo(available), icon: Wallet, color: "#ff6b00", sub: "Ready to deploy" },
            { label: "Deployed", value: formatNairaFromKobo(deployed), icon: TrendingUp, color: "#2563eb", sub: "In active loans" },
            { label: "Total Deposited", value: formatNairaFromKobo(deposited), icon: ArrowDownward, color: "#7c3aed", sub: "All time" },
            { label: "Total Returns", value: formatNairaFromKobo(returns), icon: ArrowUpward, color: "#16a34a", sub: "Repayments received" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-2xl p-5" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#161616" }}>
                    <Icon style={{ fontSize: 18, color: card.color }} />
                  </div>
                  <p className="text-xs font-semibold text-[#94a3b8]">{card.label}</p>
                </div>
                <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{card.value}</p>
                <p className="text-xs text-[#64748b] mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Utilisation bar */}
        {total > 0 && (
          <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#f0f0f0]">Capital Utilisation</p>
              <p className="text-sm font-bold" style={{ color: "#ff6b00" }}>{Math.round((deployed / total) * 100)}% deployed</p>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((deployed / total) * 100)}%`, backgroundColor: "#ff6b00" }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#64748b]">
              <span>{formatNairaFromKobo(deployed)} deployed</span>
              <span>{formatNairaFromKobo(available)} available</span>
            </div>
          </div>
        )}

        {/* Deposit Section */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#161616" }}>
              <AccountBalance style={{ fontSize: 20, color: "#ff6b00" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Fund Your Wallet</h2>
              <p className="text-xs text-[#94a3b8]">Bank transfer to your dedicated virtual account</p>
            </div>
          </div>

          {wallet?.virtualAccountNumber ? (
            <div>
              <p className="text-xs text-[#94a3b8] mb-4">
                Transfer any amount to the account below. Your wallet balance updates automatically once we receive the funds.
              </p>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#64748b] mb-1">Bank</p>
                    <p className="font-semibold text-[#f0f0f0]">{wallet.bankName ?? "GTBank"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b] mb-1">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#f0f0f0] text-lg tracking-widest">{wallet.virtualAccountNumber}</p>
                      <button
                        onClick={() => handleCopy(wallet.virtualAccountNumber!)}
                        className="p-1.5 rounded-lg transition-all hover:bg-[#1e1e1e]"
                        style={{ color: copied ? "#16a34a" : "#94a3b8" }}
                      >
                        {copied ? <CheckCircle style={{ fontSize: 16 }} /> : <ContentCopy style={{ fontSize: 16 }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b] mb-1">Account Name</p>
                    <p className="font-semibold text-[#f0f0f0]">Trace Lender</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b] mb-1">Minimum Transfer</p>
                    <p className="font-semibold text-[#f0f0f0]">₦10,000</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: "#0d1f12", border: "1px solid #14532d" }}>
                <CheckCircle style={{ fontSize: 16, color: "#16a34a", marginTop: 1, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: "#86efac" }}>
                  Funds credited automatically via bank webhook. No manual action needed after transfer.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#94a3b8] mb-5">
                Generate your dedicated virtual account to start depositing capital. This is a one-time setup — your account number is permanent.
              </p>
              <button
                onClick={handleProvision}
                disabled={provisioning}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#ff6b00" }}
              >
                {provisioning ? "Setting up account..." : "Generate Deposit Account"}
              </button>
            </div>
          )}
        </div>

        {/* Withdraw Section */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#161616" }}>
                <ArrowUpward style={{ fontSize: 20, color: "#ff6b00" }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Withdraw</h2>
                <p className="text-xs text-[#94a3b8]">Send available balance to your settlement account</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#64748b]">Available</p>
              <p className="font-bold text-[#f0f0f0]">{formatNairaFromKobo(available)}</p>
            </div>
          </div>

          {withdrawSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: "#0d1f12", border: "1px solid #14532d" }}>
              <CheckCircle style={{ fontSize: 16, color: "#16a34a", marginTop: 1 }} />
              <p className="text-xs" style={{ color: "#86efac" }}>{withdrawSuccess}</p>
            </div>
          )}

          {!showWithdraw ? (
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={available === 0}
              className="px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] disabled:opacity-40 disabled:cursor-not-allowed text-[#f0f0f0]"
              style={{ borderColor: "#1e1e1e" }}
            >
              {available === 0 ? "No Available Balance" : "Withdraw Funds"}
            </button>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Amount (₦)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 px-3 py-3 text-sm rounded-xl border outline-none"
                  style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawAmount}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#ff6b00" }}
                >
                  {withdrawLoading ? "Processing..." : "Withdraw"}
                </button>
                <button
                  onClick={() => { setShowWithdraw(false); setWithdrawError(""); }}
                  className="px-4 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]"
                  style={{ borderColor: "#1e1e1e" }}
                >
                  Cancel
                </button>
              </div>
              {withdrawError && <p className="text-xs text-[#f87171] mt-2">{withdrawError}</p>}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

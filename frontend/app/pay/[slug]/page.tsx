"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, ArrowForward } from "@mui/icons-material";

interface LinkInfo {
  id: string;
  name: string;
  slug: string;
  amountKobo?: string;
  description?: string;
  active: boolean;
}

const API = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

async function fetchLinkInfo(slug: string): Promise<LinkInfo> {
  const res = await fetch(`${API}/payments/public/${slug}`);
  if (!res.ok) throw new Error("Payment link not found");
  return res.json();
}

async function initiatePayment(slug: string, amountKobo: string, email: string, description?: string) {
  const res = await fetch(`${API}/payments/public/${slug}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amountKobo, email, description })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Payment initiation failed");
  }
  return res.json() as Promise<{ checkoutUrl: string; reference: string; fixedAmount: string | null }>;
}

export default function PayPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [link, setLink] = useState<LinkInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFixed = link && link.amountKobo && Number(link.amountKobo) > 0;
  const displayAmount = isFixed ? Math.round(Number(link!.amountKobo) / 100).toLocaleString() : null;

  useEffect(() => {
    fetchLinkInfo(slug)
      .then(setLink)
      .catch(() => setNotFound(true));
  }, [slug]);

  const handlePay = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!isFixed && (!amount || Number(amount) <= 0)) { setError("Please enter a valid amount."); return; }

    setLoading(true);
    setError("");
    try {
      const amountKobo = isFixed ? link!.amountKobo! : String(Number(amount) * 100);
      const result = await initiatePayment(slug, amountKobo, email, link?.name);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔗</p>
          <h1 className="text-xl font-bold text-[#f0f0f0] mb-2">Link not found</h1>
          <p className="text-sm text-[#64748b]">This payment link doesn't exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#ff6b00", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#0d0d0d" }}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ff6b00" }}>
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "Epilogue, sans-serif" }}>Trace Pay</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 20px 60px rgba(0,0,0,0.5)" }}>
          <h1 className="text-lg font-bold text-[#f0f0f0] mb-1" style={{ fontFamily: "Epilogue, sans-serif" }}>{link.name}</h1>
          {link.description && <p className="text-sm text-[#94a3b8] mb-5">{link.description}</p>}

          {/* Fixed amount display */}
          {isFixed && (
            <div className="rounded-xl p-4 mb-5 text-center" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: "#ff6b00" }}>₦{displayAmount}</p>
            </div>
          )}

          {/* Flexible amount input */}
          {!isFixed && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#94a3b8]">₦</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-sm rounded-xl border outline-none text-[#f0f0f0]"
                  style={{ borderColor: "#1e1e1e", backgroundColor: "#161616" }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Your Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border outline-none text-[#f0f0f0]"
              style={{ borderColor: "#1e1e1e", backgroundColor: "#161616" }}
            />
            <p className="text-xs text-[#64748b] mt-1">Receipt will be sent to this email.</p>
          </div>

          {error && <p className="text-xs text-[#f87171] mb-4">{error}</p>}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ff6b00" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                Pay {isFixed ? `₦${displayAmount}` : amount ? `₦${Number(amount).toLocaleString()}` : "Now"}
                <ArrowForward style={{ fontSize: 16 }} />
              </>
            )}
          </button>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <CheckCircle style={{ fontSize: 14, color: "#16a34a" }} />
            <p className="text-xs text-[#64748b]">Secured by Squad · Powered by Trace</p>
          </div>
        </div>

        {/* Squad logo area */}
        <p className="text-center text-xs text-[#3d4752] mt-6">
          Payments processed securely via Squad Co.
        </p>
      </div>
    </div>
  );
}

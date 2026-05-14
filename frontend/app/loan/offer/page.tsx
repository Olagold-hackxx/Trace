"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useTraderData } from "@/hooks/use-trader-data";
import { fetchBackend, formatNairaFromKobo } from "@/lib/backend";
import { CheckCircle, RadioButtonUnchecked, Bolt, AccessTime, Shield } from "@mui/icons-material";

export default function LoanOfferPage() {
  const router = useRouter();
  const { offers } = useTraderData();
  const liveOffers = offers.map((offer, index) => ({
    id: offer.id,
    name: offer.lenderName,
    amount: formatNairaFromKobo(offer.amountKobo),
    rate: offer.rateLabel,
    tenor: offer.tenorLabel,
    monthly: offer.monthlyRepaymentLabel,
    badge: index === 0 ? "Live" : "Available",
    badgeColor: index === 0 ? "#16a34a" : "#ff6b00",
    badgeBg: index === 0 ? "#dcfce7" : "#3b1d09",
    decisionWindow: "Review now",
    disbursement: "Triggered by backend acceptance",
    purpose: "Business capital offer",
  }));
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(liveOffers[0]?.id ?? null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedOffer = params.get("offer");
    const matchedOffer = liveOffers.find((offer) => offer.id === requestedOffer);
    if (matchedOffer) {
      setSelectedOfferId(matchedOffer.id);
    }
  }, [liveOffers]);

  const selectedOffer = useMemo(
    () => liveOffers.find((offer) => offer.id === selectedOfferId) ?? liveOffers[0] ?? null,
    [liveOffers, selectedOfferId]
  );

  const handleAccept = async () => {
    setAccepted(true);

    try {
      await fetchBackend(`/loans/offers/${selectedOffer.id}/accept`, {
        method: "POST",
      });
      router.push(`/loan/active?offer=${selectedOffer.id}`);
    } catch {
      setAccepted(false);
    }
  };

  if (!selectedOffer) {
    return (
      <AppShell role="user" title="Loan Offer">
        <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[40vh]">
          <p className="text-sm text-[#94a3b8]">No pre-qualified offers available yet. Build your TraceScore to unlock offers.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="user" title="Loan Offer">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00] mb-3">Pre-qualified capital</p>
              <h1 className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Select the best facility for your business
              </h1>
              <p className="text-sm text-[#94a3b8] mt-2 max-w-2xl">
                These offers are already matched to your TraceScore, repayment history, and recent cashflow pattern.
              </p>
            </div>

            <div className="space-y-4">
              {liveOffers.map((offer) => {
                const isSelected = selectedOffer.id === offer.id;
                return (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className="w-full text-left rounded-2xl p-5 transition-all"
                    style={{
                      backgroundColor: isSelected ? "#161616" : "#111111",
                      border: `1px solid ${isSelected ? "#ff6b00" : "#1e1e1e"}`,
                      boxShadow: isSelected ? "0px 0px 0px 1px rgba(255,107,0,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {isSelected ? (
                          <CheckCircle style={{ fontSize: 20, color: "#ff6b00" }} />
                        ) : (
                          <RadioButtonUnchecked style={{ fontSize: 20, color: "#64748b" }} />
                        )}
                        <div>
                          <p className="text-base font-semibold text-[#f0f0f0]">{offer.name}</p>
                          <p className="text-sm text-[#94a3b8]">{offer.purpose}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: offer.badgeBg, color: offer.badgeColor }}>
                        {offer.badge}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[#94a3b8] mb-1">Amount</p>
                        <p className="font-bold text-[#f0f0f0]">{offer.amount}</p>
                      </div>
                      <div>
                        <p className="text-[#94a3b8] mb-1">Rate</p>
                        <p className="font-bold text-[#f0f0f0]">{offer.rate}</p>
                      </div>
                      <div>
                        <p className="text-[#94a3b8] mb-1">Tenor</p>
                        <p className="font-bold text-[#f0f0f0]">{offer.tenor}</p>
                      </div>
                      <div>
                        <p className="text-[#94a3b8] mb-1">Monthly</p>
                        <p className="font-bold text-[#f0f0f0]">{offer.monthly}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Offer Summary
                </h2>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: selectedOffer.badgeBg, color: selectedOffer.badgeColor }}>
                  {selectedOffer.badge}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#94a3b8]">Lender</p>
                  <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                    {selectedOffer.name}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-sm text-[#94a3b8] mb-1">Approved amount</p>
                  <p className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                    {selectedOffer.amount}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoTile icon={Bolt} label="Disbursement" value={selectedOffer.disbursement} />
                  <InfoTile icon={AccessTime} label="Decision window" value={selectedOffer.decisionWindow} />
                  <InfoTile icon={Shield} label="Tenor" value={selectedOffer.tenor} />
                  <InfoTile icon={CheckCircle} label="Monthly repayment" value={selectedOffer.monthly} />
                </div>
              </div>

              <button
                onClick={handleAccept}
                disabled={accepted}
                className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: "#ff6b00" }}
              >
                {accepted ? "Accepting offer..." : `Accept ${selectedOffer.name} offer`}
              </button>
              <Link
                href="/loan/apply"
                className="mt-3 w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}
              >
                Submit a custom loan application
              </Link>
              <p className="text-xs text-[#94a3b8] mt-3 leading-5">
                Accepting this facility moves you straight into active loan tracking with repayment milestones and due-date monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bolt;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
      <Icon style={{ fontSize: 18, color: "#ff6b00", marginBottom: 8 }} />
      <p className="text-xs text-[#94a3b8] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#f0f0f0]">{value}</p>
    </div>
  );
}

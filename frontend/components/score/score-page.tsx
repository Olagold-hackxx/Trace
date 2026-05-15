"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useTraderData } from "@/hooks/use-trader-data";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  TrendingUp,
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  NorthEast,
  WarningAmber,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNairaFromKobo } from "@/lib/backend";

export function ScorePage() {
  const { score: backendScore, explanation, scoreHistory: backendHistory, offers } = useTraderData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lenderVisible, setLenderVisible] = useState(true);
  const [insightOpen, setInsightOpen] = useState(false);
  const score = backendScore?.score ?? 0;
  const pct = (score / 850) * 100;
  const circumference = 2 * Math.PI * 80;
  const activeHistory = backendHistory.map((item) => ({
    month: new Date(item.createdAt ?? Date.now()).toLocaleDateString("en-NG", { month: "short" }),
    score: item.score,
  }));
  const activeOffers = offers.map((offer, index) => ({
    id: offer.id,
    name: offer.lenderName,
    amount: formatNairaFromKobo(offer.amountKobo),
    rate: offer.rateLabel,
    tenor: offer.tenorLabel,
    monthly: offer.monthlyRepaymentLabel,
    badge: index === 0 ? "Live" : "Available",
    badgeColor: index === 0 ? "#16a34a" : "#ff6b00",
    badgeBg: index === 0 ? "#dcfce7" : "#3b1d09",
  }));

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              TraceScore
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">Your verified financial identity — updated in real time</p>
          </div>
          <button
            onClick={() => setInsightOpen(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}
          >
            View factor explainers
          </button>
        </div>

        <div
          className="rounded-2xl p-8 mb-6 grid lg:grid-cols-3 gap-8 items-center"
          style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
        >
          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#1e1e1e" strokeWidth="16" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ff6b00"
                  strokeWidth="16"
                  strokeDasharray={`${circumference * (pct / 100)} ${circumference}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  {score}
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#ff6b00" }}>
                  {score >= 750 ? "Excellent" : score >= 650 ? "Good" : "Building"}
                </p>
                <p className="text-xs text-[#94a3b8]">out of 850</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              <TrendingUp style={{ fontSize: 16 }} />
              +7 points this month
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#f0f0f0] mb-3" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Score Bands
            </p>
            {[
              { label: "Excellent", range: "750–850", color: "#16a34a", bg: "#dcfce7" },
              { label: "Good", range: "600–749", color: "#ff6b00", bg: "#3b1d09", active: true },
              { label: "Fair", range: "450–599", color: "#d97706", bg: "#fef3c7" },
              { label: "Poor", range: "300–449", color: "#dc2626", bg: "#fee2e2" },
              { label: "Very Poor", range: "0–299", color: "#7f1d1d", bg: "#fecaca" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: b.active ? b.bg : "#161616", border: `1px solid ${b.active ? `${b.color}40` : "#1e1e1e"}` }}
              >
                <div className="flex items-center gap-2">
                  {b.active && <CheckCircle style={{ fontSize: 16, color: b.color }} />}
                  <span className="text-sm font-medium text-[#f0f0f0]">{b.label}</span>
                </div>
                <span className="text-xs text-[#94a3b8] font-mono">{b.range}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Your Highlights
            </p>
            {[
              { label: "Payments on time", val: "48 / 48", color: "#16a34a" },
              { label: "Months active", val: "27 months", color: "#ff6b00" },
              { label: "Jobs completed", val: "6 jobs", color: "#ff6b00" },
              { label: "Loans repaid", val: "2 of 2", color: "#ff6b00" },
              { label: "Avg monthly revenue", val: "₦547,000", color: "#ff6b00" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-[#cbd5e1]">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "#1e1e1e" }}>
              <div>
                <p className="text-sm font-semibold text-[#f0f0f0]">Lender Visibility</p>
                <p className="text-xs text-[#94a3b8]">Allow lenders to view your profile</p>
              </div>
              <button
                onClick={() => setLenderVisible(!lenderVisible)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ backgroundColor: lenderVisible ? "#ff6b00" : "#334155" }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-all shadow"
                  style={{ left: lenderVisible ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
          <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
            Score History — 12 Months
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activeHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[670, 760]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }}
                labelStyle={{ color: "#f0f0f0", fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5} dot={{ fill: "#ff6b00", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111111] rounded-2xl p-6 mb-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Score Factor Breakdown
            </h2>
            <button
              onClick={() => setInsightOpen(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl"
              style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#ff6b00" }}
            >
              Plain-language view
            </button>
          </div>
          <div className="space-y-5">
            {explanation?.factors?.length ? (
              explanation.factors.map((f, index) => {
                const factorScore = typeof f.score === "number" ? f.score : Math.max(40, 85 - index * 8);
                const color = f.direction === "positive" ? "#16a34a" : "#ff6b00";
                const label = typeof f.label === "string" ? f.label : typeof f.text === "string" ? f.text : `Factor ${index + 1}`;
                return (
                  <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#f0f0f0]">{label}</span>
                      <span className="text-sm font-bold text-[#f0f0f0]">{factorScore}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${factorScore}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-[#94a3b8]">Score factors not yet available</div>
            )}
          </div>
        </div>

        <div className="bg-[#111111] rounded-2xl p-6 mb-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Pre-Qualified Offers
              </h2>
              <p className="text-sm text-[#94a3b8] mt-1">Based on your TraceScore of {score} — no extra form needed to see these</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {activeOffers.map((offer) => (
              <div key={offer.name} className="rounded-xl p-5 border" style={{ borderColor: "#1e1e1e" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#ff6b00" }}>
                    {offer.name[0]}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: offer.badgeBg, color: offer.badgeColor }}>
                    {offer.badge}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#cbd5e1]">{offer.name}</p>
                <p className="text-2xl font-bold text-[#f0f0f0] mt-1" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  {offer.amount}
                </p>
                <div className="space-y-1 mt-3 text-xs text-[#94a3b8]">
                  <p>Rate: <span className="font-semibold text-[#f0f0f0]">{offer.rate}</span></p>
                  <p>Tenor: <span className="font-semibold text-[#f0f0f0]">{offer.tenor}</span></p>
                  <p>Monthly: <span className="font-semibold text-[#f0f0f0]">{offer.monthly}</span></p>
                </div>
                <Link
                  href={`/loan/offer?offer=${offer.id}`}
                  className="mt-4 w-full inline-flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#ff6b00" }}
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
            How TraceScore Works
          </h2>
          <div className="space-y-2">
            {[
              { q: "What is TraceScore?", a: "TraceScore is your verified financial identity — a real-time credit score built from your transaction history, loan repayments, and business activity on the Trace platform." },
              { q: "How is it calculated?", a: "We analyze your payment consistency, revenue trends, loan repayment history, and marketplace activity to generate a score between 300 and 850." },
              { q: "How do I improve my score?", a: "Make payments on time, maintain steady revenue, repay loans on schedule, and keep your business active on the platform." },
              { q: "Who can see my score?", a: "Only lenders you've granted visibility to can see your TraceScore. You control your data with the Lender Visibility toggle." },
            ].map((faq, i) => (
              <div key={faq.q} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e1e" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#161616] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#f0f0f0]">{faq.q}</span>
                  {openFaq === i ? (
                    <KeyboardArrowUp style={{ fontSize: 20, color: "#94a3b8" }} />
                  ) : (
                    <KeyboardArrowDown style={{ fontSize: 20, color: "#94a3b8" }} />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-[#cbd5e1] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Drawer open={insightOpen} onOpenChange={setInsightOpen}>
        <DrawerContent className="border-t border-[#1e1e1e] bg-[#111111] text-[#f0f0f0]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Why your score is {score}
            </DrawerTitle>
            <DrawerDescription className="text-[#94a3b8]">
              Plain-language factor explanations for lenders and traders.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2 max-h-[60vh] overflow-y-auto space-y-3">
            {explanation?.factors?.length ? (
              explanation.factors.map((factor, index) => {
                const isPositive = factor.direction === "positive";
                const color = isPositive ? "#16a34a" : "#ff6b00";
                const factorScore = Math.max(40, 82 - index * 8);
                const label = typeof factor.label === "string" ? factor.label : typeof factor.text === "string" ? factor.text : `Factor ${index + 1}`;
                const icon = isPositive
                  ? <NorthEast style={{ fontSize: 16, color: "#16a34a" }} />
                  : <WarningAmber style={{ fontSize: 16, color: "#ff6b00" }} />;
                return (
                  <div key={index} className="rounded-2xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {icon}
                        <p className="text-sm font-semibold text-[#f0f0f0]">{label}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                        {factorScore}/100
                      </span>
                    </div>
                    <p className="text-sm text-[#cbd5e1]">
                      {typeof factor.text === "string" ? factor.text : "Recent activity is factored into this signal."}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-[#94a3b8]">No factor data available yet</div>
            )}
          </div>
          <DrawerFooter>
            <Link
              href="/loan/offer"
              className="w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "#ff6b00" }}
            >
              Review loan offers
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
}

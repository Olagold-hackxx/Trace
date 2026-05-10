"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import { TrendingUp, Info, KeyboardArrowDown, KeyboardArrowUp, CheckCircle } from "@mui/icons-material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const scoreHistory = [
  { month: "Jun", score: 688 }, { month: "Jul", score: 698 }, { month: "Aug", score: 704 },
  { month: "Sep", score: 710 }, { month: "Oct", score: 718 }, { month: "Nov", score: 725 },
  { month: "Dec", score: 719 }, { month: "Jan", score: 724 }, { month: "Feb", score: 728 },
  { month: "Mar", score: 730 }, { month: "Apr", score: 735 }, { month: "May", score: 742 },
];

const factors = [
  { label: "Payment History", score: 90, weight: "35%", desc: "48 of 48 payments on time. Zero missed or late payments.", color: "#ff6b00", status: "Excellent" },
  { label: "Revenue Consistency", score: 74, weight: "25%", desc: "Monthly revenue stable within ±20% range over 12 months.", color: "#ff6b00", status: "Good" },
  { label: "Business Longevity", score: 60, weight: "20%", desc: "27 months active on Trace. Consistent trading pattern.", color: "#ff6b00", status: "Fair" },
  { label: "Employment Record", score: 45, weight: "10%", desc: "6 workers hired via Trace marketplace. Room to grow.", color: "#7c3aed", status: "Building" },
  { label: "Lender Trust Score", score: 82, weight: "10%", desc: "2 prior loans fully repaid. No defaults. Strong history.", color: "#2563eb", status: "Very Good" },
];

const lenderOffers = [
  { name: "FirstBank", amount: "₦500,000", rate: "16% p.a.", tenor: "6 months", monthly: "₦90,833", badge: "Best Rate", badgeColor: "#16a34a", badgeBg: "#dcfce7" },
  { name: "Zenith Capital", amount: "₦1,500,000", rate: "18% p.a.", tenor: "12 months", monthly: "₦137,500", badge: "Recommended", badgeColor: "#ff6b00", badgeBg: "#fff1eb" },
  { name: "Access Growth Fund", amount: "₦2,500,000", rate: "20% p.a.", tenor: "18 months", monthly: "₦180,556", badge: "Largest", badgeColor: "#2563eb", badgeBg: "#dae2fd" },
];

const faqs = [
  { q: "How is my TraceScore calculated?", a: "TraceScore is a composite of 5 weighted factors: Payment History (35%), Revenue Consistency (25%), Business Longevity (20%), Employment Record (10%), and Lender Trust (10%). Each factor is scored from 0–100 and weighted to produce your final score out of 900." },
  { q: "How often does my score update?", a: "Your score updates in real time as new transactions are recorded. Large changes (like receiving a new payment or completing a job) reflect within minutes. Monthly summaries are computed every 1st of the month." },
  { q: "Can lenders see my score without my permission?", a: "No. Lenders can only see your score when you either apply for a loan through Trace, or you explicitly toggle on 'Lender Visibility' in your settings. You are always in control." },
  { q: "What can I do to improve my score fast?", a: "The fastest wins are: (1) Make all payments on time, (2) Post and complete jobs via Trace to build your employment record, (3) Keep your monthly revenue consistent — avoid long gaps in trading activity." },
];

export default function TraceScorePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lenderVisible, setLenderVisible] = useState(true);
  const score = 742;
  const pct = (score / 900) * 100;
  const circumference = 2 * Math.PI * 80;

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>TraceScore</h1>
          <p className="text-sm text-[#8e7164] mt-1">Your verified financial identity — updated in real time</p>
        </div>

        {/* Score hero */}
        <div className="bg-white rounded-2xl p-8 mb-6 grid lg:grid-cols-3 gap-8 items-center" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#fee3d8" strokeWidth="16" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#ff6b00" strokeWidth="16"
                  strokeDasharray={`${circumference * (pct / 100)} ${circumference}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>{score}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#ff6b00" }}>Excellent</p>
                <p className="text-xs text-[#8e7164]">out of 900</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              <TrendingUp style={{ fontSize: 16 }} />
              +7 points this month
            </div>
          </div>

          {/* Score bands */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#261812] mb-3" style={{ fontFamily: "Epilogue, sans-serif" }}>Score Bands</p>
            {[
              { label: "Excellent", range: "750–900", color: "#16a34a", bg: "#dcfce7" },
              { label: "Good", range: "600–749", color: "#ff6b00", bg: "#fff1eb", active: true },
              { label: "Fair", range: "450–599", color: "#d97706", bg: "#fef3c7" },
              { label: "Poor", range: "300–449", color: "#dc2626", bg: "#fee2e2" },
              { label: "Very Poor", range: "0–299", color: "#7f1d1d", bg: "#fecaca" },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: b.active ? b.bg : "#fff8f6", border: `1px solid ${b.active ? b.color + "40" : "#e2bfb0"}` }}>
                <div className="flex items-center gap-2">
                  {b.active && <CheckCircle style={{ fontSize: 16, color: b.color }} />}
                  <span className="text-sm font-medium text-[#261812]">{b.label}</span>
                </div>
                <span className="text-xs text-[#8e7164] font-mono">{b.range}</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>Your Highlights</p>
            {[
              { label: "Payments on time", val: "48 / 48", color: "#16a34a" },
              { label: "Months active", val: "27 months", color: "#ff6b00" },
              { label: "Jobs completed", val: "6 jobs", color: "#7c3aed" },
              { label: "Loans repaid", val: "2 of 2", color: "#2563eb" },
              { label: "Avg monthly revenue", val: "₦547,000", color: "#ff6b00" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-[#5a4136]">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
            {/* Lender visibility toggle */}
            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "#e2bfb0" }}>
              <div>
                <p className="text-sm font-semibold text-[#261812]">Lender Visibility</p>
                <p className="text-xs text-[#8e7164]">Allow lenders to view your profile</p>
              </div>
              <button
                onClick={() => setLenderVisible(!lenderVisible)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ backgroundColor: lenderVisible ? "#ff6b00" : "#e2bfb0" }}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
                  style={{ left: lenderVisible ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Score history chart */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="text-lg font-bold text-[#261812] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Score History — 12 Months</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8ddd2" />
              <XAxis dataKey="month" tick={{ fill: "#8e7164", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[670, 760]} tick={{ fill: "#8e7164", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2bfb0", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#261812", fontWeight: 600 }} />
              <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5} dot={{ fill: "#ff6b00", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Factor breakdown */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="text-lg font-bold text-[#261812] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Score Factor Breakdown</h2>
          <div className="space-y-5">
            {factors.map((f) => (
              <div key={f.label} className="p-4 rounded-xl" style={{ backgroundColor: "#fff8f6", border: "1px solid #e2bfb0" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#261812]">{f.label}</span>
                    <span className="text-xs text-[#8e7164]">· weight {f.weight}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: f.color + "15", color: f.color }}>{f.status}</span>
                    <span className="text-sm font-bold text-[#261812]">{f.score}/100</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#fee3d8" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.score}%`, backgroundColor: f.color }} />
                </div>
                <p className="text-xs text-[#5a4136]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lender offers */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>Pre-Qualified Offers</h2>
              <p className="text-sm text-[#8e7164] mt-1">Based on your TraceScore of 742 — no application needed to see these</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {lenderOffers.map((offer) => (
              <div key={offer.name} className="rounded-xl p-5 border" style={{ borderColor: "#e2bfb0" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#2563eb" }}>
                    {offer.name[0]}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: offer.badgeBg, color: offer.badgeColor }}>{offer.badge}</span>
                </div>
                <p className="text-sm font-semibold text-[#5a4136]">{offer.name}</p>
                <p className="text-2xl font-bold text-[#261812] mt-1" style={{ fontFamily: "Epilogue, sans-serif" }}>{offer.amount}</p>
                <div className="space-y-1 mt-3 text-xs text-[#8e7164]">
                  <p>Rate: <span className="font-semibold text-[#261812]">{offer.rate}</span></p>
                  <p>Tenor: <span className="font-semibold text-[#261812]">{offer.tenor}</span></p>
                  <p>Monthly: <span className="font-semibold text-[#261812]">{offer.monthly}</span></p>
                </div>
                <button className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#ff6b00" }}>
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="text-lg font-bold text-[#261812] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>How TraceScore Works</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2bfb0" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fff8f6] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#261812]">{faq.q}</span>
                  {openFaq === i ? <KeyboardArrowUp style={{ fontSize: 20, color: "#8e7164" }} /> : <KeyboardArrowDown style={{ fontSize: 20, color: "#8e7164" }} />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-[#5a4136] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TraceScoreGauge } from "@/components/score/tracescore-gauge";
import { ScoreBreakdownCard } from "@/components/score/score-breakdown-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { REVENUE_TREND } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";
import { ElectricBolt, TrendingUp, Schedule, Percent } from "@mui/icons-material";
import Link from "next/link";

const capitalItems = [
  { label: "Max Eligible Capital", value: "₦500,000", icon: TrendingUp, color: "#F5A623" },
  { label: "Interest Rate", value: "18% APR", icon: Percent, color: "#22C55E" },
  { label: "Repayment Period", value: "12 Months", icon: Schedule, color: "#3B82F6" },
];

export default function TraceScorePage() {
  return (
    <AppShell role="trader">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Credit Profile</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">TraceScore</h1>
          <p className="text-[#5C5A78] mt-1">Your real-time credit readiness — powered by your payment activity.</p>
        </div>

        {/* Pre-approval banner */}
        <div
          className="flex items-start gap-4 rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #F5A62315 0%, #FF6B3510 100%)", border: "1px solid #F5A62340" }}
        >
          <div className="p-2 rounded-xl flex-none" style={{ backgroundColor: "#F5A62320" }}>
            <ElectricBolt sx={{ fontSize: "22px", color: "#F5A623" }} />
          </div>
          <div className="flex-1">
            <p className="font-black text-[#F0EFE8] mb-1">You&apos;re Pre-Approved!</p>
            <p className="text-sm text-[#9B99B5] leading-6">
              Based on your consistent payment history and strong transaction volume, you&apos;re eligible for up to{" "}
              <span className="font-black text-[#F5A623]">₦500,000</span> in restock capital. Contact a lender to get started.
            </p>
          </div>
          <Link
            href="/lender"
            className="flex-none text-sm font-black px-4 py-2 rounded-xl text-white transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "#F5A623" }}
          >
            Apply Now
          </Link>
        </div>

        {/* Score + Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TraceScoreGauge score={742} />
          </div>
          <div className="lg:col-span-2">
            <ScoreBreakdownCard />
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[#F0EFE8]">Revenue Trend</h3>
              <p className="text-sm text-[#5C5A78] mt-0.5">8-week payment volume history</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
              Consistent growth
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={REVENUE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1C2E" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", borderRadius: "12px", color: "#F0EFE8" }}
                formatter={(value) => [formatNaira(value as number), "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2.5} dot={{ fill: "#F5A623", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capital Eligibility */}
        <div>
          <h3 className="text-lg font-black text-[#F0EFE8] mb-4">Capital Eligibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capitalItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl p-5" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${item.color}20` }}>
                      <Icon sx={{ fontSize: "20px", color: item.color }} />
                    </div>
                    <p className="text-sm text-[#5C5A78]">{item.label}</p>
                  </div>
                  <p className="text-2xl font-black text-[#F0EFE8]">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

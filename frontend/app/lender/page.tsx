"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { LENDER_QUEUE, TRACE_SCORES } from "@/lib/mock-data";
import { TRADERS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, CheckCircle, AccessTime, Cancel } from "@mui/icons-material";
import Link from "next/link";

const riskData = [
  { name: "Low Risk",    value: 45, color: "#22C55E" },
  { name: "Medium Risk", value: 35, color: "#F5A623" },
  { name: "High Risk",   value: 20, color: "#FF6B35" },
];

export default function LenderDashboardPage() {
  const lender = LENDER_QUEUE[0];
  const allMerchants = [
    ...lender.merchants,
    ...LENDER_QUEUE[1].merchants,
    ...LENDER_QUEUE[2].merchants,
  ].sort((a, b) => (TRACE_SCORES[b.traderId as keyof typeof TRACE_SCORES]?.score ?? 0) - (TRACE_SCORES[a.traderId as keyof typeof TRACE_SCORES]?.score ?? 0));

  return (
    <AppShell role="lender">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Lender Portal</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">{lender.name}</h1>
          <p className="text-[#5C5A78] mt-1">Underwriting dashboard — review and approve trader capital requests.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Approved" value={lender.approvedCount} icon={<CheckCircle sx={{ fontSize: "22px", color: "#22C55E" }} />} color="#22C55E" trend={8} />
          <MetricCard label="Under Review" value={lender.merchants.length} icon={<AccessTime sx={{ fontSize: "22px", color: "#F59E0B" }} />} color="#F59E0B" />
          <MetricCard label="Rejected" value={lender.rejectedCount} icon={<Cancel sx={{ fontSize: "22px", color: "#EF4444" }} />} color="#EF4444" />
          <MetricCard
            label="Approval Rate"
            value={`${Math.round((lender.approvedCount / (lender.approvedCount + lender.rejectedCount)) * 100)}%`}
            icon={<TrendingUp sx={{ fontSize: "22px", color: "#FF6B35" }} />}
            color="#FF6B35"
            trend={3}
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Pie */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <h3 className="text-lg font-black text-[#F0EFE8] mb-6">Portfolio Risk</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", borderRadius: "12px", color: "#F0EFE8" }}
                  formatter={(v) => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {riskData.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-sm text-[#9B99B5]">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-[#F0EFE8]">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
              <h3 className="text-lg font-black text-[#F0EFE8]">Pending Reviews</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#F59E0B20", color: "#F59E0B" }}>
                {lender.merchants.length} pending
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "#1C1C2E" }}>
              {lender.merchants.map((merchant) => {
                const traceScore = TRACE_SCORES[merchant.traderId as keyof typeof TRACE_SCORES];
                const score = traceScore?.score ?? 0;
                const scoreColor = score >= 750 ? "#F5A623" : score >= 700 ? "#22C55E" : "#FF6B35";
                return (
                  <Link
                    key={merchant.traderId}
                    href={`/lender/merchants/${merchant.traderId}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#0F0F1A] transition-colors"
                  >
                    <div>
                      <p className="font-bold text-[#F0EFE8]">{merchant.traderName}</p>
                      <p className="text-sm text-[#5C5A78] mt-0.5">Requested: {formatNaira(merchant.requestedAmount)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black" style={{ color: scoreColor }}>{score}</p>
                        <p className="text-xs text-[#5C5A78]">TraceScore</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#F59E0B20", color: "#F59E0B" }}>
                        {merchant.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Merchants table */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
            <h3 className="text-lg font-black text-[#F0EFE8]">Top Merchants by TraceScore</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1C1C2E" }}>
                  {["Business", "TraceScore", "Category", "Status"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#5C5A78]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMerchants.slice(0, 5).map((merchant) => {
                  const traceScore = TRACE_SCORES[merchant.traderId as keyof typeof TRACE_SCORES];
                  const trader = TRADERS.find((t) => t.id === merchant.traderId);
                  const score = traceScore?.score ?? 0;
                  const scoreColor = score >= 750 ? "#F5A623" : score >= 700 ? "#22C55E" : "#FF6B35";
                  return (
                    <tr key={merchant.traderId} style={{ borderBottom: "1px solid #1C1C2E" }} className="hover:bg-[#0F0F1A] transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/lender/merchants/${merchant.traderId}`} className="font-bold text-[#F0EFE8] hover:text-[#FF6B35] transition-colors">
                          {merchant.traderName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-black text-xl" style={{ color: scoreColor }}>{score}</td>
                      <td className="px-6 py-4 text-[#5C5A78]">{trader?.category}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
                          {merchant.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

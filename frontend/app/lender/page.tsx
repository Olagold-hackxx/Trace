"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { LENDER_QUEUE, TRACE_SCORES } from "@/lib/mock-data";
import { TRADERS } from "@/lib/constants";
import { StatusBadge } from "@/components/common/status-badge";
import { formatNaira } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, CheckCircle, AccessTime, WarningAmber } from "@mui/icons-material";
import Link from "next/link";
import { COLORS } from "@/lib/constants";

const riskData = [
  { name: "Low Risk", value: 45, color: "#10b981" },
  { name: "Medium Risk", value: 35, color: "#3b82f6" },
  { name: "High Risk", value: 20, color: "#f59e0b" },
];

export default function LenderDashboardPage() {
  const lender = LENDER_QUEUE[0];
  const allMerchants = [
    ...lender.merchants,
    ...LENDER_QUEUE[1].merchants,
    ...LENDER_QUEUE[2].merchants,
  ].sort((a, b) => TRACE_SCORES[b.traderId]?.score - TRACE_SCORES[a.traderId]?.score);

  return (
    <AppShell role="lender">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Lender Dashboard</h1>
          <p className="text-text-secondary">{lender.name} - Underwriting & Approvals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Approved"
            value={lender.approvedCount}
            icon={CheckCircle}
            color={COLORS.status.success}
          />
          <MetricCard
            label="Under Review"
            value={lender.merchants.length}
            icon={AccessTime}
            color={COLORS.status.warning}
          />
          <MetricCard
            label="Rejected"
            value={lender.rejectedCount}
            icon={WarningAmber}
            color={COLORS.status.error}
          />
          <MetricCard
            label="Approval Rate"
            value={`${Math.round((lender.approvedCount / (lender.approvedCount + lender.rejectedCount)) * 100)}%`}
            icon={TrendingUp}
            color={COLORS.primary}
          />
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy mb-6">Portfolio Risk</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pending Reviews */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy mb-6">Pending Reviews</h3>
            <div className="space-y-4">
              {lender.merchants.map((merchant) => {
                const traceScore = TRACE_SCORES[merchant.traderId];
                return (
                  <Link
                    key={merchant.traderId}
                    href={`/lender/merchants/${merchant.traderId}`}
                    className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-navy mb-1">{merchant.traderName}</h4>
                      <p className="text-sm text-text-secondary">
                        Requested: {formatNaira(merchant.requestedAmount)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-navy text-lg">{traceScore?.score || 0}</p>
                        <p className="text-xs text-text-secondary">TraceScore</p>
                      </div>
                      <StatusBadge status={merchant.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-navy mb-6">Top Merchants by TraceScore</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Business</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">TraceScore</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {allMerchants.slice(0, 5).map((merchant) => {
                  const traceScore = TRACE_SCORES[merchant.traderId];
                  const trader = TRADERS.find((t) => t.id === merchant.traderId);
                  return (
                    <tr
                      key={merchant.traderId}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/lender/merchants/${merchant.traderId}`}
                          className="font-semibold text-navy hover:underline"
                        >
                          {merchant.traderName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-bold text-navy">
                        {traceScore?.score || 0}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{trader?.category}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={merchant.status} />
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

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TraceScoreGauge } from "@/components/score/tracescore-gauge";
import { ScoreBreakdownCard } from "@/components/score/score-breakdown-card";
import { MetricCard } from "@/components/common/metric-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { REVENUE_TREND } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";
import { TrendingUp, ElectricBolt } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function TraceScorePage() {
  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">TraceScore</h1>
          <p className="text-text-secondary">Your real-time credit readiness score.</p>
        </div>

        {/* Main Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <TraceScoreGauge score={742} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ScoreBreakdownCard />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <ElectricBolt className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">You&apos;re Pre-Approved!</h4>
                  <p className="text-sm text-blue-700">
                    Based on your consistent payment history and strong transaction volume, you&apos;re eligible for up to
                    <strong> ₦500,000</strong> in restock capital. Contact a lender to get started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-navy mb-6">Revenue Trend (8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={REVENUE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
                formatter={(value) => formatNaira(value as number)}
              />
              <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capital Eligibility */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-navy mb-6">Capital Eligibility</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              label="Max Eligible Capital"
              value={formatNaira(500000)}
              icon={TrendingUp}
              color={COLORS.primary}
            />
            <MetricCard
              label="Interest Rate"
              value="18% APR"
              color={COLORS.primary}
            />
            <MetricCard
              label="Repayment Period"
              value="12 Months"
              color={COLORS.primary}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

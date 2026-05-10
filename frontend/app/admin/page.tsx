"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { formatNaira } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, People, Work, TrendingUp, CheckCircle, WarningAmber } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const platformTrend = [
  { month: "Jan", volume: 3200000, traders: 120, workers: 450 },
  { month: "Feb", volume: 4100000, traders: 145, workers: 520 },
  { month: "Mar", volume: 5200000, traders: 178, workers: 620 },
  { month: "Apr", volume: 6800000, traders: 220, workers: 780 },
  { month: "May", volume: 8900000, traders: 280, workers: 950 },
  { month: "Jun", volume: 12500000, traders: 342, workers: 1205 },
];

const PLATFORM_STATS = {
  totalVolume: 12500000,
  activeTraders: 342,
  activeWorkers: 1205,
  completedJobs: 2847,
  capitalApproved: 45000000,
  paymentSuccess: 98.7,
};

const recentActivity = [
  { timestamp: "2 min ago", event: "New trader registered: Kemi Snacks", type: "signup" },
  { timestamp: "15 min ago", event: "Capital approved: ₦500K to Amaka Foods", type: "approval" },
  { timestamp: "1 hour ago", event: "Job completed: 5 workers paid for jobs", type: "completion" },
  { timestamp: "3 hours ago", event: "New lender onboarded: Growth Finance", type: "lender" },
  { timestamp: "5 hours ago", event: "TraceScore updated for 12 merchants", type: "score" },
];

export default function AdminDashboardPage() {
  return (
    <AppShell role="admin">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Platform Overview</h1>
          <p className="text-text-secondary">System-wide metrics and activity</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="Total Volume"
            value={formatNaira(PLATFORM_STATS.totalVolume)}
            icon={<Wallet sx={{ fontSize: "28px", color: COLORS.primary }} />}
            trend={28}
            color={COLORS.primary}
          />
          <MetricCard
            label="Active Traders"
            value={PLATFORM_STATS.activeTraders}
            icon={<TrendingUp sx={{ fontSize: "28px", color: COLORS.role.trader }} />}
            trend={15}
            color={COLORS.role.trader}
          />
          <MetricCard
            label="Active Workers"
            value={PLATFORM_STATS.activeWorkers}
            icon={<People sx={{ fontSize: "28px", color: COLORS.role.worker }} />}
            trend={22}
            color={COLORS.role.worker}
          />
          <MetricCard
            label="Completed Jobs"
            value={PLATFORM_STATS.completedJobs}
            icon={<Work sx={{ fontSize: "28px", color: COLORS.primary }} />}
            trend={35}
            color={COLORS.primary}
          />
          <MetricCard
            label="Capital Approved"
            value={formatNaira(PLATFORM_STATS.capitalApproved)}
            icon={<CheckCircle sx={{ fontSize: "28px", color: COLORS.status.success }} />}
            trend={18}
            color={COLORS.status.success}
          />
          <MetricCard
            label="Payment Success Rate"
            value={`${PLATFORM_STATS.paymentSuccess}%`}
            icon={<WarningAmber sx={{ fontSize: "28px", color: COLORS.role.lender }} />}
            color={COLORS.role.lender}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Volume Trend */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-6">Volume Trend (6 months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                  }}
                  formatter={(value) => formatNaira(value as number)}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: COLORS.primary }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy line-clamp-2">{activity.event}</p>
                    <p className="text-xs text-text-secondary mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-6">User Growth (Last 6 Months)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Month</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Volume</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Active Traders</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Active Workers</th>
                </tr>
              </thead>
              <tbody>
                {platformTrend.map((month) => (
                  <tr key={month.month} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-navy">{month.month}</td>
                    <td className="px-6 py-4 text-navy">{formatNaira(month.volume)}</td>
                    <td className="px-6 py-4 text-navy">
                      <span className="text-green-600 font-semibold">+{month.traders}</span>
                    </td>
                    <td className="px-6 py-4 text-navy">
                      <span className="text-blue-600 font-semibold">+{month.workers}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

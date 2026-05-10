"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { JOBS } from "@/lib/mock-data";
import { WORKERS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, People, CheckCircle, EmojiEvents, Work } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const earningsData = [
  { week: "Week 1", earnings: 35000 },
  { week: "Week 2", earnings: 52000 },
  { week: "Week 3", earnings: 48000 },
  { week: "Week 4", earnings: 58000 },
  { week: "Week 5", earnings: 62000 },
  { week: "Week 6", earnings: 45000 },
];

export default function WorkerDashboardPage() {
  // Get first worker as current user
  const currentWorker = WORKERS[0];
  const recommendedJobs = JOBS.slice(0, 3);

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {currentWorker.name}! Here&apos;s your overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            label="Total Earnings"
            value={formatNaira(currentWorker.totalEarnings)}
            icon={TrendingUp}
            color={COLORS.primary}
          />
          <MetricCard
            label="Jobs Completed"
            value={currentWorker.jobsCompleted}
            icon={CheckCircle}
            color={COLORS.status.success}
          />
          <MetricCard
            label="Reliability Score"
            value={`${currentWorker.reliabilityScore}%`}
            icon={EmojiEvents}
            color={COLORS.role.lender}
          />
          <MetricCard
            label="Available Jobs"
            value={JOBS.length}
            icon={Work}
            color={COLORS.primary}
          />
          <MetricCard
            label="Active Applications"
            value="2"
            icon={<People sx={{ fontSize: "28px" }} />}
            color={COLORS.role.worker}
          />
        </div>

        {/* Earnings Chart and Recommended Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy mb-6">Earnings (Last 6 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                  }}
                  formatter={(value) => formatNaira(value as number)}
                />
                <Bar dataKey="earnings" fill={COLORS.role.worker} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Recommended Jobs</h3>
            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <a
                  key={job.id}
                  href={`/marketplace/${job.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-sm text-navy">{job.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{job.traderName}</p>
                  <p className="text-sm font-bold text-primary mt-2">{formatNaira(job.pay)}/day</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

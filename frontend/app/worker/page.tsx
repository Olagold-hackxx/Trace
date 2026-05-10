"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { JOBS } from "@/lib/mock-data";
import { WORKERS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, People, CheckCircle, EmojiEvents, Work } from "@mui/icons-material";

const earningsData = [
  { week: "Week 1", earnings: 35000 },
  { week: "Week 2", earnings: 52000 },
  { week: "Week 3", earnings: 48000 },
  { week: "Week 4", earnings: 58000 },
  { week: "Week 5", earnings: 62000 },
  { week: "Week 6", earnings: 45000 },
];

export default function WorkerDashboardPage() {
  const currentWorker = WORKERS[0];
  const recommendedJobs = JOBS.slice(0, 3);

  return (
    <AppShell role="worker">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Worker Portal</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Welcome back, {currentWorker.name} 👋</h1>
          <p className="text-[#5C5A78] mt-1">{currentWorker.school} · {currentWorker.location}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Earnings", value: formatNaira(currentWorker.totalEarnings), icon: TrendingUp, color: "#A855F7" },
            { label: "Jobs Completed", value: currentWorker.jobsCompleted, icon: CheckCircle, color: "#22C55E" },
            { label: "Reliability Score", value: `${currentWorker.reliabilityScore}%`, icon: EmojiEvents, color: "#F5A623" },
            { label: "Available Jobs", value: JOBS.length, icon: Work, color: "#FF6B35" },
            { label: "Active Applications", value: "2", icon: People, color: "#3B82F6" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <MetricCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={<Icon sx={{ fontSize: "22px", color: s.color }} />}
                color={s.color}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <h3 className="text-lg font-black text-[#F0EFE8] mb-6">Earnings (Last 6 Weeks)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C2E" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#5C5A78", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5C5A78", fontSize: 11 }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", borderRadius: "12px", color: "#F0EFE8" }}
                  formatter={(value) => [formatNaira(value as number), "Earnings"]}
                  cursor={{ fill: "rgba(168,85,247,0.08)" }}
                />
                <Bar dataKey="earnings" fill="#A855F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <h3 className="text-lg font-black text-[#F0EFE8] mb-4">Recommended Jobs</h3>
            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <a
                  key={job.id}
                  href={`/marketplace/${job.id}`}
                  className="block rounded-2xl p-4 transition-all hover:bg-[#0F0F1A]"
                  style={{ border: "1px solid #2A2A40" }}
                >
                  <p className="font-black text-sm text-[#F0EFE8]">{job.title}</p>
                  <p className="text-xs text-[#5C5A78] mt-0.5">{job.traderName}</p>
                  <p className="text-base font-black mt-2" style={{ color: "#A855F7" }}>{formatNaira(job.pay)}/day</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

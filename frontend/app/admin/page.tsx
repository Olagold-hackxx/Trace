"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { formatNaira } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, People, Work, TrendingUp, CheckCircle } from "@mui/icons-material";

const platformTrend = [
  { month: "Jan", volume: 3200000, traders: 120, workers: 450 },
  { month: "Feb", volume: 4100000, traders: 145, workers: 520 },
  { month: "Mar", volume: 5200000, traders: 178, workers: 620 },
  { month: "Apr", volume: 6800000, traders: 220, workers: 780 },
  { month: "May", volume: 8900000, traders: 280, workers: 950 },
  { month: "Jun", volume: 12500000, traders: 342, workers: 1205 },
];

const recentActivity = [
  { timestamp: "2 min ago", event: "New trader registered: Kemi Snacks", color: "#FF6B35" },
  { timestamp: "15 min ago", event: "Capital approved: ₦500K to Amaka Foods", color: "#22C55E" },
  { timestamp: "1 hour ago", event: "Job completed: 5 workers paid", color: "#F5A623" },
  { timestamp: "3 hours ago", event: "New lender onboarded: Growth Finance", color: "#3B82F6" },
  { timestamp: "5 hours ago", event: "TraceScore updated for 12 merchants", color: "#A855F7" },
];

const STATS = { totalVolume: 12500000, activeTraders: 342, activeWorkers: 1205, completedJobs: 2847, capitalApproved: 45000000, paymentSuccess: 98.7 };

export default function AdminDashboardPage() {
  return (
    <AppShell role="admin">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Admin Portal</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Platform Overview</h1>
          <p className="text-[#5C5A78] mt-1">System-wide metrics and activity — Trace Technologies.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Total Volume" value={formatNaira(STATS.totalVolume)} icon={<Wallet sx={{ fontSize: "22px", color: "#FF6B35" }} />} trend={28} color="#FF6B35" />
          <MetricCard label="Active Traders" value={STATS.activeTraders} icon={<TrendingUp sx={{ fontSize: "22px", color: "#F5A623" }} />} trend={15} color="#F5A623" />
          <MetricCard label="Active Workers" value={STATS.activeWorkers} icon={<People sx={{ fontSize: "22px", color: "#A855F7" }} />} trend={22} color="#A855F7" />
          <MetricCard label="Completed Jobs" value={STATS.completedJobs} icon={<Work sx={{ fontSize: "22px", color: "#3B82F6" }} />} trend={35} color="#3B82F6" />
          <MetricCard label="Capital Approved" value={formatNaira(STATS.capitalApproved)} icon={<CheckCircle sx={{ fontSize: "22px", color: "#22C55E" }} />} trend={18} color="#22C55E" />
          <MetricCard label="Payment Success" value={`${STATS.paymentSuccess}%`} icon={<CheckCircle sx={{ fontSize: "22px", color: "#22C55E" }} />} color="#22C55E" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <h2 className="text-lg font-black text-[#F0EFE8] mb-6">Volume Trend (6 months)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={platformTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C2E" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", borderRadius: "12px", color: "#F0EFE8" }}
                  formatter={(value) => [formatNaira(value as number), "Volume"]}
                />
                <Line type="monotone" dataKey="volume" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: "#FF6B35", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <h2 className="text-lg font-black text-[#F0EFE8] mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 last:pb-0" style={{ borderBottom: i < recentActivity.length - 1 ? "1px solid #1C1C2E" : "none" }}>
                  <div className="w-2 h-2 rounded-full mt-2 flex-none" style={{ backgroundColor: activity.color }} />
                  <div>
                    <p className="text-sm text-[#F0EFE8] leading-5">{activity.event}</p>
                    <p className="text-xs text-[#3A3A58] mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #1C1C2E" }}>
            <h2 className="text-lg font-black text-[#F0EFE8]">User Growth (Last 6 Months)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1C1C2E" }}>
                  {["Month", "Volume", "Active Traders", "Active Workers"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#5C5A78]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformTrend.map((m, i) => (
                  <tr key={m.month} className="hover:bg-[#0F0F1A] transition-colors" style={{ borderBottom: i < platformTrend.length - 1 ? "1px solid #1C1C2E" : "none" }}>
                    <td className="px-6 py-4 font-black text-[#F0EFE8]">{m.month}</td>
                    <td className="px-6 py-4 text-[#9B99B5]">{formatNaira(m.volume)}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#F5A623" }}>+{m.traders}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "#A855F7" }}>+{m.workers}</td>
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

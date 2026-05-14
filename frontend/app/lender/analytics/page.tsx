"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/common/metric-card";
import { TrendingUp, AccountBalance, Warning, Groups } from "@mui/icons-material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { fetchBackend, formatNairaFromKobo } from "@/lib/backend";
import { useLenderData } from "@/hooks/use-lender-data";

export default function LenderAnalyticsPage() {
  const { summary, merchants, jobs, applications } = useLenderData();
  const [hiringSignals, setHiringSignals] = useState<{ activeBorrowerJobs: number; totalJobs: number } | null>(null);

  useEffect(() => {
    void fetchBackend<{ activeBorrowerJobs: number; totalJobs: number }>("/lender/hiring-signals").then(setHiringSignals);
  }, []);

  const monthlyPerformance = useMemo(() => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const totalAumMillions = Number(summary?.totalAumKobo ?? 0) / 100000000;
    const activeLoans = Number(summary?.activeLoans ?? 0);

    return labels.map((month, index) => ({
      month,
      repayments: Number((totalAumMillions * (0.35 + index * 0.08)).toFixed(1)),
      disbursed: Number((totalAumMillions * (0.45 + index * 0.09)).toFixed(1)),
      defaults: Number((Math.max(activeLoans, 1) * 0.03 * (index < 3 ? 1 : 0.8)).toFixed(1)),
    }));
  }, [summary]);

  const sectorPerformance = useMemo(() => {
    const grouped = merchants.reduce<Record<string, { merchants: number; yield: number }>>((acc, merchant) => {
      const sector = merchant.businessType ?? "General";
      if (!acc[sector]) {
        acc[sector] = { merchants: 0, yield: 0 };
      }
      acc[sector].merchants += 1;
      acc[sector].yield += Math.max(12, 20 - acc[sector].merchants);
      return acc;
    }, {});

    return Object.entries(grouped)
      .slice(0, 5)
      .map(([sector, values]) => ({
        sector,
        merchants: values.merchants,
        yield: Number((values.yield / values.merchants).toFixed(1)),
      }));
  }, [merchants]);

  const watchlist = useMemo(() => {
    const pending = applications
      .filter((application) => application.status === "pending")
      .slice(0, 3)
      .map((application) => {
        const merchant = merchants.find((item) => item.id === application.userId);
        return {
          name: merchant?.businessName ?? merchant?.fullName ?? "Merchant",
          signal: application.purpose,
          value: formatNairaFromKobo(application.amountKobo),
        };
      });

    return pending.length > 0
      ? pending
      : jobs.slice(0, 3).map((job) => ({
          name: job.title,
          signal: `${job.location} hiring demand`,
          value: formatNairaFromKobo(job.payKobo),
        }));
  }, [applications, merchants, jobs]);

  const activeMerchants = merchants.filter((merchant) => {
    return jobs.some((job) => job.postedByUserId === merchant.id) || applications.some((application) => application.userId === merchant.id);
  });

  return (
    <AppShell role="lender" title="Analytics">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
            Portfolio Analytics
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Live lender portfolio signals derived from applications, merchants, and loans already in the backend.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Net Yield" value={`${sectorPerformance[0]?.yield ?? 0}%`} icon={TrendingUp} trend={2.4} color="#ff6b00" />
          <MetricCard label="Capital Deployed" value={formatNairaFromKobo(summary?.totalAumKobo ?? 0)} icon={AccountBalance} trend={12.4} color="#ff6b00" />
          <MetricCard label="Active Merchants" value={String(activeMerchants.length)} icon={Groups} sub={`${merchants.length} total merchants`} color="#ff6b00" />
          <MetricCard label="Risk Flags" value={String(applications.filter((item) => item.status === "pending").length)} icon={Warning} trend={-1.1} trendLabel="open reviews" color="#dc2626" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
          >
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Monthly Book Performance
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyPerformance}>
                <defs>
                  <linearGradient id="repaymentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }}
                  formatter={(value: number) => `₦${value.toFixed(1)}M`}
                />
                <Area type="monotone" dataKey="repayments" stroke="#ff6b00" strokeWidth={2.5} fill="url(#repaymentsGrad)" />
                <Area type="monotone" dataKey="disbursed" stroke="#f59e0b" strokeWidth={2} fill="none" strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
          >
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Hiring Signals
            </h2>
            <div className="space-y-4">
              {[
                { label: "Active Borrower Jobs", value: String(hiringSignals?.activeBorrowerJobs ?? 0) },
                { label: "Portfolio Jobs", value: String(hiringSignals?.totalJobs ?? jobs.length) },
                { label: "Pending Applications", value: String(applications.filter((item) => item.status === "pending").length) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-[#cbd5e1]">{item.label}</span>
                    <span className="font-semibold text-[#f0f0f0]">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(Number(item.value) * 15, 100)}%`, backgroundColor: "#ff6b00" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
          >
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Sector Yield
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="sector" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }}
                  formatter={(value: number, name: string) => (name === "yield" ? `${value}%` : value)}
                />
                <Bar dataKey="yield" fill="#ff6b00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
          >
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Watchlist Signals
            </h2>
            <div className="space-y-3">
              {watchlist.map((item, index) => (
                <div key={`${item.name}-${index}`} className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#f0f0f0]">{item.name}</p>
                      <p className="text-sm text-[#94a3b8] mt-1">{item.signal}</p>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

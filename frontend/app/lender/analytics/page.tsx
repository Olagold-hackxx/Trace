"use client";

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

const monthlyPerformance = [
  { month: "Dec", repayments: 4.2, disbursed: 5.1, defaults: 0.3 },
  { month: "Jan", repayments: 4.8, disbursed: 5.6, defaults: 0.2 },
  { month: "Feb", repayments: 5.4, disbursed: 6.1, defaults: 0.4 },
  { month: "Mar", repayments: 6.2, disbursed: 7.2, defaults: 0.3 },
  { month: "Apr", repayments: 7.1, disbursed: 8.3, defaults: 0.2 },
  { month: "May", repayments: 8.9, disbursed: 9.8, defaults: 0.2 },
];

const sectorPerformance = [
  { sector: "Food", yield: 18.2, merchants: 14 },
  { sector: "Retail", yield: 16.4, merchants: 5 },
  { sector: "Logistics", yield: 15.1, merchants: 2 },
  { sector: "Fashion", yield: 14.6, merchants: 1 },
  { sector: "Services", yield: 13.8, merchants: 1 },
];

const watchlist = [
  { name: "BabaChef Catering", signal: "Collections slowing", value: "3 days late" },
  { name: "TechFix Lagos", signal: "Hiring demand weak", value: "3 applicants" },
  { name: "Fashion Hub", signal: "Revenue volatility", value: "-18% MoM" },
];

export default function LenderAnalyticsPage() {
  return (
    <AppShell role="lender" title="Analytics">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
            Portfolio Analytics
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Performance, repayment quality, and borrower risk signals across your lender book.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Net Yield" value="17.8%" icon={TrendingUp} trend={2.4} color="#ff6b00" />
          <MetricCard label="Capital Deployed" value="₦45.0M" icon={AccountBalance} trend={12.4} color="#ff6b00" />
          <MetricCard label="Active Merchants" value="23" icon={Groups} sub="19 performing on track" color="#ff6b00" />
          <MetricCard label="Risk Flags" value="4" icon={Warning} trend={-1.1} trendLabel="vs last month" color="#dc2626" />
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
              Default Leakage
            </h2>
            <div className="space-y-4">
              {monthlyPerformance.map((item) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-[#cbd5e1]">{item.month}</span>
                    <span className="font-semibold text-[#f0f0f0]">₦{item.defaults.toFixed(1)}M</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                    <div className="h-full rounded-full" style={{ width: `${item.defaults * 20}%`, backgroundColor: "#dc2626" }} />
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
              {watchlist.map((item) => (
                <div key={item.name} className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
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

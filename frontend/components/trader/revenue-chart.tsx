"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { REVENUE_DATA } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";

export function RevenueChart() {
  return (
    <div
      className="rounded-3xl p-6"
      style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#F0EFE8]">Weekly Revenue</h3>
          <p className="text-sm text-[#5C5A78] mt-0.5">Mon – Sun this week</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
          +14% vs last week
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={REVENUE_DATA} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1C1C2E" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#5C5A78", fontSize: 12 }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1C1C2E", border: "1px solid #2A2A40", borderRadius: "12px", color: "#F0EFE8" }}
            formatter={(value) => [formatNaira(value as number), "Revenue"]}
            cursor={{ fill: "rgba(255,107,53,0.08)" }}
          />
          <Bar dataKey="revenue" fill="#FF6B35" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

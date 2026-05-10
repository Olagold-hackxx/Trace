"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { REVENUE_DATA } from "@/lib/mock-data";
import { COLORS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export function RevenueChart() {
  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-navy mb-6">Weekly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={REVENUE_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
            formatter={(value) => formatNaira(value as number)}
          />
          <Bar dataKey="revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

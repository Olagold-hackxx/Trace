"use client";

import { MetricCard } from "@/components/common/metric-card";
import { formatNaira } from "@/lib/utils";
import { Wallet, TrendingUp, Work } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export function TraderDashboardCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Available Balance"
        value={formatNaira(245500)}
        icon={<Wallet sx={{ fontSize: "22px", color: COLORS.primary }} />}
        trend={12}
        color={COLORS.primary}
      />
      <MetricCard
        label="Weekly Revenue"
        value={formatNaira(1825000)}
        icon={<TrendingUp sx={{ fontSize: "22px", color: COLORS.status.success }} />}
        trend={8}
        color={COLORS.status.success}
      />
      <MetricCard
        label="Active Jobs"
        value="5"
        icon={<Work sx={{ fontSize: "22px", color: "#A855F7" }} />}
        trend={2}
        trendLabel="new this week"
        color="#A855F7"
      />
      <MetricCard
        label="TraceScore"
        value="742"
        icon={<TrendingUp sx={{ fontSize: "22px", color: "#F5A623" }} />}
        trend={5}
        trendLabel="from last month"
        color="#F5A623"
      />
    </div>
  );
}

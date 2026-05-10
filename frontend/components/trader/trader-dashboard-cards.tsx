"use client";

import { MetricCard } from "@/components/common/metric-card";
import { formatNaira } from "@/lib/utils";
import { Wallet, TrendingUp, Work, Payment } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export function TraderDashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Available Balance"
        value={formatNaira(245500)}
        icon={<Wallet sx={{ fontSize: "28px", color: COLORS.primary }} />}
        trend={12}
        color={COLORS.primary}
      />
      <MetricCard
        label="This Week's Revenue"
        value={formatNaira(1825000)}
        icon={<TrendingUp sx={{ fontSize: "28px", color: COLORS.status.success }} />}
        trend={8}
        color={COLORS.status.success}
      />
      <MetricCard
        label="Active Jobs"
        value="5"
        icon={<Work sx={{ fontSize: "28px", color: COLORS.primary }} />}
        trend={2}
        trendLabel="new this week"
        color={COLORS.primary}
      />
      <MetricCard
        label="TraceScore"
        value="742"
        icon={<Payment sx={{ fontSize: "28px", color: COLORS.role.lender }} />}
        trend={5}
        trendLabel="from last month"
        color={COLORS.role.lender}
      />
    </div>
  );
}

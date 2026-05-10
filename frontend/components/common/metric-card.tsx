import { createElement, isValidElement, type ElementType, type ReactNode } from "react";
import { COLORS } from "@/lib/constants";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode | ElementType;
  trend?: number;
  trendLabel?: string;
  color?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel = "vs last week",
  color = COLORS.primary,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const iconNode = isValidElement(icon)
    ? icon
    : icon && (typeof icon === "function" || typeof icon === "object")
      ? createElement(icon as ElementType, { sx: { fontSize: "24px", color } })
      : null;

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-[#5C5A78] mb-3">{label}</p>
          <p className="text-2xl font-black text-[#F0EFE8]">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-bold ${isPositive ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-[#3A3A58]">{trendLabel}</span>
            </div>
          )}
        </div>
        {iconNode && (
          <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
            {iconNode}
          </div>
        )}
      </div>
    </div>
  );
}

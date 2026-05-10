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
  const isPositive = trend && trend >= 0;
  const iconNode = isValidElement(icon)
    ? icon
    : icon && (typeof icon === "function" || typeof icon === "object")
      ? createElement(icon as ElementType, {
          sx: { fontSize: "28px", color },
        })
      : null;

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#e2e8f0" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-3">{label}</p>
          <p className="text-3xl font-bold text-navy">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              <p className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
              </p>
              <p className="text-xs text-gray-500">{trendLabel}</p>
            </div>
          )}
        </div>
        {iconNode && (
          <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
            {iconNode}
          </div>
        )}
      </div>
    </div>
  );
}

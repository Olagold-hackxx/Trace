import { createElement, isValidElement, type ElementType, type ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode | ElementType;
  trend?: number;
  trendLabel?: string;
  color?: string;
  sub?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel = "vs last month",
  color = "#ff6b00",
  sub,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const iconNode = isValidElement(icon)
    ? icon
    : icon && (typeof icon === "function" || typeof icon === "object")
    ? createElement(icon as ElementType, { sx: { fontSize: "22px" }, style: { color } })
    : null;

  return (
    <div
      className="rounded-2xl p-5 bg-white transition-all hover:shadow-md"
      style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#8e7164] mb-2">{label}</p>
          <p
            className="text-2xl font-bold text-[#261812] truncate"
            style={{ fontFamily: "Epilogue, sans-serif" }}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-[#8e7164] mt-1">{sub}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isPositive ? "#dcfce7" : "#fee2e2",
                  color: isPositive ? "#16a34a" : "#dc2626",
                }}
              >
                {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-[#8e7164]">{trendLabel}</span>
            </div>
          )}
        </div>
        {iconNode && (
          <div
            className="p-3 rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            {iconNode}
          </div>
        )}
      </div>
    </div>
  );
}

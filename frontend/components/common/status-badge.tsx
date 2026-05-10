interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  approved:      { bg: "#22C55E20", color: "#22C55E", label: "Approved" },
  completed:     { bg: "#22C55E20", color: "#22C55E", label: "Completed" },
  paid:          { bg: "#22C55E20", color: "#22C55E", label: "Paid" },
  success:       { bg: "#22C55E20", color: "#22C55E", label: "Success" },
  active:        { bg: "#3B82F620", color: "#3B82F6", label: "Active" },
  pending:       { bg: "#F59E0B20", color: "#F59E0B", label: "Pending" },
  under_review:  { bg: "#3B82F620", color: "#3B82F6", label: "Under Review" },
  pending_review:{ bg: "#F59E0B20", color: "#F59E0B", label: "Pending Review" },
  rejected:      { bg: "#EF444420", color: "#EF4444", label: "Rejected" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = statusMap[status] ?? statusMap.pending;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${className ?? ""}`}
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

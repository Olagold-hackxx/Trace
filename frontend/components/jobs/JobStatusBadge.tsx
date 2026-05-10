import { titleCaseStatus } from "@/lib/jobs";

export function JobStatusBadge({ status }: { status: string }) {
  const statusClass =
    {
      pending: "open",
      accepted: "active",
      rejected: "cancelled"
    }[status] ?? status;

  return <span className={`badge job-status-${statusClass}`}>{titleCaseStatus(status)}</span>;
}

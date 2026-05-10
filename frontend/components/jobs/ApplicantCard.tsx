import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import type { JobApplication } from "@/lib/jobs";

export function ApplicantCard({ applicant }: { applicant: JobApplication }) {
  return (
    <div className="applicant-card">
      <div className="applicant-info">
        <div className="applicant-name">{applicant.applicant_name}</div>
        <div className="applicant-meta">
          {applicant.applicant_role_context} · {applicant.location} · Reliability{" "}
          {applicant.reliabilityScore}
        </div>
        <div className="subtitle">{applicant.message}</div>
      </div>
      <div className="button-cluster">
        <JobStatusBadge
          status={applicant.status === "accepted" ? "active" : applicant.status}
        />
        <button className="button-secondary">Review</button>
      </div>
    </div>
  );
}

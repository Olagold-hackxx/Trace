import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import type { JobApplication } from "@/lib/jobs";

export function ApplicantRow({ applicant }: { applicant: JobApplication }) {
  return (
    <tr>
      <td>{applicant.applicant_name}</td>
      <td>{applicant.applicant_role_context}</td>
      <td>{applicant.location}</td>
      <td>{applicant.reliabilityScore}</td>
      <td>
        <JobStatusBadge status={applicant.status === "accepted" ? "active" : applicant.status} />
      </td>
      <td>
        <div className="button-cluster">
          <button className="button-secondary">Accept</button>
          <button className="button-secondary">Reject</button>
        </div>
      </td>
    </tr>
  );
}

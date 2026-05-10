import Link from "next/link";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { formatNaira, type Job } from "@/lib/jobs";

type JobTableProps = {
  jobs: Job[];
  basePath: string;
};

export function JobTable({ jobs, basePath }: JobTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Category</th>
            <th>Pay</th>
            <th>Applicants</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.category}</td>
              <td>{formatNaira(job.pay_amount_kobo)}</td>
              <td>{job.applicants}</td>
              <td>
                <JobStatusBadge status={job.status} />
              </td>
              <td>{new Date(job.created_at).toLocaleDateString("en-NG")}</td>
              <td>
                <Link className="button-secondary" href={`${basePath}/${job.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

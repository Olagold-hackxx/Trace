import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import type { Job } from "@/lib/jobs";

export function TraderJobSummary({ jobs }: { jobs: Job[] }) {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h3>Trader Jobs Layer</h3>
          <p className="subtitle">
            Traders can post work, apply to opportunities, manage active jobs, and release worker
            payment from the same side of KudiScore.
          </p>
        </div>
        <Link href="/trader/jobs" className="button-secondary">
          Open Jobs
        </Link>
      </div>
      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} href={`/trader/jobs/${job.id}`} />
        ))}
      </div>
    </div>
  );
}

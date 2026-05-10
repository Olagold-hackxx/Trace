import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import type { Job } from "@/lib/jobs";

export function LenderJobSummary({ jobs }: { jobs: Job[] }) {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h3>Field Jobs and Operations</h3>
          <p className="subtitle">
            Lenders can use jobs for verification, survey work, collections support, and merchant
            onboarding without splitting the experience into a separate worker interface.
          </p>
        </div>
        <Link href="/lender/jobs" className="button-secondary">
          Open Jobs
        </Link>
      </div>
      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} href={`/lender/jobs/${job.id}`} />
        ))}
      </div>
    </div>
  );
}

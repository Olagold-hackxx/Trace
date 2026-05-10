import { JobCard } from "@/components/jobs/JobCard";
import { ApplicantCard } from "@/components/jobs/ApplicantCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { applicants, jobs } from "@/lib/mock-data";

export default function AdminJobsPage() {
  return (
    <main className="landing-shell">
      <div className="landing-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin Jobs</span>
            <h1>Monitor the shared jobs layer across trader and lender activity.</h1>
            <p className="subtitle">
              This overview page lets an admin inspect how jobs are being created, applied to,
              assigned, completed, and paid without introducing a separate worker application.
            </p>
          </div>
        </div>
        <SectionCard title="Jobs overview" subtitle="All mock jobs in the system right now.">
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                href={job.creator_role_context === "trader" ? `/trader/jobs/${job.id}` : `/lender/jobs/${job.id}`}
              />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Applicants overview" subtitle="Applicants come from trader, lender, or general user contexts.">
          <div className="applicant-list">
            {applicants.map((applicant) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

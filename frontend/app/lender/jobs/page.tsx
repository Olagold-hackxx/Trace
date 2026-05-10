import { JobCard } from "@/components/jobs/JobCard";
import { JobTable } from "@/components/jobs/JobTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { jobs } from "@/lib/mock-data";

const tabs = ["My Jobs", "Available Jobs", "Applied", "Active", "Completed"];

export default function LenderJobsPage() {
  const lenderJobs = jobs.filter((job) => job.creator_role_context === "lender");

  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>Jobs</h1>
            <p className="subtitle">
              Create field tasks, verification jobs, surveys, and operational work.
            </p>
          </div>
          <div className="button-row">
            <a className="button" href="/lender/jobs/new">
              Create Job
            </a>
            <a className="button-secondary" href="#lender-available-jobs">
              Find Jobs
            </a>
          </div>
        </div>

        <section className="stat-grid">
          <StatCard label="Jobs Posted" value="19" foot="Verification and field operations" />
          <StatCard label="Field Tasks Active" value="6" foot="Workers assigned across regions" />
          <StatCard label="Applications" value="29" foot="Job interest from mixed user roles" />
          <StatCard label="Completed Jobs" value="41" foot="Proof collected and payouts tracked" />
        </section>

        <div className="jobs-tabs">
          {tabs.map((tab, index) => (
            <div key={tab} className={`jobs-tab ${index === 0 ? "active" : ""}`}>
              {tab}
            </div>
          ))}
        </div>

        <SectionCard
          title="My Jobs"
          subtitle="Lenders use this board to create operational tasks such as field verification, KYC collection, market survey work, loan follow-up, and merchant onboarding."
        >
          <JobTable jobs={lenderJobs} basePath="/lender/jobs" />
        </SectionCard>

        <SectionCard
          title="Available Jobs"
          subtitle="Lenders can also apply to jobs when needed. This keeps the role flexible and avoids artificial product silos."
        >
          <div id="lender-available-jobs" className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} href={`/lender/jobs/${job.id}`} />
            ))}
          </div>
        </SectionCard>

        <section className="two-col">
          <SectionCard title="Operational examples" subtitle="Common lender-side work that belongs in the jobs layer.">
            <ul className="checklist">
              <li>Field agent needed for shop verification.</li>
              <li>Market survey assistant.</li>
              <li>KYC document collector.</li>
              <li>Repayment follow-up agent.</li>
              <li>Business location checker.</li>
              <li>Merchant onboarding assistant.</li>
            </ul>
          </SectionCard>
          <SectionCard title="Why this page is shared" subtitle="The accepted applicant is simply the worker for the task, regardless of their main account context.">
            <p className="subtitle">
              A lender can create jobs, manage jobs, and pay workers here. The same lender can also
              apply to a job created by a trader if that work fits their context.
            </p>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

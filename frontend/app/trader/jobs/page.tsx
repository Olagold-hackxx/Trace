import { JobCard } from "@/components/jobs/JobCard";
import { JobTable } from "@/components/jobs/JobTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { jobs } from "@/lib/mock-data";

const tabs = ["My Jobs", "Available Jobs", "Applied", "Active", "Completed"];

export default function TraderJobsPage() {
  const traderJobs = jobs.filter((job) => job.creator_role_context === "trader");
  const activeJobs = jobs.filter((job) => job.status === "active");

  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>Jobs</h1>
            <p className="subtitle">
              Create work requests, find helpers, or earn from available tasks.
            </p>
          </div>
          <div className="button-row">
            <a className="button" href="/trader/jobs/new">
              Create Job
            </a>
            <a className="button-secondary" href="#available-jobs">
              Find Jobs
            </a>
          </div>
        </div>

        <section className="stat-grid">
          <StatCard label="Jobs Created" value="12" foot="Rush support and operating tasks" />
          <StatCard label="Active Jobs" value="4" foot="Workers currently assigned" />
          <StatCard label="Applications" value="18" foot="Across created and applied jobs" />
          <StatCard label="Completed Jobs" value="27" foot="Finished with payout trail" />
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
          subtitle="These are the jobs created by the trader, including staffing requests, temporary support, and operational work linked to business peaks."
        >
          <JobTable jobs={traderJobs} basePath="/trader/jobs" />
        </SectionCard>

        <SectionCard
          title="Available Jobs"
          subtitle="The trader can also apply to jobs created by others. That means a slower business day can become an income opportunity without leaving KudiScore."
        >
          <div id="available-jobs" className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} href={`/trader/jobs/${job.id}`} />
            ))}
          </div>
        </SectionCard>

        <section className="two-col">
          <SectionCard
            title="Active"
            subtitle="Work already assigned and in motion."
          >
            <JobTable jobs={activeJobs} basePath="/trader/jobs" />
          </SectionCard>
          <SectionCard
            title="Completed"
            subtitle="Finished jobs should create a visible payout and proof trail that strengthens trust across the platform."
          >
            <ul className="checklist">
              <li>Worker selected with reliability context.</li>
              <li>Completion proof uploaded or confirmed.</li>
              <li>Payment released without dispute.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

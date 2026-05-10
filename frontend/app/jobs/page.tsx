"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JOBS } from "@/lib/mock-data";
import { MetricCard } from "@/components/common/metric-card";
import { Work, People, CheckCircle } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  // Filter jobs for current trader
  const traderJobs = JOBS.filter((job) => job.traderId === "trader-1");
  const totalApplicants = traderJobs.reduce((sum, job) => sum + job.applicants, 0);
  const hiredCount = 24;

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-2">Jobs</h1>
            <p className="text-text-secondary">Post jobs and manage your worker hiring.</p>
          </div>
          <Button
            className="text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            Post New Job
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="Active Jobs"
            value={traderJobs.length}
            icon={Work}
            color={COLORS.primary}
          />
          <MetricCard
            label="Total Applicants"
            value={totalApplicants}
            icon={<People sx={{ fontSize: "28px" }} />}
            color={COLORS.role.worker}
          />
          <MetricCard
            label="Successfully Hired"
            value={hiredCount}
            icon={CheckCircle}
            color={COLORS.status.success}
          />
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">Active Job Postings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {traderJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                traderName={job.traderName}
                location={job.location}
                pay={job.pay}
                duration={job.duration}
                applicants={job.applicants}
                status={job.status}
                postedDate={job.postedDate}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

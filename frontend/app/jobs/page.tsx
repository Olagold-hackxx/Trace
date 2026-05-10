"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JOBS } from "@/lib/mock-data";
import { Work, People, CheckCircle, Add } from "@mui/icons-material";

export default function JobsPage() {
  const traderJobs = JOBS.filter((job) => job.traderId === "trader-1");
  const totalApplicants = traderJobs.reduce((sum, job) => sum + job.applicants, 0);

  return (
    <AppShell role="trader">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Trace Jobs</p>
            <h1 className="text-3xl font-black text-[#F0EFE8]">Job Postings</h1>
            <p className="text-[#5C5A78] mt-1">Post jobs, review applicants, hire reliable workers.</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "#FF6B35", boxShadow: "0 4px 20px rgba(255,107,53,0.35)" }}
          >
            <Add sx={{ fontSize: "20px" }} />
            Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Jobs", value: traderJobs.length, icon: Work, color: "#FF6B35" },
            { label: "Total Applicants", value: totalApplicants, icon: People, color: "#A855F7" },
            { label: "Successfully Hired", value: 24, icon: CheckCircle, color: "#22C55E" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-[#5C5A78]">{s.label}</p>
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${s.color}20` }}>
                    <Icon sx={{ fontSize: "18px", color: s.color }} />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#F0EFE8]">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Jobs grid */}
        <div>
          <h2 className="text-lg font-black text-[#F0EFE8] mb-4">Your Active Postings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

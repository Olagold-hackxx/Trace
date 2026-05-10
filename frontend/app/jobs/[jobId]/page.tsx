"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JOBS, JOB_APPLICANTS } from "@/lib/mock-data";
import { WORKERS } from "@/lib/constants";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { LocationOn , AccessTime, People } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function JobDetailPage({ params }: { params: { jobId: string } }) {
  const job = JOBS.find((j) => j.id === params.jobId);
  if (!job) {
    return (
      <AppShell role="trader">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <p className="text-navy text-lg">Job not found</p>
        </div>
      </AppShell>
    );
  }

  const applicants = JOB_APPLICANTS[job.id as keyof typeof JOB_APPLICANTS] || [];

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">{job.title}</h1>
              <p className="text-text-secondary">{job.traderName}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-text-secondary mb-1">Location</p>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <LocationOn sx={{ fontSize: "18px" }} />
                {job.location}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Duration</p>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <AccessTime sx={{ fontSize: "18px" }} />
                {job.duration}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Pay</p>
              <p className="text-navy font-semibold">{formatNaira(job.pay)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Category</p>
              <p className="text-navy font-semibold">{job.category}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy mb-3">Job Description</h2>
          <p className="text-text-secondary">{job.description}</p>
        </div>

        {/* Applicants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
              <People sx={{ fontSize: "20px" }} />
              Applicants ({applicants.length})
            </h2>
          </div>

          {applicants.length === 0 ? (
            <p className="text-text-secondary">No applicants yet</p>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => {
                const worker = WORKERS.find((w) => w.id === applicant.id);
                if (!worker) return null;

                return (
                  <div
                    key={applicant.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={worker.image}
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy">{worker.name}</h3>
                        <p className="text-sm text-text-secondary mb-2">{worker.school}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-navy font-medium">
                            Reliability: {worker.reliabilityScore}%
                          </span>
                          <span className="text-text-secondary">
                            {worker.jobsCompleted} jobs completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                        <span className="text-sm font-semibold text-blue-700">
                          {applicant.match}% Match
                        </span>
                      </div>
                      <Button
                        className="text-white"
                        style={{ backgroundColor: COLORS.primary }}
                        size="sm"
                      >
                        Hire
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

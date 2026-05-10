"use client";

import { JOB_APPLICANTS } from "@/lib/mock-data";
import { WORKERS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";

export function ApplicantsSection() {
  // Get top applicants from job-1
  const applicants = JOB_APPLICANTS["job-1"] || [];
  const topApplicants = applicants.slice(0, 4);

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-navy mb-6">Top Applicants</h3>

      <div className="space-y-4">
        {topApplicants.map((applicant) => {
          const worker = WORKERS.find((w) => w.id === applicant.id);
          if (!worker) return null;

          return (
            <div key={applicant.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-navy text-sm">{worker.name}</p>
                  <p className="text-xs text-text-secondary">
                    Reliability: {worker.reliabilityScore}%
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">{applicant.match}% Match</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{getRelativeTime(applicant.applied)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

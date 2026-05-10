"use client";

import { JOB_APPLICANTS } from "@/lib/mock-data";
import { WORKERS } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";

export function ApplicantsSection() {
  const applicants = JOB_APPLICANTS["job-1"] || [];
  const topApplicants = applicants.slice(0, 4);

  return (
    <div className="rounded-3xl p-6 h-full" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#F0EFE8]">Top Applicants</h3>
          <p className="text-sm text-[#5C5A78] mt-0.5">For your latest job post</p>
        </div>
        <span className="text-xs font-bold text-[#5C5A78]">{topApplicants.length} pending</span>
      </div>

      <div className="space-y-3">
        {topApplicants.map((applicant) => {
          const worker = WORKERS.find((w) => w.id === applicant.id);
          if (!worker) return null;
          return (
            <div
              key={applicant.id}
              className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-[#0F0F1A]"
              style={{ border: "1px solid #2A2A40" }}
            >
              <img
                src={worker.image}
                alt={worker.name}
                className="w-10 h-10 rounded-xl object-cover object-top flex-none"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#F0EFE8] truncate">{worker.name}</p>
                <p className="text-xs text-[#5C5A78]">Reliability {worker.reliabilityScore}% · {worker.school}</p>
              </div>
              <div
                className="text-xs font-black px-2.5 py-1 rounded-full flex-none"
                style={{ backgroundColor: "#FF6B3520", color: "#FF6B35" }}
              >
                {applicant.match}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

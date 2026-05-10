"use client";

import Link from "next/link";
import { JOBS } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";
import { ArrowForward, People, LocationOn, Schedule } from "@mui/icons-material";

export function ActiveJobsSection() {
  const activeJobs = JOBS.filter((job) => job.traderId === "trader-1").slice(0, 3);

  return (
    <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#F0EFE8]">Active Job Postings</h3>
          <p className="text-sm text-[#5C5A78] mt-0.5">Workers you currently need</p>
        </div>
        <Link href="/jobs" className="flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: "#FF6B35" }}>
          View All <ArrowForward sx={{ fontSize: "18px" }} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-[#FF6B35]/50"
            style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}
              >
                {job.status}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#5C5A78]">
                <People sx={{ fontSize: "14px" }} />
                <span>{job.applicants} applicants</span>
              </div>
            </div>

            <h4 className="font-black text-[#F0EFE8] mb-3">{job.title}</h4>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-[#5C5A78]">
                <LocationOn sx={{ fontSize: "14px", color: "#FF6B35" }} />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5C5A78]">
                <Schedule sx={{ fontSize: "14px", color: "#FF6B35" }} />
                {job.duration}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #2A2A40" }}>
              <span className="text-lg font-black" style={{ color: "#FF6B35" }}>{formatNaira(job.pay)}</span>
              <ArrowForward sx={{ fontSize: "16px", color: "#5C5A78" }} className="group-hover:text-[#FF6B35] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

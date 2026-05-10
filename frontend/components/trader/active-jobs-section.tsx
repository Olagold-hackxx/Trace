"use client";

import Link from "next/link";
import { JOBS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/status-badge";
import { formatNaira } from "@/lib/utils";
import { ArrowRight,People} from "@mui/icons-material";

export function ActiveJobsSection() {
  // Filter jobs for current trader (trader-1)
  const activeJobs = JOBS.filter((job) => job.traderId === "trader-1").slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-navy">Active Job Postings</h3>
        <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700">
          View All <ArrowRight sx={{ fontSize: "18px" }} />
        </Link>
      </div>

      <div className="space-y-4">
        {activeJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-navy mb-1">{job.title}</h4>
              <p className="text-sm text-text-secondary mb-2">{job.location}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-navy">{formatNaira(job.pay)}</span>
                <span className="text-text-secondary">• {job.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatusBadge status={job.status} />
              <div className="flex items-center gap-2 text-sm font-medium text-navy">
                <People sx={{ fontSize: "18px" }} />
                <span>{job.applicants}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { formatNaira, getRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/common/status-badge";
import { People, LocationOn , AccessTime } from "@mui/icons-material";

interface JobCardProps {
  id: string;
  title: string;
  traderName: string;
  location: string;
  pay: number;
  duration: string;
  applicants: number;
  status: string;
  postedDate: Date;
  isMarketplace?: boolean;
}

export function JobCard({
  id,
  title,
  traderName,
  location,
  pay,
  duration,
  applicants,
  status,
  postedDate,
  isMarketplace,
}: JobCardProps) {
  const href = isMarketplace ? `/marketplace/${id}` : `/jobs/${id}`;

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{traderName}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <LocationOn sx={{ fontSize: "18px" }} />
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <AccessTime sx={{ fontSize: "18px" }} />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-text-secondary">Pay</p>
            <p className="text-xl font-bold text-navy">{formatNaira(pay)}</p>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-text-secondary">
            <People sx={{ fontSize: "18px" }} />
            <span>{applicants} {applicants === 1 ? "applicant" : "applicants"}</span>
          </div>
        </div>

        <p className="text-xs text-text-secondary mt-4">Posted {getRelativeTime(postedDate)}</p>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { formatNaira, getRelativeTime } from "@/lib/utils";
import { People, LocationOn, AccessTime, ArrowForward } from "@mui/icons-material";

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

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#22C55E20", color: "#22C55E" },
  pending: { bg: "#F59E0B20", color: "#F59E0B" },
  completed: { bg: "#3B82F620", color: "#3B82F6" },
  rejected: { bg: "#EF444420", color: "#EF4444" },
};

export function JobCard({ id, title, traderName, location, pay, duration, applicants, status, postedDate, isMarketplace }: JobCardProps) {
  const href = isMarketplace ? `/marketplace/${id}` : `/jobs/${id}`;
  const s = statusStyle[status] ?? statusStyle.pending;

  return (
    <Link href={href}>
      <div
        className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B35]/40 cursor-pointer"
        style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-black text-[#F0EFE8] mb-1 truncate">{title}</h3>
            <p className="text-sm text-[#5C5A78]">{traderName}</p>
          </div>
          <span className="flex-none text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
            {status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#5C5A78]">
            <LocationOn sx={{ fontSize: "15px", color: "#FF6B35" }} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5C5A78]">
            <AccessTime sx={{ fontSize: "15px", color: "#FF6B35" }} />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #2A2A40" }}>
          <div>
            <p className="text-lg font-black" style={{ color: "#FF6B35" }}>{formatNaira(pay)}</p>
            <div className="flex items-center gap-1 text-xs text-[#5C5A78] mt-0.5">
              <People sx={{ fontSize: "14px" }} />
              <span>{applicants} applicants</span>
            </div>
          </div>
          <ArrowForward sx={{ fontSize: "18px", color: "#5C5A78" }} className="group-hover:text-[#FF6B35] transition-colors" />
        </div>

        <p className="text-xs text-[#3A3A58] mt-3">Posted {getRelativeTime(postedDate)}</p>
      </div>
    </Link>
  );
}

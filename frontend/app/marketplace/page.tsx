"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JOBS } from "@/lib/mock-data";
import { useState } from "react";
import { Search } from "@mui/icons-material";

const LOCATIONS = ["Yaba, Lagos", "Ikeja, Lagos", "Surulere, Lagos", "Lekki, Lagos", "VI, Lagos", "Bariga, Lagos"];

export default function MarketplacePage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = JOBS.filter((job) => {
    const matchesLocation = !selectedLocation || job.location.includes(selectedLocation);
    const matchesSearch = !searchTerm || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.traderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  return (
    <AppShell role="worker">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Trace Jobs</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Job Marketplace</h1>
          <p className="text-[#5C5A78] mt-1">Browse jobs near you and apply to earn.</p>
        </div>

        {/* Search and filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search sx={{ fontSize: "18px", color: "#5C5A78" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#F0EFE8] outline-none placeholder:text-[#3A3A58]"
              style={{ backgroundColor: "#141420", border: "1.5px solid #2A2A40" }}
            />
          </div>
          <select
            value={selectedLocation || ""}
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            className="rounded-xl px-4 py-3.5 text-sm outline-none"
            style={{ backgroundColor: "#141420", border: "1.5px solid #2A2A40", color: selectedLocation ? "#F0EFE8" : "#5C5A78" }}
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <div>
          <h2 className="text-lg font-black text-[#F0EFE8] mb-4">
            Available Jobs <span className="text-[#5C5A78] font-normal text-base">({filteredJobs.length})</span>
          </h2>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-[#5C5A78]">No jobs match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} id={job.id} title={job.title} traderName={job.traderName}
                  location={job.location} pay={job.pay} duration={job.duration}
                  applicants={job.applicants} status={job.status} postedDate={job.postedDate} isMarketplace />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

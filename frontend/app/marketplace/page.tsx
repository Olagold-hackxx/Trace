"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JOBS } from "@/lib/mock-data";
import { useState } from "react";
import { Search, Filter } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const LOCATIONS = ["Yaba, Lagos", "Ikeja, Lagos", "Surulere, Lagos", "Lekki, Lagos", "VI, Lagos", "Bariga, Lagos"];

export default function MarketplacePage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = JOBS.filter((job) => {
    const matchesLocation = !selectedLocation || job.location.includes(selectedLocation);
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.traderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Job Marketplace</h1>
          <p className="text-text-secondary">Browse available jobs and apply to earn.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ focusRingColor: COLORS.primary }}
              />
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation || ""}
              onChange={(e) => setSelectedLocation(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRingColor: COLORS.primary }}
            >
              <option value="">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        <div>
          <h2 className="text-xl font-semibold text-navy mb-4">
            Available Jobs ({filteredJobs.length})
          </h2>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-text-secondary">No jobs match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
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
                  isMarketplace
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

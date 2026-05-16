"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  BackendJob,
  fetchBackend,
  formatNairaFromKobo,
  formatRelativeDate,
} from "@/lib/backend";
import { Search, LocationOn, FilterList, People } from "@mui/icons-material";

function JobCard({
  job,
  detailBasePath,
}: {
  job: BackendJob;
  detailBasePath: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-all" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-none" style={{ backgroundColor: "#ff6b00" }}>
            {job.title[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</p>
            <p className="text-xs text-[#cbd5e1]">{job.category}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#161616", color: "#ff6b00" }}>
          {job.status}
        </span>
      </div>

      <p className="text-xs text-[#cbd5e1] leading-relaxed">{job.description}</p>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>
          {job.category}
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#161616", color: "#94a3b8" }}>
          {job.durationLabel}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#1e1e1e" }}>
        <div>
          <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{formatNairaFromKobo(job.payKobo)}<span className="text-xs font-normal text-[#94a3b8]">/day</span></p>
          <div className="flex items-center gap-3 text-xs text-[#94a3b8] mt-0.5">
            <span className="flex items-center gap-1"><LocationOn style={{ fontSize: 12 }} />{job.location}</span>
            <span className="flex items-center gap-1"><People style={{ fontSize: 12 }} />Live listing</span>
          </div>
        </div>
        <Link href={`${detailBasePath}/${job.id}`}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#ff6b00" }}>
          View →
        </Link>
      </div>
    </div>
  );
}

export function MarketplacePage({
  role,
  postJobHref,
  detailBasePath,
}: {
  role: "user" | "lender";
  postJobHref: string;
  detailBasePath: string;
}) {
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Jobs"]);
  const [locations, setLocations] = useState<string[]>(["All Lagos"]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Jobs");
  const [location, setLocation] = useState("All Lagos");

  useEffect(() => {
    void Promise.all([
      fetchBackend<BackendJob[]>("/marketplace/jobs"),
      fetchBackend<{ categories: string[]; locations: string[] }>("/marketplace/filters"),
    ]).then(([jobsResult, filters]) => {
      setJobs(jobsResult);
      setCategories(["All Jobs", ...filters.categories]);
      setLocations(["All Lagos", ...filters.locations]);
    });
  }, []);

  const filtered = useMemo(
    () =>
      jobs.filter((job) => {
        const matchSearch =
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.category.toLowerCase().includes(search.toLowerCase()) ||
          job.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "All Jobs" || job.category === category;
        const matchLocation = location === "All Lagos" || job.location.toLowerCase().includes(location.toLowerCase());
        return matchSearch && matchCat && matchLocation;
      }),
    [category, jobs, location, search]
  );

  const featured = filtered.slice(0, 2);

  return (
    <AppShell role={role}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Job Marketplace</h1>
            <p className="text-sm text-[#94a3b8] mt-1 hidden sm:block">{jobs.length} live jobs across the backend marketplace</p>
          </div>
          <Link
            href={postJobHref}
            className="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{ backgroundColor: "#161616", color: "#ff6b00" }}
          >
            Post a Job
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {featured.map((job) => (
            <div key={job.id} className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #ff6b00, #ff8a33)", color: "#fff" }}>
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>Live</span>
                <p className="text-lg font-bold" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</p>
                <p className="text-sm opacity-80">{job.category} · {job.location}</p>
                <p className="text-xl font-bold mt-2" style={{ fontFamily: "Epilogue, sans-serif" }}>{formatNairaFromKobo(job.payKobo)}/day</p>
              </div>
              <Link href={`${detailBasePath}/${job.id}`} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-[#ff6b00] hover:bg-opacity-90 transition-all flex-none">
                Open →
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <Search style={{ fontSize: 18, color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search jobs or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-[#f0f0f0] placeholder-[#64748b]"
            />
          </div>
          <select value={location} onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}>
            {locations.map((value) => <option key={value}>{value}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <FilterList style={{ fontSize: 18, color: "#94a3b8" }} />
            <span className="text-sm text-[#94a3b8]">Filter</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={category === cat ? { backgroundColor: "#ff6b00", color: "#fff" } : { backgroundColor: "#111111", color: "#cbd5e1", border: "1px solid #1e1e1e" }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#94a3b8]"><span className="font-semibold text-[#f0f0f0]">{filtered.length}</span> jobs found</p>
          <span className="text-sm text-[#94a3b8]">Updated {jobs[0] ? formatRelativeDate(jobs[0].createdAt) : "recently"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => <JobCard key={job.id} job={job} detailBasePath={detailBasePath} />)}
        </div>
      </div>
    </AppShell>
  );
}

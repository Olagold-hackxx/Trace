"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Search, LocationOn, FilterList, Bookmark, BookmarkBorder, People } from "@mui/icons-material";

const categories = ["All Jobs", "Sales", "Delivery", "Catering", "Supervision", "Admin", "Cleaning", "Security"];

export const marketplaceJobs = [
  { id: "1", title: "Sales Assistant", company: "Amaka Foods", location: "Yaba, Lagos", pay: "₦8,500", period: "day", type: "Full-day", minScore: 500, applicants: 14, tags: ["Urgent"], posted: "2h ago", desc: "Help manage sales at our Yaba market stall. Must be reliable and customer-friendly." },
  { id: "2", title: "Delivery Rider", company: "QuickEats", location: "Surulere, Lagos", pay: "₦6,000", period: "day", type: "Part-day", minScore: 400, applicants: 22, tags: ["Open"], posted: "5h ago", desc: "Deliver food orders around Surulere. Own motorcycle preferred but not required." },
  { id: "3", title: "Market Supervisor", company: "Lagos Grocers", location: "Ojuelegba, Lagos", pay: "₦12,000", period: "day", type: "Full-day", minScore: 600, applicants: 7, tags: ["Featured"], posted: "1d ago", desc: "Oversee daily operations at our grocery market. Leadership experience a plus." },
  { id: "4", title: "Cashier", company: "Buka Hub", location: "Ikeja, Lagos", pay: "₦5,500", period: "day", type: "Full-day", minScore: 350, applicants: 31, tags: ["Open"], posted: "3h ago", desc: "Handle cash and POS transactions at our busy restaurant." },
  { id: "5", title: "Event Caterer", company: "Mama Cooks", location: "Victoria Island, Lagos", pay: "₦15,000", period: "event", type: "One-off", minScore: 500, applicants: 9, tags: ["Open"], posted: "6h ago", desc: "Assist with catering for a corporate event. Experience with large-scale cooking preferred." },
  { id: "6", title: "Store Assistant", company: "Fashion Hub", location: "Oshodi, Lagos", pay: "₦4,500", period: "day", type: "Part-day", minScore: 300, applicants: 18, tags: ["Open"], posted: "12h ago", desc: "Help customers, organise stock, and handle basic sales duties." },
  { id: "7", title: "Office Cleaner", company: "CleanPro Lagos", location: "Lekki, Lagos", pay: "₦3,500", period: "day", type: "Part-day", minScore: 200, applicants: 25, tags: ["Open"], posted: "1d ago", desc: "Morning cleaning shift for a modern office complex." },
  { id: "8", title: "Security Guard", company: "SafeGuard Ltd", location: "Maryland, Lagos", pay: "₦7,000", period: "shift", type: "Night shift", minScore: 450, applicants: 11, tags: ["Urgent"], posted: "8h ago", desc: "Night security for a retail premises. Must have verifiable ID." },
  { id: "9", title: "Kitchen Assistant", company: "Eko Buka", location: "Agege, Lagos", pay: "₦5,000", period: "day", type: "Full-day", minScore: 300, applicants: 16, tags: ["Open"], posted: "2d ago", desc: "Support the kitchen team with prep and cleaning duties." },
  { id: "10", title: "Admin Assistant", company: "Trace Partner SME", location: "Gbagada, Lagos", pay: "₦6,500", period: "day", type: "Full-day", minScore: 550, applicants: 6, tags: ["Open"], posted: "4h ago", desc: "Handle filing, calls, and basic office admin. Computer literacy required." },
  { id: "11", title: "Brand Promoter", company: "LagosDrinks Co.", location: "Alimosho, Lagos", pay: "₦8,000", period: "day", type: "Full-day", minScore: 400, applicants: 20, tags: ["Featured"], posted: "1d ago", desc: "Promote beverages at events and markets. Outgoing personality essential." },
  { id: "12", title: "Inventory Counter", company: "Wholesale Plus", location: "Trade Fair, Lagos", pay: "₦4,000", period: "day", type: "Part-day", minScore: 250, applicants: 13, tags: ["Open"], posted: "3d ago", desc: "Count and record stock in a wholesale warehouse. Attention to detail required." },
];

const tagColors: Record<string, { color: string; bg: string }> = {
  Urgent: { color: "#dc2626", bg: "#fee2e2" },
  Featured: { color: "#ff6b00", bg: "#3b1d09" },
  Open: { color: "#16a34a", bg: "#dcfce7" },
};

function JobCard({
  job,
  detailBasePath,
}: {
  job: typeof marketplaceJobs[number];
  detailBasePath: string;
}) {
  const [saved, setSaved] = useState(false);
  const tag = job.tags[0];
  const tc = tagColors[tag] || tagColors.Open;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-all" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-none" style={{ backgroundColor: "#ff6b00" }}>
            {job.company[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</p>
            <p className="text-xs text-[#cbd5e1]">{job.company}</p>
          </div>
        </div>
        <button onClick={() => setSaved(!saved)} className="text-[#94a3b8] hover:text-[#ff6b00] transition-colors flex-none">
          {saved ? <Bookmark style={{ fontSize: 20, color: "#ff6b00" }} /> : <BookmarkBorder style={{ fontSize: 20 }} />}
        </button>
      </div>

      <p className="text-xs text-[#cbd5e1] leading-relaxed">{job.desc}</p>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color }}>{tag}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#161616", color: "#ff6b00" }}>{job.type}</span>
        {job.minScore > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#161616", color: "#94a3b8" }}>
            Score ≥ {job.minScore}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#1e1e1e" }}>
        <div>
          <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.pay}<span className="text-xs font-normal text-[#94a3b8]">/{job.period}</span></p>
          <div className="flex items-center gap-3 text-xs text-[#94a3b8] mt-0.5">
            <span className="flex items-center gap-1"><LocationOn style={{ fontSize: 12 }} />{job.location}</span>
            <span className="flex items-center gap-1"><People style={{ fontSize: 12 }} />{job.applicants} applied</span>
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Jobs");
  const [location, setLocation] = useState("All Lagos");

  const filtered = marketplaceJobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All Jobs" || j.title.toLowerCase().includes(category.toLowerCase());
    const matchLocation = location === "All Lagos" || j.location.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchCat && matchLocation;
  });

  return (
    <AppShell role={role}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Job Marketplace</h1>
            <p className="text-sm text-[#94a3b8] mt-1">{marketplaceJobs.length} jobs available across Lagos</p>
          </div>
          <Link
            href={postJobHref}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#161616", color: "#ff6b00" }}
          >
            Post a Job
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {marketplaceJobs.filter((j) => j.tags.includes("Featured")).slice(0, 2).map((job) => (
            <div key={job.id} className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #ff6b00, #ff8a33)", color: "#fff" }}>
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>⭐ Featured</span>
                <p className="text-lg font-bold" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</p>
                <p className="text-sm opacity-80">{job.company} · {job.location}</p>
                <p className="text-xl font-bold mt-2" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.pay}/{job.period}</p>
              </div>
              <Link href={`${detailBasePath}/${job.id}`} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-[#ff6b00] hover:bg-opacity-90 transition-all flex-none">
                Apply →
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <Search style={{ fontSize: 18, color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-[#f0f0f0] placeholder-[#64748b]"
            />
          </div>
          <select value={location} onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}>
            {["All Lagos", "Yaba", "Surulere", "Lekki", "Ikeja", "Victoria Island", "Oshodi"].map((l) => <option key={l}>{l}</option>)}
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
          <select className="text-sm px-3 py-1.5 rounded-xl border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}>
            <option>Most Recent</option>
            <option>Highest Pay</option>
            <option>Most Applicants</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => <JobCard key={job.id} job={job} detailBasePath={detailBasePath} />)}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {[1, 2, 3].map((p) => (
            <button key={p} className="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
              style={p === 1 ? { backgroundColor: "#ff6b00", color: "#fff" } : { backgroundColor: "#111111", color: "#cbd5e1", border: "1px solid #1e1e1e" }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

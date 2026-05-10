"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Search, LocationOn, People, TrendingUp } from "@mui/icons-material";
import { useState } from "react";

const jobs = [
  { id: "MKT-01", title: "Sales Assistant", merchant: "Amaka Foods", pay: "₦8,500/day", location: "Yaba", applicants: 14, scoreMin: 500, status: "Balanced demand" },
  { id: "MKT-02", title: "Delivery Rider", merchant: "QuickEats", pay: "₦6,000/day", location: "Surulere", applicants: 22, scoreMin: 400, status: "High demand" },
  { id: "MKT-03", title: "Kitchen Assistant", merchant: "BabaChef Catering", pay: "₦5,000/day", location: "Oshodi", applicants: 4, scoreMin: 300, status: "Low demand" },
  { id: "MKT-04", title: "Cashier", merchant: "City Bakery", pay: "₦5,500/day", location: "Agege", applicants: 19, scoreMin: 350, status: "Balanced demand" },
  { id: "MKT-05", title: "Store Assistant", merchant: "TechFix Lagos", pay: "₦4,500/day", location: "Gbagada", applicants: 3, scoreMin: 300, status: "Low demand" },
  { id: "MKT-06", title: "Market Supervisor", merchant: "Lagos Grocers", pay: "₦12,000/day", location: "Ojuelegba", applicants: 7, scoreMin: 600, status: "Specialized demand" },
];

const statusColor: Record<string, { bg: string; color: string }> = {
  "Balanced demand": { bg: "#172554", color: "#93c5fd" },
  "High demand": { bg: "#dcfce7", color: "#16a34a" },
  "Low demand": { bg: "#3b1d09", color: "#ff6b00" },
  "Specialized demand": { bg: "#ede9fe", color: "#7c3aed" },
};

export default function LenderMarketplacePage() {
  const [search, setSearch] = useState("");

  const filtered = jobs.filter((job) => {
    const query = search.toLowerCase();
    return job.title.toLowerCase().includes(query) || job.merchant.toLowerCase().includes(query) || job.location.toLowerCase().includes(query);
  });

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Marketplace Activity
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              View live job-market demand across merchants without leaving the lender workspace.
            </p>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#64748b]">Live jobs</p>
            <p className="text-3xl font-bold text-[#ff6b00]" style={{ fontFamily: "Epilogue, sans-serif" }}>{jobs.length}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <Search style={{ fontSize: 18, color: "#64748b" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant, role, or location..."
            className="flex-1 bg-transparent text-sm outline-none text-[#f0f0f0] placeholder-[#64748b]"
          />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => {
            const badge = statusColor[job.status];
            return (
              <div
                key={job.id}
                className="rounded-2xl p-5"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</p>
                    <p className="text-sm text-[#cbd5e1] mt-1">{job.merchant}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <LocationOn style={{ fontSize: 16 }} />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <People style={{ fontSize: 16 }} />
                    {job.applicants} applicants
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp style={{ fontSize: 16, color: "#ff6b00" }} />
                    Minimum score: <span className="font-semibold text-[#f0f0f0]">{job.scoreMin}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#64748b] mb-1">Compensation</p>
                    <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.pay}</p>
                  </div>
                  <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#2563eb" }}>
                    View signal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

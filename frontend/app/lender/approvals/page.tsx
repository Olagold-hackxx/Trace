"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import Link from "next/link";
import { FilterList, Search, CheckCircle, Cancel, Visibility, Warning } from "@mui/icons-material";

const applications = [
  { id: "APP-101", name: "Amaka Foods", owner: "Amaka Okonkwo", type: "Food & Bev", score: 742, amount: 2500000, purpose: "Working capital", risk: "Low", days: 2, status: "Pending" },
  { id: "APP-102", name: "Kemi Snacks", owner: "Kemi Adeyemi", type: "Food", score: 708, amount: 500000, purpose: "Inventory purchase", risk: "Low", days: 4, status: "Pending" },
  { id: "APP-103", name: "Lagos Grocers", owner: "Tunde Okafor", type: "Retail", score: 728, amount: 1200000, purpose: "Store expansion", risk: "Low", days: 1, status: "Under Review" },
  { id: "APP-104", name: "QuickEats", owner: "Femi Bello", type: "Delivery", score: 715, amount: 800000, purpose: "Fleet acquisition", risk: "Medium", days: 6, status: "Pending" },
  { id: "APP-105", name: "Fashion Hub", owner: "Sade Williams", type: "Fashion", score: 623, amount: 350000, purpose: "Stock purchase", risk: "Medium", days: 8, status: "Info Needed" },
  { id: "APP-106", name: "Bello Supplies", owner: "Emeka Bello", type: "Wholesale", score: 488, amount: 900000, purpose: "Working capital", risk: "High", days: 3, status: "Pending" },
  { id: "APP-107", name: "Nwosu Electronics", owner: "Chukwu Nwosu", type: "Electronics", score: 541, amount: 600000, purpose: "Equipment", risk: "High", days: 5, status: "Pending" },
  { id: "APP-108", name: "Adaeze Logistics", owner: "Adaeze Onu", type: "Logistics", score: 701, amount: 1800000, purpose: "Fleet expansion", risk: "Low", days: 7, status: "Pending" },
  { id: "APP-109", name: "City Bakery", owner: "Grace Okoro", type: "Food", score: 689, amount: 400000, purpose: "Equipment", risk: "Medium", days: 9, status: "Pending" },
  { id: "APP-110", name: "TechFix Lagos", owner: "Ayo Adebayo", type: "Services", score: 560, amount: 750000, purpose: "Workshop setup", risk: "High", days: 2, status: "Pending" },
  { id: "APP-111", name: "MamaPut Express", owner: "Ngozi Eze", type: "Food", score: 733, amount: 1000000, purpose: "Expansion", risk: "Low", days: 11, status: "Pending" },
  { id: "APP-112", name: "Ade Trades", owner: "Ade Sule", type: "Retail", score: 592, amount: 280000, purpose: "Inventory", risk: "Medium", days: 14, status: "Info Needed" },
  { id: "APP-113", name: "Eko Transports", owner: "Chioma Eke", type: "Logistics", score: 667, amount: 2200000, purpose: "Vehicle purchase", risk: "Medium", days: 5, status: "Under Review" },
  { id: "APP-114", name: "Yetunde Cosmetics", owner: "Yetunde Ajayi", type: "Beauty", score: 715, amount: 500000, purpose: "Stock purchase", risk: "Low", days: 3, status: "Pending" },
  { id: "APP-115", name: "BabaChef Catering", owner: "Ibrahim Musa", type: "Catering", score: 648, amount: 650000, purpose: "Equipment", risk: "Medium", days: 6, status: "Pending" },
];

const riskStyle: Record<string, { color: string; bg: string }> = {
  Low: { color: "#16a34a", bg: "#dcfce7" },
  Medium: { color: "#d97706", bg: "#fef3c7" },
  High: { color: "#dc2626", bg: "#fee2e2" },
};

const statusStyle: Record<string, { color: string; bg: string }> = {
  Pending: { color: "#d97706", bg: "#fef3c7" },
  "Under Review": { color: "#2563eb", bg: "#dae2fd" },
  "Info Needed": { color: "#dc2626", bg: "#fee2e2" },
};

export default function ApprovalsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [scoreMin, setScoreMin] = useState("");
  const [decisions, setDecisions] = useState<Record<string, "approve" | "decline">>({});

  const decide = (id: string, decision: "approve" | "decline") => {
    setDecisions((d) => ({ ...d, [id]: decision }));
  };

  const filtered = applications.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "All" || a.risk === riskFilter;
    const matchScore = !scoreMin || a.score >= parseInt(scoreMin);
    return matchSearch && matchRisk && matchScore;
  });

  const totalRequested = filtered.reduce((s, a) => s + a.amount, 0);
  const highRiskCount = filtered.filter((a) => a.risk === "High").length;

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Approval Queue</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Review and decision pending applications</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pending", val: filtered.length.toString(), color: "#2563eb" },
            { label: "High Risk", val: highRiskCount.toString(), color: "#dc2626" },
            { label: "Total Requested", val: `₦${(totalRequested / 1000000).toFixed(1)}M`, color: "#ff6b00" },
            { label: "Avg Score", val: Math.round(filtered.reduce((s, a) => s + a.score, 0) / filtered.length).toString(), color: "#16a34a" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] rounded-2xl p-4 text-center" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: s.color }}>{s.val}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[#111111] rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center" style={{ border: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <Search style={{ fontSize: 18, color: "#94a3b8" }} />
            <input type="text" placeholder="Search merchant or owner..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-[#f0f0f0] placeholder-[#94a3b8]" />
          </div>
          <div className="flex items-center gap-2">
            <FilterList style={{ fontSize: 18, color: "#94a3b8" }} />
            <span className="text-sm text-[#94a3b8] mr-1">Risk:</span>
            {["All", "Low", "Medium", "High"].map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={riskFilter === r ? { backgroundColor: "#2563eb", color: "#fff" } : { backgroundColor: "#161616", color: "#cbd5e1", border: "1px solid #1e1e1e" }}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#94a3b8]">Min score:</span>
            <input type="number" placeholder="e.g. 600" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)}
              className="w-20 px-2 py-1.5 text-sm rounded-lg border outline-none" style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111111] rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Merchant", "Business Type", "TraceScore", "Requested", "Purpose", "Risk", "Queue", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const dec = decisions[app.id];
                  return (
                    <tr key={app.id} className={`hover:bg-[#161616] transition-colors ${dec ? "opacity-60" : ""}`} style={{ borderBottom: "1px solid #1e1e1e" }}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#2563eb" }}>{app.name[0]}</div>
                          <div>
                            <p className="font-semibold text-[#f0f0f0] text-xs">{app.name}</p>
                            <p className="text-xs text-[#94a3b8]">{app.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#cbd5e1] text-xs">{app.type}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm" style={{ color: app.score >= 700 ? "#16a34a" : app.score >= 500 ? "#d97706" : "#dc2626" }}>{app.score}</span>
                          {app.score < 500 && <Warning style={{ fontSize: 14, color: "#dc2626" }} />}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#f0f0f0] text-xs">₦{(app.amount / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-4 text-[#cbd5e1] text-xs max-w-28 truncate">{app.purpose}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: riskStyle[app.risk].color, backgroundColor: riskStyle[app.risk].bg }}>{app.risk}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#94a3b8]">{app.days}d</td>
                      <td className="px-4 py-4">
                        {dec ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: dec === "approve" ? "#16a34a" : "#dc2626", backgroundColor: dec === "approve" ? "#dcfce7" : "#fee2e2" }}>
                            {dec === "approve" ? "Approved" : "Declined"}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: statusStyle[app.status]?.color || "#d97706", backgroundColor: statusStyle[app.status]?.bg || "#fef3c7" }}>{app.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {!dec && (
                          <div className="flex items-center gap-2">
                            <Link href={`/lender/merchants/${app.id}`}>
                              <button className="p-1.5 rounded-lg border transition-all hover:bg-[#161616]" style={{ borderColor: "#1e1e1e" }} title="View">
                                <Visibility style={{ fontSize: 14, color: "#cbd5e1" }} />
                              </button>
                            </Link>
                            <button onClick={() => decide(app.id, "approve")} className="p-1.5 rounded-lg transition-all hover:bg-[#dcfce7]" style={{ border: "1px solid #bbf7d0" }} title="Approve">
                              <CheckCircle style={{ fontSize: 14, color: "#16a34a" }} />
                            </button>
                            <button onClick={() => decide(app.id, "decline")} className="p-1.5 rounded-lg transition-all hover:bg-[#fee2e2]" style={{ border: "1px solid #fecaca" }} title="Decline">
                              <Cancel style={{ fontSize: 14, color: "#dc2626" }} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#94a3b8] mt-4 text-center">{filtered.length} applications · Showing all results</p>
      </div>
    </AppShell>
  );
}

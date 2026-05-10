"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import Link from "next/link";
import { Search, FilterList, CheckCircle, Warning, AccessTime } from "@mui/icons-material";

const merchants = [
  { id: "m1", name: "Amaka Foods", owner: "Amaka Okonkwo", type: "Food & Bev", location: "Yaba", score: 742, loanAmount: 1200000, repaid: 800000, nextPayment: "May 20", status: "On Track" },
  { id: "m2", name: "Lagos Grocers", owner: "Tunde Okafor", type: "Retail", location: "Ojuelegba", score: 728, loanAmount: 900000, repaid: 500000, nextPayment: "May 18", status: "On Track" },
  { id: "m3", name: "QuickEats", owner: "Femi Bello", type: "Delivery", location: "Surulere", score: 715, loanAmount: 800000, repaid: 800000, nextPayment: "—", status: "Completed" },
  { id: "m4", name: "Kemi Snacks", owner: "Kemi Adeyemi", type: "Food", location: "Ikeja", score: 708, loanAmount: 500000, repaid: 500000, nextPayment: "—", status: "Completed" },
  { id: "m5", name: "Adaeze Logistics", owner: "Adaeze Onu", type: "Logistics", location: "Maryland", score: 701, loanAmount: 1800000, repaid: 600000, nextPayment: "May 25", status: "On Track" },
  { id: "m6", name: "City Bakery", owner: "Grace Okoro", type: "Food", location: "Agege", score: 689, loanAmount: 400000, repaid: 133000, nextPayment: "May 15", status: "On Track" },
  { id: "m7", name: "MamaPut Express", owner: "Ngozi Eze", type: "Food", location: "Lekki", score: 733, loanAmount: 1000000, repaid: 0, nextPayment: "May 30", status: "Upcoming" },
  { id: "m8", name: "Yetunde Cosmetics", owner: "Yetunde Ajayi", type: "Beauty", location: "Victoria Island", score: 715, loanAmount: 500000, repaid: 250000, nextPayment: "May 22", status: "On Track" },
  { id: "m9", name: "BabaChef Catering", owner: "Ibrahim Musa", type: "Catering", location: "Oshodi", score: 648, loanAmount: 650000, repaid: 200000, nextPayment: "May 12", status: "At Risk" },
  { id: "m10", name: "Eko Transports", owner: "Chioma Eke", type: "Logistics", location: "Gbagada", score: 667, loanAmount: 2200000, repaid: 700000, nextPayment: "May 19", status: "On Track" },
  { id: "m11", name: "Fashion Hub", owner: "Sade Williams", type: "Fashion", location: "Oshodi", score: 623, loanAmount: 350000, repaid: 100000, nextPayment: "May 14", status: "At Risk" },
  { id: "m12", name: "TechFix Lagos", owner: "Ayo Adebayo", type: "Services", location: "Gbagada", score: 560, loanAmount: 750000, repaid: 0, nextPayment: "May 28", status: "Watch" },
];

const statusStyle: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "On Track": { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  "Completed": { color: "#2563eb", bg: "#dae2fd", icon: CheckCircle },
  "Upcoming": { color: "#d97706", bg: "#fef3c7", icon: AccessTime },
  "At Risk": { color: "#dc2626", bg: "#fee2e2", icon: Warning },
  "Watch": { color: "#7c3aed", bg: "#ede9fe", icon: Warning },
};

const tabs = ["All Merchants", "Active Loans", "Watch List"];

export default function TradersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Merchants");

  const filtered = merchants.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.owner.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === "All Merchants" ? true :
      activeTab === "Active Loans" ? m.repaid < m.loanAmount && m.loanAmount > 0 :
      ["At Risk", "Watch"].includes(m.status);
    return matchSearch && matchTab;
  });

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Merchant Portfolio</h1>
            <p className="text-sm text-[#94a3b8] mt-1">{merchants.length} merchants in your portfolio</p>
          </div>
          <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]" style={{ borderColor: "#1e1e1e" }}>
            Export CSV
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Merchants", val: merchants.length.toString(), color: "#2563eb" },
            { label: "Active Loans", val: merchants.filter(m => m.repaid < m.loanAmount).length.toString(), color: "#ff6b00" },
            { label: "At Risk / Watch", val: merchants.filter(m => ["At Risk","Watch"].includes(m.status)).length.toString(), color: "#dc2626" },
            { label: "Completed Loans", val: merchants.filter(m => m.status === "Completed").length.toString(), color: "#16a34a" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] rounded-2xl p-4 text-center" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: s.color }}>{s.val}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                style={activeTab === t ? { backgroundColor: "#2563eb", color: "#fff" } : { color: "#cbd5e1" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #1e1e1e" }}>
            <Search style={{ fontSize: 18, color: "#94a3b8" }} />
            <input type="text" placeholder="Search merchants..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-[#f0f0f0] placeholder-[#94a3b8]" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111111] rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Merchant", "Type", "Location", "TraceScore", "Loan Amount", "Repaid", "Next Payment", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const s = statusStyle[m.status];
                  const Icon = s.icon;
                  const repaidPct = m.loanAmount > 0 ? (m.repaid / m.loanAmount) * 100 : 100;
                  return (
                    <tr key={m.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#2563eb" }}>{m.name[0]}</div>
                          <div>
                            <p className="font-semibold text-[#f0f0f0] text-sm">{m.name}</p>
                            <p className="text-xs text-[#94a3b8]">{m.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#cbd5e1] text-xs">{m.type}</td>
                      <td className="px-5 py-4 text-[#cbd5e1] text-xs">{m.location}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: m.score >= 700 ? "#16a34a" : m.score >= 600 ? "#d97706" : "#dc2626" }}>{m.score}</span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                            <div className="h-full rounded-full" style={{ width: `${(m.score / 900) * 100}%`, backgroundColor: "#2563eb" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#f0f0f0] text-sm">₦{(m.loanAmount / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-[#f0f0f0]">₦{(m.repaid / 1000).toFixed(0)}K</p>
                          <div className="mt-1 w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                            <div className="h-full rounded-full" style={{ width: `${repaidPct}%`, backgroundColor: "#16a34a" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#cbd5e1]">{m.nextPayment}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                          <Icon style={{ fontSize: 12 }} />{m.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/lender/merchants/${m.id}`} className="text-xs font-semibold" style={{ color: "#2563eb" }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#94a3b8] mt-4 text-center">{filtered.length} of {merchants.length} merchants shown</p>
      </div>
    </AppShell>
  );
}

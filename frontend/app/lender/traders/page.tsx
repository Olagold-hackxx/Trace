"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TRADERS } from "@/lib/constants";
import { TRACE_SCORES, LENDER_QUEUE } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";
import { useState } from "react";
import { Search, LocationOn, TrendingUp, ArrowForward } from "@mui/icons-material";
import Link from "next/link";

const allMerchants = LENDER_QUEUE.flatMap((l) => l.merchants);

const traderRows = TRADERS.map((trader) => {
  const score = TRACE_SCORES[trader.id as keyof typeof TRACE_SCORES];
  const merchant = allMerchants.find((m) => m.traderId === trader.id);
  return {
    ...trader,
    score: score?.score ?? 0,
    requested: merchant?.requestedAmount ?? 0,
    status: merchant?.status ?? "active",
  };
}).sort((a, b) => b.score - a.score);

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  under_review:   { bg: "#F59E0B20", color: "#F59E0B", label: "Under Review" },
  pending_review: { bg: "#FF6B3520", color: "#FF6B35", label: "Pending" },
  approved:       { bg: "#22C55E20", color: "#22C55E", label: "Approved" },
  active:         { bg: "#2A2A40",   color: "#9B99B5", label: "No Request" },
};

export default function LenderTradersPage() {
  const [search, setSearch] = useState("");

  const filtered = traderRows.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="lender">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Portfolio</p>
            <h1 className="text-3xl font-black text-[#F0EFE8]">All Traders</h1>
            <p className="text-[#5C5A78] mt-1">Review trader profiles, TraceScores, and capital requests.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-[#FF6B35]">{traderRows.length}</p>
            <p className="text-xs text-[#5C5A78] mt-0.5">Total traders</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Avg TraceScore", value: Math.round(traderRows.reduce((s, t) => s + t.score, 0) / traderRows.length), color: "#F5A623" },
            { label: "Under Review", value: allMerchants.filter((m) => m.status === "under_review").length, color: "#FF6B35" },
            { label: "Total Requested", value: formatNaira(allMerchants.reduce((s, m) => s + m.requestedAmount, 0)), color: "#22C55E" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <p className="text-xs text-[#5C5A78] mb-2">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search sx={{ fontSize: "18px", color: "#5C5A78" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search traders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-[#F0EFE8] outline-none placeholder:text-[#3A3A58]"
            style={{ backgroundColor: "#141420", border: "1.5px solid #2A2A40" }}
          />
        </div>

        {/* Trader cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((trader) => {
            const s = statusStyle[trader.status] ?? statusStyle.active;
            const scoreColor = trader.score >= 750 ? "#F5A623" : trader.score >= 700 ? "#22C55E" : "#FF6B35";
            return (
              <Link
                key={trader.id}
                href={`/lender/merchants/${trader.id}`}
                className="group rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B35]/40 block"
                style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={trader.image}
                      alt={trader.name}
                      className="w-12 h-12 rounded-2xl object-cover object-top flex-none"
                    />
                    <div>
                      <p className="font-black text-[#F0EFE8]">{trader.name}</p>
                      <div className="flex items-center gap-1 text-xs text-[#5C5A78] mt-0.5">
                        <LocationOn sx={{ fontSize: "13px" }} />
                        {trader.location}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {/* Score bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#5C5A78]">
                      <TrendingUp sx={{ fontSize: "14px" }} />
                      TraceScore
                    </div>
                    <span className="text-lg font-black" style={{ color: scoreColor }}>{trader.score}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(trader.score / 850) * 100}%`, background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #2A2A40" }}>
                  <div>
                    <p className="text-xs text-[#5C5A78]">Category</p>
                    <p className="text-sm font-bold text-[#9B99B5] mt-0.5">{trader.category}</p>
                  </div>
                  {trader.requested > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-[#5C5A78]">Requested</p>
                      <p className="text-sm font-black text-[#FF6B35] mt-0.5">{formatNaira(trader.requested)}</p>
                    </div>
                  )}
                  <ArrowForward sx={{ fontSize: "18px", color: "#5C5A78" }} className="group-hover:text-[#FF6B35] transition-colors ml-2" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

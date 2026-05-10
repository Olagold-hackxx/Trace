"use client";

import { AppShell } from "@/components/layout/app-shell";
import { LENDER_QUEUE, TRACE_SCORES } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";
import { useState } from "react";
import {
  CheckCircle,
  Cancel,
  AccessTime,
  ArrowForward,
  FilterList,
  TrendingUp,
} from "@mui/icons-material";
import Link from "next/link";

const allApplications = LENDER_QUEUE.flatMap((l) =>
  l.merchants.map((m) => ({ ...m, lenderName: l.name }))
).sort((a, b) => {
  const scoreA = TRACE_SCORES[a.traderId as keyof typeof TRACE_SCORES]?.score ?? 0;
  const scoreB = TRACE_SCORES[b.traderId as keyof typeof TRACE_SCORES]?.score ?? 0;
  return scoreB - scoreA;
});

// Mock: add some approved/rejected for variety
const mockHistory = [
  { traderName: "Yaba Fresh Mart", traderId: "trader-4", requestedAmount: 400000, status: "approved", lenderName: "Zenith Capital", dateSubmitted: new Date(Date.now() - 10 * 86400000) },
  { traderName: "Chinedu Provisions", traderId: "trader-5", requestedAmount: 750000, status: "approved", lenderName: "Catalyst Fund", dateSubmitted: new Date(Date.now() - 14 * 86400000) },
  { traderName: "Bola Stores", traderId: "trader-2", requestedAmount: 200000, status: "rejected", lenderName: "Growth Finance", dateSubmitted: new Date(Date.now() - 20 * 86400000) },
];

const allItems = [...allApplications, ...mockHistory];

type Filter = "all" | "under_review" | "pending_review" | "approved" | "rejected";

const statusConfig: Record<string, { bg: string; color: string; label: string; icon: typeof CheckCircle }> = {
  under_review:   { bg: "#F59E0B20", color: "#F59E0B", label: "Under Review", icon: AccessTime },
  pending_review: { bg: "#FF6B3520", color: "#FF6B35", label: "Pending",       icon: AccessTime },
  approved:       { bg: "#22C55E20", color: "#22C55E", label: "Approved",      icon: CheckCircle },
  rejected:       { bg: "#EF444420", color: "#EF4444", label: "Rejected",      icon: Cancel },
};

const tabs: { key: Filter; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "under_review", label: "Under Review" },
  { key: "pending_review", label: "Pending" },
  { key: "approved",     label: "Approved" },
  { key: "rejected",     label: "Rejected" },
];

export default function LenderApprovalsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? allItems : allItems.filter((a) => a.status === filter);

  const counts = {
    under_review:   allItems.filter((a) => a.status === "under_review").length,
    pending_review: allItems.filter((a) => a.status === "pending_review").length,
    approved:       allItems.filter((a) => a.status === "approved").length,
    rejected:       allItems.filter((a) => a.status === "rejected").length,
  };

  return (
    <AppShell role="lender">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Capital Decisions</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Approvals Queue</h1>
          <p className="text-[#5C5A78] mt-1">Review, approve, or reject trader capital applications.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Under Review", value: counts.under_review, color: "#F59E0B", icon: AccessTime },
            { label: "Pending",      value: counts.pending_review, color: "#FF6B35", icon: AccessTime },
            { label: "Approved",     value: counts.approved,       color: "#22C55E", icon: CheckCircle },
            { label: "Rejected",     value: counts.rejected,       color: "#EF4444", icon: Cancel },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-[#5C5A78]">{s.label}</p>
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${s.color}20` }}>
                    <Icon sx={{ fontSize: "16px", color: s.color }} />
                  </div>
                </div>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterList sx={{ fontSize: "18px", color: "#5C5A78" }} />
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={
                filter === tab.key
                  ? { backgroundColor: "#FF6B35", color: "white" }
                  : { backgroundColor: "#141420", border: "1px solid #2A2A40", color: "#5C5A78" }
              }
            >
              {tab.label}
              {tab.key !== "all" && counts[tab.key as keyof typeof counts] > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({counts[tab.key as keyof typeof counts]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Applications list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-3xl p-12 text-center" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <p className="text-[#5C5A78]">No applications in this category.</p>
            </div>
          )}
          {filtered.map((app, i) => {
            const score = TRACE_SCORES[app.traderId as keyof typeof TRACE_SCORES]?.score ?? 0;
            const scoreColor = score >= 750 ? "#F5A623" : score >= 700 ? "#22C55E" : "#FF6B35";
            const sc = statusConfig[app.status] ?? statusConfig.pending_review;
            const StatusIcon = sc.icon;
            const isPending = app.status === "under_review" || app.status === "pending_review";

            return (
              <div
                key={i}
                className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
              >
                <div className="flex items-center justify-between p-6 flex-wrap gap-4">
                  {/* Left info */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-none"
                      style={{ backgroundColor: "#FF6B3520", color: "#FF6B35" }}
                    >
                      {app.traderName[0]}
                    </div>
                    <div>
                      <p className="font-black text-[#F0EFE8]">{app.traderName}</p>
                      <p className="text-xs text-[#5C5A78] mt-0.5">via {app.lenderName}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <TrendingUp sx={{ fontSize: "16px", color: scoreColor }} />
                    <span className="text-lg font-black" style={{ color: scoreColor }}>{score}</span>
                    <span className="text-xs text-[#5C5A78]">TraceScore</span>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-xs text-[#5C5A78] mb-0.5">Requested</p>
                    <p className="text-lg font-black text-[#F0EFE8]">{formatNaira(app.requestedAmount)}</p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: sc.bg, border: `1px solid ${sc.color}30` }}>
                    <StatusIcon sx={{ fontSize: "14px", color: sc.color }} />
                    <span className="text-xs font-black" style={{ color: sc.color }}>{sc.label}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          className="text-xs font-black px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                          style={{ backgroundColor: "#22C55E20", color: "#22C55E", border: "1px solid #22C55E40" }}
                        >
                          Approve
                        </button>
                        <button
                          className="text-xs font-black px-3 py-2 rounded-xl transition-all"
                          style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <Link
                      href={`/lender/merchants/${app.traderId}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#5C5A78] hover:text-[#FF6B35] transition-colors px-3 py-2 rounded-xl hover:bg-[#0F0F1A]"
                    >
                      View <ArrowForward sx={{ fontSize: "14px" }} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

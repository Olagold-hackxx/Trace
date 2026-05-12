"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterList, Search, CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import { useLenderData } from "@/hooks/use-lender-data";
import { fetchBackend, formatDateLabel, formatNairaFromKobo } from "@/lib/backend";

const riskStyle: Record<string, { color: string; bg: string }> = {
  Low: { color: "#16a34a", bg: "#dcfce7" },
  Medium: { color: "#d97706", bg: "#fef3c7" },
  High: { color: "#dc2626", bg: "#fee2e2" },
};

const statusStyle: Record<string, { color: string; bg: string }> = {
  pending: { color: "#d97706", bg: "#fef3c7" },
  under_review: { color: "#ff6b00", bg: "#3b1d09" },
  approved: { color: "#16a34a", bg: "#dcfce7" },
  declined: { color: "#dc2626", bg: "#fee2e2" },
};

export default function ApprovalsPage() {
  const { applications, merchants } = useLenderData();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [decisions, setDecisions] = useState<Record<string, "approve" | "decline">>({});

  const enriched = useMemo(() => applications.map((application) => {
    const merchant = merchants.find((item) => item.id === application.userId);
    const amount = Number(application.amountKobo);
    const risk = amount > 100000000 ? "High" : amount > 50000000 ? "Medium" : "Low";

    return {
      ...application,
      merchant,
      risk,
    };
  }), [applications, merchants]);

  const filtered = enriched.filter((item) => {
    const merchantName = item.merchant?.businessName ?? item.merchant?.fullName ?? "Merchant";
    const matchSearch =
      merchantName.toLowerCase().includes(search.toLowerCase()) ||
      (item.merchant?.fullName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "All" || item.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const totalRequestedKobo = filtered.reduce((sum, item) => sum + Number(item.amountKobo), 0);

  const decide = async (id: string, decision: "approve" | "decline") => {
    await fetchBackend(`/lender/applications/${id}/decision`, {
      method: "POST",
      bodyJson: { decision },
    });
    setDecisions((current) => ({ ...current, [id]: decision }));
  };

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Approval Queue</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Review and decide real backend applications</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pending", val: filtered.length.toString(), color: "#ff6b00" },
            { label: "High Risk", val: filtered.filter((item) => item.risk === "High").length.toString(), color: "#dc2626" },
            { label: "Total Requested", val: formatNairaFromKobo(totalRequestedKobo), color: "#ff6b00" },
            { label: "Merchants", val: merchants.length.toString(), color: "#16a34a" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] rounded-2xl p-4 text-center" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: s.color }}>{s.val}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

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
                style={riskFilter === r ? { backgroundColor: "#ff6b00", color: "#fff" } : { backgroundColor: "#161616", color: "#cbd5e1", border: "1px solid #1e1e1e" }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Merchant", "Business Type", "Requested", "Purpose", "Risk", "Submitted", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const dec = decisions[app.id];
                  const merchantName = app.merchant?.businessName ?? app.merchant?.fullName ?? "Merchant";
                  const ownerName = app.merchant?.fullName ?? "Unknown owner";
                  const normalizedStatus = dec ? (dec === "approve" ? "approved" : "declined") : app.status;

                  return (
                    <tr key={app.id} className={`hover:bg-[#161616] transition-colors ${dec ? "opacity-60" : ""}`} style={{ borderBottom: "1px solid #1e1e1e" }}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#ff6b00" }}>{merchantName[0]}</div>
                          <div>
                            <p className="font-semibold text-[#f0f0f0] text-xs">{merchantName}</p>
                            <p className="text-xs text-[#94a3b8]">{ownerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#cbd5e1] text-xs">{app.merchant?.businessType ?? "General"}</td>
                      <td className="px-4 py-4 font-semibold text-[#f0f0f0] text-xs">{formatNairaFromKobo(app.amountKobo)}</td>
                      <td className="px-4 py-4 text-[#cbd5e1] text-xs max-w-28 truncate">{app.purpose}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: riskStyle[app.risk].color, backgroundColor: riskStyle[app.risk].bg }}>{app.risk}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#94a3b8]">{formatDateLabel(app.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: statusStyle[normalizedStatus]?.color ?? "#d97706", backgroundColor: statusStyle[normalizedStatus]?.bg ?? "#fef3c7" }}>
                          {normalizedStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {!dec && (
                          <div className="flex items-center gap-2">
                            <Link href={`/lender/merchants/${app.userId}`}>
                              <button className="p-1.5 rounded-lg border transition-all hover:bg-[#161616]" style={{ borderColor: "#1e1e1e" }} title="View">
                                <Visibility style={{ fontSize: 14, color: "#cbd5e1" }} />
                              </button>
                            </Link>
                            <button onClick={() => void decide(app.id, "approve")} className="p-1.5 rounded-lg transition-all hover:bg-[#dcfce7]" style={{ border: "1px solid #bbf7d0" }} title="Approve">
                              <CheckCircle style={{ fontSize: 14, color: "#16a34a" }} />
                            </button>
                            <button onClick={() => void decide(app.id, "decline")} className="p-1.5 rounded-lg transition-all hover:bg-[#fee2e2]" style={{ border: "1px solid #fecaca" }} title="Decline">
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
      </div>
    </AppShell>
  );
}

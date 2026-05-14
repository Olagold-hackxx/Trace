"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useLenderData } from "@/hooks/use-lender-data";
import { formatNairaFromKobo, formatDateLabel } from "@/lib/backend";
import { Spinner } from "@/components/ui/spinner";
import { People, Work, ArrowOutward, LocationOn } from "@mui/icons-material";

export default function LenderJobsPage() {
  const { jobs, merchants, loading } = useLenderData();

  const merchantIndex = Object.fromEntries(merchants.map((m) => [m.id, m]));

  const hiringMetrics = [
    { label: "Active Borrower Jobs", value: jobs.filter((j) => j.status === "active").length, color: "#ff6b00" },
    { label: "Total Listings", value: jobs.length, color: "#16a34a" },
    { label: "Unique Employers", value: new Set(jobs.map((j) => j.userId)).size, color: "#ff6b00" },
    { label: "Merchants with Jobs", value: merchants.filter((m) => jobs.some((j) => j.userId === m.id)).length, color: "#dc2626" },
  ];

  if (loading) {
    return (
      <AppShell role="lender">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading hiring signals...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
            Jobs & Hiring Signals
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Workforce activity across your borrower portfolio, mapped to demand and execution risk.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {hiringMetrics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">{item.label}</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1e1e1e" }}>
            <div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Portfolio Hiring Activity
              </h2>
              <p className="text-sm text-[#94a3b8] mt-1">Track hiring velocity and labor demand without leaving the lender workspace.</p>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-[#94a3b8]">No job listings found in portfolio</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                    {["Merchant", "Role", "Category", "Pay", "Location", "Status", "Posted"].map((header) => (
                      <th key={header} className="text-left px-5 py-4 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const merchant = merchantIndex[job.userId];
                    return (
                      <tr key={job.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ff6b00" }}>
                              {(merchant?.businessName ?? merchant?.fullName ?? "M")[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-[#f0f0f0]">{merchant?.businessName ?? merchant?.fullName ?? "Merchant"}</p>
                              <p className="text-xs text-[#64748b]">{job.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#cbd5e1]">{job.title}</td>
                        <td className="px-5 py-4 text-[#cbd5e1]">{job.category}</td>
                        <td className="px-5 py-4 font-semibold text-[#f0f0f0]">{formatNairaFromKobo(job.payKobo)}/day</td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-[#94a3b8] text-xs">
                            <LocationOn style={{ fontSize: 13 }} />{job.location}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}
                          >
                            <Work style={{ fontSize: 12 }} />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#94a3b8] text-xs">{formatDateLabel(job.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl p-5 flex items-center justify-between gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <div>
            <p className="text-sm font-semibold text-[#f0f0f0]">Hiring strength is increasingly a credit signal.</p>
            <p className="text-sm text-[#94a3b8] mt-1">Merchants filling roles quickly tend to sustain revenue continuity and repayment discipline.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#ff6b00" }}>
            Review borrower patterns
            <ArrowOutward style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

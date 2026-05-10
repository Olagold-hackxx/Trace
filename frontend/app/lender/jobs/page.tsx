"use client";

import { AppShell } from "@/components/layout/app-shell";
import { People, Work, CheckCircle, AccessTime, Warning, ArrowOutward } from "@mui/icons-material";

const hiringSignals = [
  { label: "Active Borrower Jobs", value: "38", color: "#2563eb" },
  { label: "Workers Hired", value: "112", color: "#16a34a" },
  { label: "Urgent Roles", value: "9", color: "#ff6b00" },
  { label: "At-Risk Staffing", value: "4", color: "#dc2626" },
];

const jobs = [
  { id: "J-1001", merchant: "Amaka Foods", title: "Sales Assistant", applicants: 14, hired: 2, pay: "₦8,500/day", status: "Hiring", signal: "Healthy", location: "Yaba" },
  { id: "J-1002", merchant: "QuickEats", title: "Delivery Rider", applicants: 22, hired: 3, pay: "₦6,000/day", status: "Filled", signal: "Strong demand", location: "Surulere" },
  { id: "J-1003", merchant: "BabaChef Catering", title: "Kitchen Assistant", applicants: 4, hired: 0, pay: "₦5,000/day", status: "Hiring", signal: "Slow fill", location: "Oshodi" },
  { id: "J-1004", merchant: "City Bakery", title: "Cashier", applicants: 19, hired: 1, pay: "₦5,500/day", status: "Hiring", signal: "Healthy", location: "Agege" },
  { id: "J-1005", merchant: "TechFix Lagos", title: "Store Assistant", applicants: 3, hired: 0, pay: "₦4,500/day", status: "Urgent", signal: "Weak demand", location: "Gbagada" },
];

const signalStyle: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Healthy: { bg: "#dcfce7", color: "#16a34a", icon: CheckCircle },
  "Strong demand": { bg: "#dae2fd", color: "#2563eb", icon: People },
  "Slow fill": { bg: "#fef3c7", color: "#d97706", icon: AccessTime },
  "Weak demand": { bg: "#fee2e2", color: "#dc2626", icon: Warning },
};

export default function LenderJobsPage() {
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
          {hiringSignals.map((item) => (
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Merchant", "Role", "Applicants", "Hired", "Pay", "Location", "Status", "Signal"].map((header) => (
                    <th key={header} className="text-left px-5 py-4 font-semibold text-xs text-[#94a3b8] whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const signal = signalStyle[job.signal];
                  const SignalIcon = signal.icon;
                  return (
                    <tr key={job.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#2563eb" }}>
                            {job.merchant[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[#f0f0f0]">{job.merchant}</p>
                            <p className="text-xs text-[#64748b]">{job.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#cbd5e1]">{job.title}</td>
                      <td className="px-5 py-4 text-[#f0f0f0] font-semibold">{job.applicants}</td>
                      <td className="px-5 py-4 text-[#f0f0f0] font-semibold">{job.hired}</td>
                      <td className="px-5 py-4 text-[#f0f0f0] font-semibold">{job.pay}</td>
                      <td className="px-5 py-4 text-[#94a3b8]">{job.location}</td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: job.status === "Urgent" ? "#3b1d09" : "#172554",
                            color: job.status === "Urgent" ? "#ff6b00" : "#93c5fd",
                          }}
                        >
                          <Work style={{ fontSize: 12 }} />
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: signal.bg, color: signal.color }}>
                          <SignalIcon style={{ fontSize: 12 }} />
                          {job.signal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-2xl p-5 flex items-center justify-between gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <div>
            <p className="text-sm font-semibold text-[#f0f0f0]">Hiring strength is increasingly a credit signal.</p>
            <p className="text-sm text-[#94a3b8] mt-1">Merchants filling roles quickly tend to sustain revenue continuity and repayment discipline.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#2563eb" }}>
            Review borrower patterns
            <ArrowOutward style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

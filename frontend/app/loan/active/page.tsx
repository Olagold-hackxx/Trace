import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { activeLoan } from "@/lib/demo-data";
import { CalendarMonth, CheckCircle, Payments, Shield, Timeline } from "@mui/icons-material";

export default function ActiveLoanPage() {
  return (
    <AppShell role="user" title="Active Loan">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.25fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00] mb-3">Live facility</p>
              <h1 className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                {activeLoan.facility}
              </h1>
              <p className="text-sm text-[#94a3b8] mt-2">
                Your facility is active with {activeLoan.lender}. Track repayment progress, next due date, and remaining balance here.
              </p>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <LoanMetric label="Facility amount" value={activeLoan.amount} icon={Payments} />
                <LoanMetric label="Monthly repayment" value={activeLoan.monthlyRepayment} icon={CalendarMonth} />
                <LoanMetric label="Remaining balance" value={activeLoan.remaining} icon={Timeline} />
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#f0f0f0]">Repayment progress</p>
                  <p className="text-sm font-bold text-[#ff6b00]">{activeLoan.completionPct}% complete</p>
                </div>
                <div className="h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "#1e1e1e" }}>
                  <div className="h-full rounded-full" style={{ width: `${activeLoan.completionPct}%`, backgroundColor: "#ff6b00" }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8]">Repaid: <span className="font-semibold text-[#f0f0f0]">{activeLoan.repaid}</span></span>
                  <span className="text-[#94a3b8]">Outstanding: <span className="font-semibold text-[#f0f0f0]">{activeLoan.remaining}</span></span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Repayment timeline
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Facility disbursed", date: activeLoan.disbursedOn, status: "completed" },
                  { title: "1st repayment processed", date: "June 12, 2026", status: "completed" },
                  { title: "2nd repayment scheduled", date: activeLoan.nextDueDate, status: "current" },
                  { title: "Final repayment", date: "May 12, 2027", status: "upcoming" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle
                        style={{
                          fontSize: 18,
                          color: item.status === "completed" ? "#16a34a" : item.status === "current" ? "#ff6b00" : "#64748b",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#f0f0f0]">{item.title}</p>
                      <p className="text-xs text-[#94a3b8]">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Facility details
              </h2>
              <div className="space-y-3 text-sm">
                <Row label="Lender" value={activeLoan.lender} />
                <Row label="Rate" value={activeLoan.rate} />
                <Row label="Tenor" value={activeLoan.tenor} />
                <Row label="Next due date" value={activeLoan.nextDueDate} />
                <Row label="Auto debit" value={activeLoan.autopayEnabled ? "Enabled" : "Disabled"} />
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <div className="flex items-center gap-3 mb-4">
                <Shield style={{ fontSize: 20, color: "#ff6b00" }} />
                <div>
                  <p className="text-sm font-semibold text-[#f0f0f0]">Repayment health</p>
                  <p className="text-xs text-[#94a3b8]">You are on track with no current delinquency flags.</p>
                </div>
              </div>
              <Link
                href="/payments"
                className="w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#ff6b00" }}
              >
                Make a repayment
              </Link>
              <Link
                href="/score"
                className="mt-3 w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e", color: "#f0f0f0" }}
              >
                Back to score
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function LoanMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Payments;
}) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
      <Icon style={{ fontSize: 20, color: "#ff6b00", marginBottom: 10 }} />
      <p className="text-xs text-[#94a3b8] mb-1">{label}</p>
      <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#94a3b8]">{label}</span>
      <span className="font-semibold text-[#f0f0f0]">{value}</span>
    </div>
  );
}

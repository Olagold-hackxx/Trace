import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { activeLoan, lenderOffers } from "@/lib/demo-data";
import { AccountBalanceWallet, ChevronRight, Payments, Timeline, EditNote } from "@mui/icons-material";

export default function Page() {
  return (
    <AppShell role="user" title="Loans">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00] mb-3">Loan hub</p>
              <h1 className="text-3xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Manage your offers and active facility
              </h1>
              <p className="text-sm text-[#94a3b8] mt-2 max-w-2xl">
                This page is the main place for loans. Review pre-qualified offers, open your active repayment page, and track what is currently available to you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/loan/active"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#3b1d09" }}>
                  <Timeline style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Active Loan</p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Open your repayment progress, next due date, and remaining balance.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">{activeLoan.amount}</span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Open
                    <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>

              <Link
                href="/loan/apply"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#3b1d09" }}>
                  <EditNote style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Apply for Loan</p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Submit a direct request with amount, purpose, repayment source, and business proposal.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">Direct request</span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Apply
                    <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>

              <Link
                href="/loan/offer"
                className="rounded-2xl p-5 block transition-all hover:shadow-md"
                style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#3b1d09" }}>
                  <AccountBalanceWallet style={{ fontSize: 22, color: "#ff6b00" }} />
                </div>
                <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan Offers</p>
                <p className="text-sm text-[#94a3b8] mt-2">
                  Review your lender offers and accept the facility that fits your business best.
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#cbd5e1]">{lenderOffers.length} offers ready</span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#ff6b00" }}>
                    Review
                    <ChevronRight style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Current facility snapshot
              </h2>
              <div className="space-y-3 text-sm">
                <Row label="Lender" value={activeLoan.lender} />
                <Row label="Facility" value={activeLoan.facility} />
                <Row label="Outstanding" value={activeLoan.remaining} />
                <Row label="Monthly repayment" value={activeLoan.monthlyRepayment} />
                <Row label="Next due date" value={activeLoan.nextDueDate} />
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>
                Top visible offer
              </h2>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-sm font-semibold text-[#f0f0f0]">{lenderOffers[1].name}</p>
                <p className="text-2xl font-bold text-[#f0f0f0] mt-2" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  {lenderOffers[1].amount}
                </p>
                <div className="space-y-1 mt-3 text-sm text-[#94a3b8]">
                  <p>Rate: <span className="font-semibold text-[#f0f0f0]">{lenderOffers[1].rate}</span></p>
                  <p>Tenor: <span className="font-semibold text-[#f0f0f0]">{lenderOffers[1].tenor}</span></p>
                </div>
                <Link
                  href={`/loan/offer?offer=${lenderOffers[1].id}`}
                  className="mt-4 w-full inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "#ff6b00" }}
                >
                  Review this offer
                </Link>
              </div>
            </div>

            <Link
              href="/loan/apply"
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3b1d09" }}>
                <EditNote style={{ fontSize: 22, color: "#ff6b00" }} />
              </div>
              <div>
                <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Need a custom request?</p>
                <p className="text-sm text-[#94a3b8] mt-1">Open the direct loan application form and submit your proposal.</p>
              </div>
            </Link>

            <Link
              href="/payments"
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
              style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3b1d09" }}>
                <Payments style={{ fontSize: 22, color: "#ff6b00" }} />
              </div>
              <div>
                <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Make a repayment</p>
                <p className="text-sm text-[#94a3b8] mt-1">Open payments and settle your next installment.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
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

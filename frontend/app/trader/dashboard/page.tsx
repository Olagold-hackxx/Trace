import { TraderJobSummary } from "@/components/trader/TraderJobSummary";
import { LoanCard } from "@/components/trader/LoanCard";
import { PaymentCard } from "@/components/trader/PaymentCard";
import { ScoreBreakdown } from "@/components/trader/ScoreBreakdown";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { jobs, loans, scoreBreakdown, traderPayments } from "@/lib/mock-data";

export default function TraderDashboardPage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Trader Dashboard</span>
            <h1>Operate the business with score, credit, and jobs in one loud orange workspace.</h1>
            <p className="subtitle">
              This dashboard connects payment performance, KudiScore movement, loan readiness, and
              shared jobs so staffing and income opportunities are part of the same growth loop.
            </p>
          </div>
          <div className="button-row">
            <a className="button" href="/trader/jobs/new">
              Create Job
            </a>
            <a className="button-secondary" href="/trader/loan">
              Review Loan Options
            </a>
          </div>
        </div>

        <section className="stat-grid">
          <StatCard label="KudiScore" value="82 / 100" foot="Strong payment consistency this week" />
          <StatCard label="Loan readiness" value="High" foot="Two lenders watching settlement velocity" />
          <StatCard label="Open jobs" value="3" foot="Staffing and task requests live now" />
          <StatCard label="Held payouts" value="NGN 18k" foot="Ready for release after completion proof" />
        </section>

        <section className="three-col">
          {traderPayments.map((item) => (
            <PaymentCard key={item.title} item={item} />
          ))}
        </section>

        <section className="two-col">
          <SectionCard
            title="KudiScore breakdown"
            subtitle="The score is not a vanity metric. It tells lenders whether business activity is consistent, resilient, and disciplined enough for operating credit."
          >
            <ScoreBreakdown items={scoreBreakdown} />
          </SectionCard>
          <SectionCard
            title="Today’s operating priorities"
            subtitle="Use jobs when throughput spikes faster than your current team can handle, or apply to nearby tasks when you want extra earnings during slower windows."
          >
            <ul className="checklist">
              <li>Post a same-day sales support request before afternoon rush.</li>
              <li>Review accepted worker proof before releasing held payout.</li>
              <li>Use stronger settlement data to lock in lower credit pricing.</li>
            </ul>
          </SectionCard>
        </section>

        <SectionCard
          title="Loan lane"
          subtitle="Credit becomes easier to justify when payment rhythm is clean and operational execution stays strong."
        >
          <div className="two-col">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Jobs inside the trader side"
          subtitle="There is no worker dashboard. Jobs are embedded here so the trader can create requests, apply for opportunities, manage active work, and pay accepted workers."
        >
          <TraderJobSummary jobs={jobs} />
        </SectionCard>
      </div>
    </main>
  );
}

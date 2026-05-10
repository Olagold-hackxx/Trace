import { LoanCard } from "@/components/trader/LoanCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { loans } from "@/lib/mock-data";

export default function TraderLoanPage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Loan</span>
            <h1>Move from verified payments to usable operating credit.</h1>
            <p className="subtitle">
              This screen turns score, repayment confidence, and business momentum into a clean
              lending conversation.
            </p>
          </div>
          <a className="button" href="/trader/loan/loan_001">
            Open Loan Detail
          </a>
        </div>
        <section className="stat-grid">
          <StatCard label="Ready lenders" value="2" foot="Watching this trader profile now" />
          <StatCard label="Max line" value="NGN 900k" foot="Based on payment and activity depth" />
          <StatCard label="Best rate" value="5.5%" foot="For strongest recent performance" />
          <StatCard label="Jobs support" value="Enabled" foot="Can fund staff and field needs" />
        </section>
        <div className="two-col">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
        <SectionCard
          title="Why jobs belong here"
          subtitle="Short-term finance is often used for exactly the same moments when staffing pressure hits. KudiScore keeps those two decisions close together."
        >
          <p className="subtitle">
            If a trader’s payment flow spikes before inventory and labor capacity can keep up, the
            product should make it easy to pull credit and post a support job in the same session.
          </p>
        </SectionCard>
      </div>
    </main>
  );
}

import { LenderJobSummary } from "@/components/lender/LenderJobSummary";
import { MerchantCard } from "@/components/lender/MerchantCard";
import { PortfolioStats } from "@/components/lender/PortfolioStats";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { jobs, lenderPortfolio, merchants } from "@/lib/mock-data";

export default function LenderDashboardPage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Lender Dashboard</span>
            <h1>See merchants as operating systems, not just loan applications.</h1>
            <p className="subtitle">
              KudiScore gives lenders a broad view of payment quality, readiness for capital, and
              the field tasks needed to reduce underwriting uncertainty.
            </p>
          </div>
          <div className="button-row">
            <a className="button" href="/lender/jobs/new">
              Create Job
            </a>
            <a className="button-secondary" href="/lender/loans">
              Review Loans
            </a>
          </div>
        </div>
        <section className="stat-grid">
          <StatCard label="Loan-ready merchants" value="34" foot="Strong transaction-backed profiles" />
          <StatCard label="Field tasks active" value="11" foot="Verification and follow-up work in motion" />
          <StatCard label="Jobs completed" value="62" foot="Operational work paid and closed" />
          <StatCard label="Portfolio health" value="92%" foot="Recovery and repayment trend positive" />
        </section>
        <PortfolioStats items={lenderPortfolio} />
        <SectionCard
          title="Priority merchants"
          subtitle="These merchants need financing, field work, or both. Jobs are a tool for lowering uncertainty and improving the reliability of lending decisions."
        >
          <div className="two-col">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Jobs inside the lender side"
          subtitle="Lenders create field tasks, KYC collection work, surveys, inspections, and follow-up operations from the same product shell."
        >
          <LenderJobSummary jobs={jobs} />
        </SectionCard>
      </div>
    </main>
  );
}

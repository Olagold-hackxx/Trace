import { PortfolioStats } from "@/components/lender/PortfolioStats";
import { SectionCard } from "@/components/shared/SectionCard";
import { lenderPortfolio } from "@/lib/mock-data";

export default function LenderPortfolioPage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Portfolio</span>
            <h1>Portfolio health becomes more useful when jobs are part of operations.</h1>
            <p className="subtitle">
              Field work, merchant onboarding, and recovery actions can all be created from the same
              lender view instead of relying on disconnected systems.
            </p>
          </div>
        </div>
        <PortfolioStats items={lenderPortfolio} />
        <section className="two-col">
          <SectionCard title="Why this matters" subtitle="A portfolio is not static. It is maintained through action.">
            <p className="subtitle">
              When a merchant becomes ambiguous, a lender can post a location check, survey, or
              follow-up task immediately rather than waiting for manual operations to catch up.
            </p>
          </SectionCard>
          <SectionCard title="Operations layer" subtitle="The jobs module is the bridge between portfolio observation and intervention.">
            <ul className="checklist">
              <li>Verification jobs support underwriting confidence.</li>
              <li>Follow-up jobs support collection and recovery.</li>
              <li>Onboarding jobs increase merchant acquisition velocity.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

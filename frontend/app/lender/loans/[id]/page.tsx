import { SectionCard } from "@/components/shared/SectionCard";
import { loans } from "@/lib/mock-data";

export default function LenderLoanDetailPage({
  params
}: {
  params: { id: string };
}) {
  const loan = loans.find((item) => item.id === params.id) ?? loans[0];

  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Loan Detail</span>
            <h1>{loan.title}</h1>
            <p className="subtitle">{loan.note}</p>
          </div>
          <span className="badge">{loan.status}</span>
        </div>
        <section className="two-col">
          <SectionCard title="Credit rationale" subtitle="Why this merchant may deserve capital now.">
            <ul className="checklist">
              <li>Payment consistency is visible and recent.</li>
              <li>Activity depth suggests real commercial demand.</li>
              <li>Jobs can fill remaining verification gaps cheaply.</li>
            </ul>
          </SectionCard>
          <SectionCard title="Field operations" subtitle="Use the shared jobs module to reduce underwriting blind spots.">
            <ul className="checklist">
              <li>Assign a business location checker.</li>
              <li>Request KYC document collection.</li>
              <li>Run a repayment follow-up task if needed.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

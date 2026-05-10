import { SectionCard } from "@/components/shared/SectionCard";
import { loans } from "@/lib/mock-data";

export default function TraderLoanDetailPage({
  params
}: {
  params: { id: string };
}) {
  const loan = loans.find((item) => item.id === params.id) ?? loans[0];

  return (
    <main className="page trader-page">
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
          <SectionCard title="Offer terms" subtitle="This mock detail page shows how a lender might frame the operating credit decision.">
            <div className="stack">
              <strong>{loan.amount}</strong>
              <p className="subtitle">{loan.rate}</p>
              <p className="subtitle">
                Disbursement is linked to sustained payment flow, low dispute pressure, and clear
                evidence that funds will improve turnover rather than disappear into noise.
              </p>
            </div>
          </SectionCard>
          <SectionCard title="Use of funds" subtitle="KudiScore keeps labor and lending close because real operating decisions are not isolated.">
            <ul className="checklist">
              <li>Restock core goods before the busiest sales windows.</li>
              <li>Post temporary jobs for stock handling or sales support.</li>
              <li>Use stronger activity data to lower future borrowing friction.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

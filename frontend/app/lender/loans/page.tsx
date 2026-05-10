import { LoanRow } from "@/components/lender/LoanRow";
import { SectionCard } from "@/components/shared/SectionCard";
import { loans } from "@/lib/mock-data";

export default function LenderLoansPage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Loans</span>
            <h1>Move merchants from score visibility to lending action.</h1>
            <p className="subtitle">
              The lender side pairs underwriting with operational jobs so missing information can be
              gathered quickly and risk can be priced with more confidence.
            </p>
          </div>
        </div>
        <SectionCard title="Loan pipeline" subtitle="Mock credit opportunities backed by transaction and operations data.">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <LoanRow key={loan.id} loan={loan} />
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

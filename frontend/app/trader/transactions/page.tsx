import { SectionCard } from "@/components/shared/SectionCard";
import { traderTransactions } from "@/lib/mock-data";
import { TransactionRow } from "@/components/trader/TransactionRow";

export default function TraderTransactionsPage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Transactions</span>
            <h1>Readable transaction history for credit, operations, and jobs funding.</h1>
            <p className="subtitle">
              The transaction layer explains why the trader is becoming more bankable and when
              temporary labor demand is starting to build.
            </p>
          </div>
        </div>
        <SectionCard
          title="Recent movement"
          subtitle="Incoming cash, supplier outflows, and worker holds live in one table so operations and finance are visible together."
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {traderTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <section className="two-col">
          <SectionCard
            title="Operational read"
            subtitle="When inventory payments rise and customer inflows spike, the system can suggest staffing before the store becomes overwhelmed."
          >
            <p className="subtitle">
              KudiScore is designed to connect operational strain with action. Instead of treating
              jobs as separate from finance, this UI shows why staffing can be a direct response to
              payment intensity.
            </p>
          </SectionCard>
          <SectionCard
            title="Signals to watch"
            subtitle="These are the movements most likely to affect score and credit posture."
          >
            <ul className="checklist">
              <li>Settlement delays above one day.</li>
              <li>Supplier outflows without matching turnover growth.</li>
              <li>Escrow holds piling up without completion proof.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

import { PaymentCard } from "@/components/trader/PaymentCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { traderPayments } from "@/lib/mock-data";

export default function TraderPaymentsPage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Payments</span>
            <h1>Payment activity is the raw material behind KudiScore.</h1>
            <p className="subtitle">
              Every inflow, settlement, repeat customer signal, and payout decision makes the
              trader profile more legible to lenders and more useful for jobs planning.
            </p>
          </div>
        </div>
        <section className="stat-grid">
          <StatCard label="Captured today" value="NGN 285k" foot="Squad and bank-transfer volume" />
          <StatCard label="Settlements due" value="NGN 120k" foot="Expected before close of business" />
          <StatCard label="Escrow holds" value="NGN 8k" foot="Reserved for accepted jobs" />
          <StatCard label="Disputes" value="0" foot="Clean settlement confidence" />
        </section>
        <section className="three-col">
          {traderPayments.map((item) => (
            <PaymentCard key={item.title} item={item} />
          ))}
        </section>
        <section className="two-col">
          <SectionCard
            title="What lenders infer"
            subtitle="Payment velocity, repeat buying behavior, settlement cleanliness, and dispute history all drive how comfortably a lender can extend short-term business finance."
          >
            <ul className="checklist">
              <li>Frequent verified inflows reduce guesswork.</li>
              <li>Stable settlement cycles support predictable repayment modeling.</li>
              <li>Operational jobs can be funded when sales spikes are visible early.</li>
            </ul>
          </SectionCard>
          <SectionCard
            title="Jobs payout flow"
            subtitle="Once a worker is selected, funds can be held, split, or released on completion, which keeps both the operator and the worker protected."
          >
            <div className="mini-feed">
              <div className="feed-item"><strong>1</strong><span>Create job and set payment method.</span></div>
              <div className="feed-item"><strong>2</strong><span>Accept the best-fit applicant.</span></div>
              <div className="feed-item"><strong>3</strong><span>Confirm proof and release payment.</span></div>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

import { SectionCard } from "@/components/shared/SectionCard";

export default function TraderProfilePage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Profile</span>
            <h1>Trader identity, score reputation, and jobs reliability.</h1>
            <p className="subtitle">
              The profile is more than contact details. It is where business context, trust, and
              operational follow-through come together.
            </p>
          </div>
        </div>
        <section className="two-col">
          <SectionCard title="Business profile" subtitle="Merchant identity and current operating footprint.">
            <ul className="checklist">
              <li>Mama Ngozi&apos;s Provisions</li>
              <li>Mile 12 Market, Lagos</li>
              <li>High repeat-customer grocery trader</li>
            </ul>
          </SectionCard>
          <SectionCard title="Trust layer" subtitle="Signals that other users, lenders, and workers can read.">
            <ul className="checklist">
              <li>KudiScore 82 with positive weekly trend.</li>
              <li>Completed jobs with verified payout history.</li>
              <li>Stable settlement behavior and low dispute risk.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

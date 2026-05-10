import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { adminFeed, demoStory } from "@/lib/mock-data";

const controls = [
  "Simulate Job Created",
  "Simulate Worker Applied",
  "Simulate Worker Accepted",
  "Simulate Job Completed",
  "Simulate Worker Paid"
];

export default function AdminDemoPage() {
  return (
    <main className="landing-shell">
      <div className="landing-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin Demo</span>
            <h1>Demo the full KudiScore story from payment to worker payout.</h1>
            <p className="subtitle">
              This UI-only admin view is built around mock data and the exact demo narrative you
              specified, including jobs as a shared feature inside trader and lender flows.
            </p>
          </div>
        </div>

        <section className="stat-grid">
          <StatCard label="Trader event" value="Live" foot="Squad payment received and scored" />
          <StatCard label="Loan state" value="Approved" foot="Lender sees trader as ready" />
          <StatCard label="Job state" value="Completed" foot="Worker accepted and task finished" />
          <StatCard label="Payout" value="Released" foot="Final proof confirmed" />
        </section>

        <SectionCard title="Jobs demo controls" subtitle="Interactive-looking controls for the demo flow.">
          <div className="button-row">
            {controls.map((control) => (
              <button key={control} className="button">
                {control}
              </button>
            ))}
          </div>
        </SectionCard>

        <section className="two-col">
          <SectionCard title="Live feed" subtitle="The feed mirrors the exact event language required for the admin story.">
            <div className="mini-feed">
              {adminFeed.map((item, index) => (
                <div key={item} className="feed-item">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Final demo story" subtitle="Exact flow for the product walkthrough.">
            <div className="timeline-rail">
              {demoStory.map((step, index) => (
                <div key={step} className="feed-item">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

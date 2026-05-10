import { JobForm } from "@/components/jobs/JobForm";
import { SectionCard } from "@/components/shared/SectionCard";

const categories = [
  "Sales assistant",
  "Delivery helper",
  "Inventory helper",
  "POS/payment assistant",
  "Market helper",
  "Field verification",
  "Other"
];

export default function TraderNewJobPage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>Create Trader Job</h1>
            <p className="subtitle">
              Post flexible work directly from the trader workspace so market demand, staffing, and
              payment release all stay close together.
            </p>
          </div>
        </div>
        <section className="two-col">
          <JobForm
            role="trader"
            categories={categories}
            infoMessage="Workers can apply once your job is live. You choose who to accept."
          />
          <div className="stack">
            <SectionCard
              title="What makes a strong post"
              subtitle="Longer job pages work better when expectations are clear, concrete, and tied to real business context."
            >
              <ul className="checklist">
                <li>Name the busy period or exact operating problem.</li>
                <li>State what the worker must finish before payment release.</li>
                <li>Use required skills to filter weak-fit applicants quickly.</li>
              </ul>
            </SectionCard>
            <SectionCard
              title="Suggested trader job types"
              subtitle="These categories reflect common merchant support moments."
            >
              <ul className="checklist">
                <li>Sales counter help during rush-hour traffic.</li>
                <li>Inventory counting before or after settlement days.</li>
                <li>POS support for high-velocity payment periods.</li>
              </ul>
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
  );
}

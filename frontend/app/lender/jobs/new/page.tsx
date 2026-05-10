import { JobForm } from "@/components/jobs/JobForm";
import { SectionCard } from "@/components/shared/SectionCard";

const categories = [
  "Field verification",
  "KYC collection",
  "Market survey",
  "Loan follow-up",
  "Merchant onboarding",
  "Business inspection",
  "Other"
];

export default function LenderNewJobPage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>Create Lender Job</h1>
            <p className="subtitle">
              Build operational jobs for field work, verification, surveys, and merchant support
              without leaving the lender workspace.
            </p>
          </div>
        </div>
        <section className="two-col">
          <JobForm
            role="lender"
            categories={categories}
            infoMessage="Use jobs to assign field work, verification tasks, and merchant operations."
          />
          <div className="stack">
            <SectionCard
              title="Good lender job patterns"
              subtitle="A strong operational task should reduce risk, improve evidence, or accelerate merchant servicing."
            >
              <ul className="checklist">
                <li>Define the exact proof expected from the field worker.</li>
                <li>Set urgency based on underwriting or recovery pressure.</li>
                <li>Use verification requirements when sensitivity is high.</li>
              </ul>
            </SectionCard>
            <SectionCard
              title="Field checklist preview"
              subtitle="The UI expects supporting evidence, not vague task completion."
            >
              <ul className="checklist">
                <li>Geo-tagged photo or check-in proof.</li>
                <li>Simple report or note on merchant activity.</li>
                <li>Confirmation that requested documents were collected.</li>
              </ul>
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
  );
}

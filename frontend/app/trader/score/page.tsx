import { ScoreBreakdown } from "@/components/trader/ScoreBreakdown";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { scoreBreakdown } from "@/lib/mock-data";

export default function TraderScorePage() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">KudiScore</span>
            <h1>Your score is the market-readable language of the business.</h1>
            <p className="subtitle">
              It tells lenders whether the payment trail is real, whether the business is durable,
              and whether operational follow-through makes financing or jobs support rational.
            </p>
          </div>
        </div>
        <section className="stat-grid">
          <StatCard label="Current score" value="82" foot="Moved up 4 points this week" />
          <StatCard label="Trend" value="+4" foot="Driven by strong payment consistency" />
          <StatCard label="Risk pressure" value="Low" foot="No major dispute or default signals" />
          <StatCard label="Labor strain" value="Medium" foot="Rush-hour staffing recommended" />
        </section>
        <section className="two-col">
          <SectionCard
            title="Score breakdown"
            subtitle="Each component explains why the trader is getting more or less credit-worthy."
          >
            <ScoreBreakdown items={scoreBreakdown} />
          </SectionCard>
          <SectionCard
            title="How jobs affect score"
            subtitle="Jobs do not directly inflate the number, but reliable use of workers, completion proof, and disciplined payout flows strengthen operational reliability."
          >
            <ul className="checklist">
              <li>Complete jobs with clear proof and fast payment release.</li>
              <li>Keep acceptance decisions traceable.</li>
              <li>Avoid abandoned tasks that break operating trust.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

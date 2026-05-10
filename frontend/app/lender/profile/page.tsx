import { SectionCard } from "@/components/shared/SectionCard";

export default function LenderProfilePage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Profile</span>
            <h1>Lender identity, underwriting posture, and field operations history.</h1>
            <p className="subtitle">
              This profile gathers the signals that define how the lender operates inside KudiScore,
              including job creation for verification and merchant support.
            </p>
          </div>
        </div>
        <section className="two-col">
          <SectionCard title="Institution profile" subtitle="Core identity and operating focus.">
            <ul className="checklist">
              <li>BlueRiver Microfinance</li>
              <li>Merchant finance and working capital focus</li>
              <li>Heavy use of field verification and onboarding jobs</li>
            </ul>
          </SectionCard>
          <SectionCard title="Operational strengths" subtitle="What this lender is optimized to do.">
            <ul className="checklist">
              <li>Read merchant payment trails quickly.</li>
              <li>Convert uncertainty into assignable field tasks.</li>
              <li>Track completion proof and release payout cleanly.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

import { SectionCard } from "@/components/shared/SectionCard";
import { merchants } from "@/lib/mock-data";

export default function LenderMerchantDetailPage({
  params
}: {
  params: { id: string };
}) {
  const merchant = merchants.find((item) => item.id === params.id) ?? merchants[0];

  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Merchant Detail</span>
            <h1>{merchant.name}</h1>
            <p className="subtitle">{merchant.need}</p>
          </div>
          <span className="badge">Score {merchant.score}</span>
        </div>
        <section className="two-col">
          <SectionCard title="Business snapshot" subtitle="Merchant identity, trade context, and recent need.">
            <p className="subtitle">
              {merchant.sector} operator based in {merchant.location}. This merchant has enough
              visible activity to justify closer underwriting attention.
            </p>
          </SectionCard>
          <SectionCard title="Next action" subtitle="Jobs can reduce uncertainty before capital is extended.">
            <ul className="checklist">
              <li>Post a shop verification task.</li>
              <li>Run a market survey around inventory turnover.</li>
              <li>Confirm location and operating hours through field proof.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

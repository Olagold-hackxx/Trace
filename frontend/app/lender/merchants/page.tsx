import { MerchantCard } from "@/components/lender/MerchantCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { merchants } from "@/lib/mock-data";

export default function LenderMerchantsPage() {
  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Merchants</span>
            <h1>Track merchants with enough depth to lend and enough context to act.</h1>
            <p className="subtitle">
              This list is not just a CRM. It is a payment-informed view of which businesses are
              maturing, which need verification, and which need field jobs before a decision is safe.
            </p>
          </div>
        </div>
        <SectionCard
          title="Merchant pipeline"
          subtitle="The strongest profiles already have transaction depth. Weaker profiles can be improved through field verification and operating support."
        >
          <div className="two-col">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

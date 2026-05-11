import { MarketplacePage } from "@/components/marketplace/marketplace-page";

export default function Page() {
  return <MarketplacePage role="lender" postJobHref="/lender/jobs" detailBasePath="/lender/marketplace" />;
}

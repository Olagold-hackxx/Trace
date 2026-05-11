import { MarketplaceDetailPage } from "@/components/marketplace/marketplace-detail-page";

export default function Page() {
  return (
    <MarketplaceDetailPage
      role="lender"
      backHref="/lender/marketplace"
      applicationsHref="/lender/jobs"
      similarBasePath="/lender/marketplace"
    />
  );
}

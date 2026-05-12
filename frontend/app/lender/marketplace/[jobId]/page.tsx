import { MarketplaceDetailPage } from "@/components/marketplace/marketplace-detail-page";

export default function Page({ params }: { params: { jobId: string } }) {
  return (
    <MarketplaceDetailPage
      role="lender"
      backHref="/lender/marketplace"
      applicationsHref="/lender/jobs"
      similarBasePath="/lender/marketplace"
      jobId={params.jobId}
    />
  );
}

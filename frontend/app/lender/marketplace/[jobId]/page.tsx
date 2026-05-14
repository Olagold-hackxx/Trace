import { MarketplaceDetailPage } from "@/components/marketplace/marketplace-detail-page";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <MarketplaceDetailPage
      role="lender"
      backHref="/lender/marketplace"
      applicationsHref="/lender/jobs"
      similarBasePath="/lender/marketplace"
      jobId={jobId}
    />
  );
}

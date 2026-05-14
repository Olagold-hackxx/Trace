import { MarketplaceDetailPage } from "@/components/marketplace/marketplace-detail-page";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <MarketplaceDetailPage
      role="user"
      backHref="/marketplace"
      applicationsHref="/jobs"
      similarBasePath="/marketplace"
      jobId={jobId}
    />
  );
}

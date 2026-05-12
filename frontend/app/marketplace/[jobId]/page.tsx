import { MarketplaceDetailPage } from "@/components/marketplace/marketplace-detail-page";

export default function Page({ params }: { params: { jobId: string } }) {
  return (
    <MarketplaceDetailPage
      role="user"
      backHref="/marketplace"
      applicationsHref="/jobs"
      similarBasePath="/marketplace"
      jobId={params.jobId}
    />
  );
}

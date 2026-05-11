import { MarketplacePage } from "@/components/marketplace/marketplace-page";

export default function Page() {
  return <MarketplacePage role="user" postJobHref="/jobs?openPost=1" detailBasePath="/marketplace" />;
}

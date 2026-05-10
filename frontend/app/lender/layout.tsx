import { AppShell } from "@/components/shared/AppShell";
import { lenderSidebar } from "@/lib/navigation";

export default function LenderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      variant="lender"
      title="Lender Workspace"
      subtitle="Merchant intelligence, loans, field tasks, and jobs in one operating view."
      links={lenderSidebar}
    >
      {children}
    </AppShell>
  );
}

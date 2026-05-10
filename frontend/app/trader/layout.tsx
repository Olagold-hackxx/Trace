import { AppShell } from "@/components/shared/AppShell";
import { traderSidebar } from "@/lib/navigation";

export default function TraderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      variant="trader"
      title="Trader Workspace"
      subtitle="Payments, score, credit, jobs, and worker payouts in one place."
      links={traderSidebar}
    >
      {children}
    </AppShell>
  );
}

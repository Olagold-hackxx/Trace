import { Sidebar } from "@/components/shared/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  variant: "trader" | "lender";
  title: string;
  subtitle: string;
  links: Array<{ href: string; label: string }>;
};

export function AppShell({
  children,
  variant,
  title,
  subtitle,
  links
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar title={title} subtitle={subtitle} variant={variant} links={links} />
      {children}
    </div>
  );
}

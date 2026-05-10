"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  title: string;
  subtitle: string;
  variant: "trader" | "lender";
  links: Array<{ href: string; label: string }>;
};

export function Sidebar({ title, subtitle, variant, links }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar sidebar-${variant}`}>
      <div className="sidebar-brand">
        <span className="eyebrow">KudiScore</span>
        <strong>{title}</strong>
        <span className="muted">{subtitle}</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-note">
        Jobs live inside this workspace. Users can post, apply, manage, and release payment without a separate worker app.
      </div>
    </aside>
  );
}

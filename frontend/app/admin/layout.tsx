"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import {
  Dashboard,
  People,
  AccountBalance,
  BarChart,
  Settings,
  Logout,
  Security,
  Notifications,
} from "@mui/icons-material";

const adminNav = [
  { label: "Overview", href: "/admin", icon: Dashboard },
  { label: "Users", href: "/admin/users", icon: People },
  { label: "Lenders", href: "/admin/lenders", icon: AccountBalance },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart },
  { label: "Compliance", href: "/admin/compliance", icon: Security },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
      {/* Admin sidebar — dark navy */}
      <aside className="flex flex-col w-64 shrink-0 h-full border-r" style={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <BrandLogo href="/" iconSize={36} textSize={20} textColor="#ffffff" subtitle="Admin" subtitleColor="#f59e0b" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <AdminNav />
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Logout style={{ fontSize: 20 }} />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Admin topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b shrink-0" style={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-sm text-slate-400 font-medium">System Administration Portal</p>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all">
              <Notifications style={{ fontSize: 20 }} />
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#f59e0b" }}>AD</div>
              <span className="text-sm font-medium text-white">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#0f172a" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</p>
      {adminNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={
              isActive
                ? { backgroundColor: "rgba(255,107,0,0.15)", color: "#ffb693" }
                : { color: "#94a3b8" }
            }
          >
            <Icon style={{ fontSize: 20 }} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

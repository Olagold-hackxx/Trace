"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dashboard,
  Wallet,
  TrendingUp,
  Work,
  Storefront,
  Settings,
  Logout,
  AccountBalanceWallet,
  Groups,
  BarChart,
} from "@mui/icons-material";

interface SidebarProps {
  role?: "user" | "lender";
}

const userNav = [
  { label: "Dashboard", href: "/dashboard", icon: Dashboard },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "TraceScore", href: "/tracescore", icon: TrendingUp },
  { label: "Jobs & Hiring", href: "/jobs", icon: Work },
  { label: "Marketplace", href: "/marketplace", icon: Storefront },
];

const lenderNav = [
  { label: "Dashboard", href: "/lender", icon: Dashboard },
  { label: "Loan Pipeline", href: "/lender/approvals", icon: AccountBalanceWallet },
  { label: "Merchants", href: "/lender/traders", icon: Groups },
  { label: "Jobs & Hiring", href: "/lender/jobs", icon: Work },
  { label: "Marketplace", href: "/lender/marketplace", icon: Storefront },
  { label: "Analytics", href: "/lender/settings", icon: BarChart },
  { label: "Settings", href: "/lender/settings", icon: Settings },
];

export function Sidebar({ role = "user" }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "lender" ? lenderNav : userNav;
  const accentColor = role === "lender" ? "#2563eb" : "#ff6b00";
  const accentSoft = role === "lender" ? "#172554" : "#3b1d09";

  return (
    <aside
      className="flex flex-col w-64 shrink-0 h-full border-r"
      style={{ backgroundColor: "#0d0d0d", borderColor: "#1e1e1e" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#1e1e1e" }}>
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
            style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}
          >
            T
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Epilogue, sans-serif", color: "#f0f0f0" }}
          >
            Trace
          </span>
        </Link>
        {role === "lender" && (
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#172554", color: "#93c5fd" }}
          >
            Lender
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748b]">Navigation</p>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href.length > 1 && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "text-white shadow-sm"
                  : "text-[#cbd5e1] hover:bg-[#161616] hover:text-white"
              )}
              style={isActive ? { backgroundColor: accentColor } : { backgroundColor: "transparent" }}
            >
              <Icon style={{ fontSize: 20 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Score teaser (user only) */}
      {role === "user" && (
        <div className="mx-4 mb-3 p-4 rounded-xl border" style={{ borderColor: "#1e1e1e", backgroundColor: "#111111" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Your TraceScore</p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: accentColor }}>742</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              Excellent
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: accentSoft }}>
            <div className="h-full rounded-full" style={{ width: "74%", backgroundColor: accentColor }} />
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "#1e1e1e" }}>
        <button
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all text-[#cbd5e1] hover:bg-[#161616] hover:text-white"
          style={{ backgroundColor: "transparent" }}
        >
          <Logout style={{ fontSize: 20 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

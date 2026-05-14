"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { useTraderIdentity } from "@/hooks/use-trader-identity";
import { cn } from "@/lib/utils";
import { fetchBackend, TRADER_SESSION_STORAGE_KEY } from "@/lib/backend";
import {
  Dashboard,
  Wallet,
  TrendingUp,
  Work,
  Storefront,
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
  { label: "TraceScore", href: "/score", icon: TrendingUp },
  { label: "Loans", href: "/loan", icon: AccountBalanceWallet },
  { label: "Jobs & Hiring", href: "/jobs", icon: Work },
  { label: "Marketplace", href: "/marketplace", icon: Storefront },
];

const lenderNav = [
  { label: "Dashboard", href: "/lender", icon: Dashboard },
  { label: "Loan Pipeline", href: "/lender/approvals", icon: AccountBalanceWallet },
  { label: "Merchants", href: "/lender/traders", icon: Groups },
  { label: "Jobs & Hiring", href: "/lender/jobs", icon: Work },
  { label: "Marketplace", href: "/lender/marketplace", icon: Storefront },
  { label: "Analytics", href: "/lender/analytics", icon: BarChart },
];

export function Sidebar({ role = "user" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const traderIdentity = useTraderIdentity(role === "user");

  const handleSignOut = async () => {
    try {
      await fetchBackend("/auth/logout", { method: "POST" });
    } catch {
      // best-effort
    }
    window.localStorage.removeItem(TRADER_SESSION_STORAGE_KEY);
    router.push("/auth/login");
  };
  const nav = role === "lender" ? lenderNav : userNav;
  const accentColor = role === "lender" ? "#ff6b00" : "#ff6b00";
  const accentSoft = role === "lender" ? "#3b1d09" : "#3b1d09";
  const exactMatchRoutes = new Set(["/dashboard", "/lender", "/payments", "/score", "/tracescore", "/lender/analytics"]);
  const traderScore = traderIdentity.score?.score ?? 742;
  const scorePct = Math.min(100, Math.round((traderScore / 900) * 100));

  return (
    <aside
      className="flex flex-col w-64 shrink-0 h-full border-r"
      style={{ backgroundColor: "#0d0d0d", borderColor: "#1e1e1e" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "#1e1e1e" }}>
        <BrandLogo href="/" iconSize={36} textSize={22} textColor="#f0f0f0" />
        {role === "lender" && (
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}
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
          const isActive = exactMatchRoutes.has(item.href)
            ? pathname === item.href
            : pathname === item.href || (item.href.length > 1 && pathname.startsWith(`${item.href}/`));
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
            <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: accentColor }}>{traderScore}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              {traderScore >= 750 ? "Excellent" : traderScore >= 650 ? "Good" : "Building"}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: accentSoft }}>
            <div className="h-full rounded-full" style={{ width: `${scorePct}%`, backgroundColor: accentColor }} />
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "#1e1e1e" }}>
        <button
          onClick={handleSignOut}
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

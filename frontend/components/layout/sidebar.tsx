"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Dashboard,
  Wallet,
  TrendingUp,
  Work,
  Storefront,
  BarChart,
  Logout,
  ChevronRight,
  Gavel,
  Settings,
  People,
} from "@mui/icons-material";

interface SidebarProps {
  role?: "trader" | "worker" | "lender" | "admin";
}

export function Sidebar({ role = "trader" }: SidebarProps) {
  const pathname = usePathname();

  // All roles use orange as the active/accent color — no blue
  const accentColor = "#FF6B35";

  const getMenuItems = () => {
    switch (role) {
      case "trader":
        return [
          { label: "Dashboard", href: "/dashboard", icon: Dashboard },
          { label: "Payments", href: "/payments", icon: Wallet },
          { label: "TraceScore", href: "/tracescore", icon: TrendingUp },
          { label: "Jobs", href: "/jobs", icon: Work },
        ];
      case "lender":
        return [
          { label: "Dashboard", href: "/lender", icon: Dashboard },
          { label: "Traders", href: "/lender/traders", icon: Storefront },
          { label: "Approvals", href: "/lender/approvals", icon: Gavel },
          { label: "Settings", href: "/lender/settings", icon: Settings },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin", icon: Dashboard },
          { label: "Analytics", href: "/admin", icon: BarChart },
          { label: "Traders", href: "/admin", icon: Storefront },
          { label: "Workers", href: "/admin", icon: People },
        ];
      case "worker":
        return [
          { label: "Dashboard", href: "/worker", icon: Dashboard },
          { label: "Marketplace", href: "/marketplace", icon: Work },
          { label: "Earnings", href: "/worker", icon: Wallet },
          { label: "Settings", href: "/worker/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "trader": return "Trader";
      case "lender": return "Lender";
      case "admin":  return "Admin";
      case "worker": return "Worker";
      default:       return "User";
    }
  };

  const getUserName = () => {
    switch (role) {
      case "trader": return "Amaka Foods";
      case "lender": return "Zenith Capital";
      case "admin":  return "Admin";
      case "worker": return "Tobi Ade";
      default:       return "User";
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className="w-64 hidden md:flex flex-col"
      style={{ backgroundColor: "#0A0A0F", borderRight: "1px solid #1C1C2E" }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: "1px solid #1C1C2E" }}>
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
            style={{ backgroundColor: accentColor, boxShadow: `0 4px 16px ${accentColor}40` }}
          >
            T
          </div>
          <div>
            <span className="font-black text-lg text-[#F0EFE8] tracking-tight">Trace</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-[10px] font-semibold text-[#5C5A78] uppercase tracking-widest">{getRoleLabel()}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-4 mt-4 rounded-2xl p-4" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-none"
            style={{ backgroundColor: accentColor }}
          >
            {getUserName()[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#F0EFE8] truncate">{getUserName()}</p>
            <p className="text-xs text-[#5C5A78] truncate">{getRoleLabel()} Account</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A3A58]">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/lender" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/lender" && pathname === "/lender");
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 text-sm font-semibold",
                isActive
                  ? "text-white"
                  : "text-[#5C5A78] hover:text-[#F0EFE8] hover:bg-[#141420]"
              )}
              style={
                isActive
                  ? { backgroundColor: accentColor, boxShadow: `0 4px 20px ${accentColor}40` }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <Icon sx={{ fontSize: "20px" }} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight sx={{ fontSize: "16px", opacity: 0.7 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4" style={{ borderTop: "1px solid #1C1C2E" }}>
        {/* Score teaser for trader */}
        {role === "trader" && (
          <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <p className="text-xs text-[#5C5A78] mb-1">TraceScore</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black" style={{ color: "#F5A623" }}>742</p>
              <span className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full">Excellent</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
              <div className="h-full rounded-full" style={{ width: "82%", background: "linear-gradient(90deg, #FF6B35, #F5A623)" }} />
            </div>
          </div>
        )}

        {/* Approval rate teaser for lender */}
        {role === "lender" && (
          <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <p className="text-xs text-[#5C5A78] mb-1">Approval Rate</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black" style={{ color: "#F5A623" }}>90%</p>
              <span className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full">18 approved</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
              <div className="h-full rounded-full" style={{ width: "90%", background: "linear-gradient(90deg, #FF6B35, #F5A623)" }} />
            </div>
          </div>
        )}

        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[#5C5A78] hover:text-[#F0EFE8] hover:bg-[#141420] transition-all text-sm font-semibold">
          <Logout sx={{ fontSize: "20px" }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

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
  People,
  Storefront,
  BarChart,
  Logout,
} from "@mui/icons-material";

interface SidebarProps {
  role?: "trader" | "worker" | "lender" | "admin";
}

export function Sidebar({ role = "trader" }: SidebarProps) {
  const pathname = usePathname();

  const getRoleColor = () => {
    switch (role) {
      case "trader":
        return COLORS.role.trader;
      case "lender":
        return COLORS.role.lender;
      case "admin":
        return COLORS.role.admin;
      default:
        return COLORS.role.trader;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "trader":
        return "Trader";
      case "lender":
        return "Lender";
      case "admin":
        return "Admin";
      default:
        return "Dashboard";
    }
  };

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
          { label: "Traders", href: "/lender", icon: Storefront },
          { label: "Approvals", href: "/lender", icon: TrendingUp },
          { label: "Jobs", href: "/marketplace", icon: Work },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin", icon: Dashboard },
          { label: "Analytics", href: "/admin", icon: BarChart },
          { label: "Traders", href: "/admin", icon: Storefront },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const roleColor = getRoleColor();

  return (
    <aside className="w-64 hidden md:flex flex-col border-r" style={{ backgroundColor: "#0f172a", borderColor: "#e2e8f0" }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "#1e293b" }}>
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: roleColor }}
          >
            T
          </div>
          <span className="font-bold text-lg text-white">Trace</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4">
        <div
          className="px-3 py-2 rounded-lg text-sm font-medium text-white text-center"
          style={{ backgroundColor: roleColor }}
        >
          {getRoleLabel()}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              style={isActive ? { backgroundColor: roleColor } : {}}
            >
              <Icon sx={{ fontSize: "20px" }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: "#1e293b" }}>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
          <Logout sx={{ fontSize: "20px" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

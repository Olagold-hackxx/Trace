"use client";

import { Notifications, AccountCircle, ExpandMore } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

interface AppHeaderProps {
  role?: "trader" | "worker" | "lender" | "admin";
}

export function AppHeader({ role = "trader" }: AppHeaderProps) {
  const getRoleLabel = () => {
    switch (role) {
      case "trader":
        return "Amaka Foods";
      case "lender":
        return "Zenith Capital";
      case "admin":
        return "Admin Portal";
      case "worker":
        return "Amaka Foods";
      default:
        return "Dashboard";
    }
  };

  const getHeaderSubtitle = () => {
    switch (role) {
      case "trader":
        return "Balance: ₦245,500";
      case "lender":
        return "Active Reviews: 3";
      case "admin":
        return "Platform Stats";
      case "worker":
        return "Balance: ₦245,500";
      default:
        return "Welcome";
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: COLORS.primary }}
        >
          {getRoleLabel()[0]}
        </div>
        <div>
          <h2 className="font-semibold text-navy text-sm">{getRoleLabel()}</h2>
          <p className="text-xs text-gray-500">{getHeaderSubtitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
          <Notifications sx={{ fontSize: "24px", color: "#64748b" }} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
          <AccountCircle sx={{ fontSize: "24px", color: "#64748b" }} />
          <ExpandMore sx={{ fontSize: "20px", color: "#64748b" }} />
        </button>
      </div>
    </header>
  );
}

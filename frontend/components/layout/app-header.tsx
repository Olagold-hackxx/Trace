"use client";

import { Notifications, Search, KeyboardArrowDown } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

interface AppHeaderProps {
  role?: "trader" | "worker" | "lender" | "admin";
}

export function AppHeader({ role = "trader" }: AppHeaderProps) {
  const getUser = () => {
    switch (role) {
      case "trader": return { name: "Amaka Okonkwo", business: "Amaka Foods", avatar: "AO", color: COLORS.role.trader };
      case "lender": return { name: "Zenith Capital", business: "Partner Institution", avatar: "ZC", color: COLORS.role.lender };
      case "admin": return { name: "Admin", business: "Trace Platform", avatar: "AD", color: COLORS.role.admin };
      case "worker": return { name: "Tobi Ade", business: "UNILAG · Worker", avatar: "TA", color: COLORS.role.worker };
      default: return { name: "User", business: "Trace", avatar: "U", color: COLORS.primary };
    }
  };

  const user = getUser();

  return (
    <header
      className="h-16 flex items-center justify-between px-6 gap-4"
      style={{ backgroundColor: "#0A0A0F", borderBottom: "1px solid #1C1C2E" }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <div
          className="flex items-center gap-3 flex-1 rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
        >
          <Search sx={{ fontSize: "18px", color: "#5C5A78" }} />
          <span className="text-sm text-[#3A3A58]">Search anything...</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notif */}
        <button
          className="relative p-2.5 rounded-xl transition-colors hover:bg-[#141420]"
          style={{ border: "1px solid #2A2A40" }}
          title="Notifications"
        >
          <Notifications sx={{ fontSize: "20px", color: "#9B99B5" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-[#0A0A0F]" style={{ backgroundColor: COLORS.primary }} />
        </button>

        {/* Profile */}
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#141420]"
          style={{ border: "1px solid #2A2A40" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ backgroundColor: user.color }}
          >
            {user.avatar}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-[#F0EFE8] leading-none">{user.name}</p>
            <p className="text-xs text-[#5C5A78] mt-0.5">{user.business}</p>
          </div>
          <KeyboardArrowDown sx={{ fontSize: "18px", color: "#5C5A78" }} />
        </button>
      </div>
    </header>
  );
}

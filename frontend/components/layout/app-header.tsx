"use client";

import { Notifications, Menu, KeyboardArrowDown } from "@mui/icons-material";
import { getInitials } from "@/lib/backend";
import { useTraderIdentity } from "@/hooks/use-trader-identity";

interface AppHeaderProps {
  role?: "user" | "lender";
  title?: string;
  onMenuClick?: () => void;
}

export function AppHeader({ role = "user", title, onMenuClick }: AppHeaderProps) {
  const traderIdentity = useTraderIdentity(true);
  const name = traderIdentity.user?.fullName ?? "";
  const user = {
    name: name || (role === "lender" ? "Lender" : "Trader"),
    sub: role === "lender"
      ? (traderIdentity.user?.businessName ?? "Partner Institution")
      : (traderIdentity.user?.businessName ?? "Business Account"),
    initials: getInitials(name) || (role === "lender" ? "LN" : "TR"),
    color: "#ff6b00",
  };
  const borderColor = "#1e1e1e";
  const surfaceColor = "#111111";
  const mutedColor = "#64748b";

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 gap-3 border-b shrink-0"
      style={{ backgroundColor: "#0d0d0d", borderColor }}
    >
      {/* Left: hamburger (mobile) + title/search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors hover:bg-[#161616] shrink-0"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: surfaceColor }}
        >
          <Menu sx={{ fontSize: "20px", color: "#f0f0f0" }} />
        </button>

        {title ? (
          <h1 className="text-lg sm:text-xl font-bold text-[#f0f0f0] truncate" style={{ fontFamily: "Epilogue, sans-serif" }}>
            {title}
          </h1>
        ) : (
          <div
            className="hidden sm:flex items-center gap-3 max-w-sm flex-1 rounded-xl px-4 py-2"
            style={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <span className="text-sm" style={{ color: mutedColor }}>Search...</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="relative p-2.5 rounded-xl transition-colors hover:bg-[#161616]"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: surfaceColor }}
        >
          <Notifications sx={{ fontSize: "20px", color: "#f0f0f0" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "#ff6b00" }}
          />
        </button>

        <button
          className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl transition-colors hover:bg-[#161616]"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: surfaceColor }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: user.color }}
          >
            {user.initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[#f0f0f0] leading-none max-w-[120px] truncate" style={{ fontFamily: "Epilogue, sans-serif" }}>
              {user.name}
            </p>
            <p className="text-xs mt-0.5 max-w-[120px] truncate" style={{ color: mutedColor }}>{user.sub}</p>
          </div>
          <KeyboardArrowDown sx={{ fontSize: "18px", color: mutedColor }} className="hidden sm:block" />
        </button>
      </div>
    </header>
  );
}

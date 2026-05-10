"use client";

import { Notifications, Search, KeyboardArrowDown } from "@mui/icons-material";

interface AppHeaderProps {
  role?: "user" | "lender";
  title?: string;
}

export function AppHeader({ role = "user", title }: AppHeaderProps) {
  const user =
    role === "lender"
      ? { name: "Zenith Capital", sub: "Partner Institution", initials: "ZC", color: "#ff6b00" }
      : { name: "Amaka Okonkwo", sub: "Business Account", initials: "AO", color: "#ff6b00" };
  const borderColor = "#1e1e1e";
  const surfaceColor = "#111111";
  const mutedColor = "#64748b";

  return (
    <header
      className="h-16 flex items-center justify-between px-6 gap-4 border-b shrink-0"
      style={{ backgroundColor: "#0d0d0d", borderColor }}
    >
      {/* Left: title or search */}
      <div className="flex items-center gap-4 flex-1">
        {title ? (
          <h1 className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
            {title}
          </h1>
        ) : (
          <div
            className="flex items-center gap-3 max-w-sm flex-1 rounded-xl px-4 py-2"
            style={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <Search sx={{ fontSize: "18px", color: mutedColor }} />
            <span className="text-sm" style={{ color: mutedColor }}>Search...</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
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
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-[#161616]"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: surfaceColor }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: user.color }}
          >
            {user.initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[#f0f0f0] leading-none" style={{ fontFamily: "Epilogue, sans-serif" }}>
              {user.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{user.sub}</p>
          </div>
          <KeyboardArrowDown sx={{ fontSize: "18px", color: mutedColor }} />
        </button>
      </div>
    </header>
  );
}

"use client";

import { Notifications, Search, KeyboardArrowDown } from "@mui/icons-material";

interface AppHeaderProps {
  role?: "user" | "lender";
  title?: string;
}

export function AppHeader({ role = "user", title }: AppHeaderProps) {
  const user =
    role === "lender"
      ? { name: "Zenith Capital", sub: "Partner Institution", initials: "ZC", color: "#2563eb" }
      : { name: "Amaka Okonkwo", sub: "Business Account", initials: "AO", color: "#ff6b00" };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 gap-4 border-b shrink-0"
      style={{ backgroundColor: "#ffffff", borderColor: "#e2bfb0" }}
    >
      {/* Left: title or search */}
      <div className="flex items-center gap-4 flex-1">
        {title ? (
          <h1 className="text-xl font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>
            {title}
          </h1>
        ) : (
          <div
            className="flex items-center gap-3 max-w-sm flex-1 rounded-xl px-4 py-2"
            style={{ backgroundColor: "#fff1eb", border: "1px solid #e2bfb0" }}
          >
            <Search sx={{ fontSize: "18px", color: "#8e7164" }} />
            <span className="text-sm text-[#8e7164]">Search...</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          className="relative p-2.5 rounded-xl transition-colors hover:bg-[#fff1eb]"
          style={{ border: "1px solid #e2bfb0" }}
        >
          <Notifications sx={{ fontSize: "20px", color: "#5a4136" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "#ff6b00" }}
          />
        </button>

        <button
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-[#fff1eb]"
          style={{ border: "1px solid #e2bfb0" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: user.color }}
          >
            {user.initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[#261812] leading-none" style={{ fontFamily: "Epilogue, sans-serif" }}>
              {user.name}
            </p>
            <p className="text-xs text-[#8e7164] mt-0.5">{user.sub}</p>
          </div>
          <KeyboardArrowDown sx={{ fontSize: "18px", color: "#8e7164" }} />
        </button>
      </div>
    </header>
  );
}

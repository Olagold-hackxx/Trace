"use client";

import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";

interface AppShellProps {
  children: React.ReactNode;
  role?: "trader" | "worker" | "lender" | "admin";
}

export function AppShell({ children, role = "trader" }: AppShellProps) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader role={role} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

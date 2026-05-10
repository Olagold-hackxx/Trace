"use client";

import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";

interface AppShellProps {
  children: React.ReactNode;
  role?: "user" | "lender";
  title?: string;
}

export function AppShell({ children, role = "user", title }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#fff8f6" }}>
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader role={role} title={title} />
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#fff8f6" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

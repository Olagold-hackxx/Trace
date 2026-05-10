"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TraderDashboardCards } from "@/components/trader/trader-dashboard-cards";
import { RevenueChart } from "@/components/trader/revenue-chart";
import { ActiveJobsSection } from "@/components/trader/active-jobs-section";
import { ApplicantsSection } from "@/components/trader/applicants-section";
import { IMAGES } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <AppShell role="trader">
      <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Friday, May 9</p>
            <h1 className="text-3xl font-black text-[#F0EFE8]">
              Good morning, Amaka 👋
            </h1>
            <p className="text-[#5C5A78] mt-1">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={IMAGES.trader2}
              alt="Amaka"
              className="w-12 h-12 rounded-2xl object-cover object-top border-2"
              style={{ borderColor: "#FF6B35" }}
            />
            <div>
              <p className="text-sm font-bold text-[#F0EFE8]">Amaka Foods</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-xs text-[#22C55E]">Collections active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <TraderDashboardCards />

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <ApplicantsSection />
          </div>
        </div>

        {/* Jobs */}
        <div className="mt-8">
          <ActiveJobsSection />
        </div>
      </div>
    </AppShell>
  );
}

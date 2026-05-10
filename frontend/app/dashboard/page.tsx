"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TraderDashboardCards } from "@/components/trader/trader-dashboard-cards";
import { RevenueChart } from "@/components/trader/revenue-chart";
import { ActiveJobsSection } from "@/components/trader/active-jobs-section";
import { ApplicantsSection } from "@/components/trader/applicants-section";

export default function DashboardPage() {
  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-3">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back, Amaka! Here&apos;s your business overview and growth opportunities.</p>
        </div>

        {/* Metric Cards */}
        <TraderDashboardCards />

        {/* Main Charts and Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          <div>
            <ApplicantsSection />
          </div>
        </div>

        {/* Jobs Section */}
        <div className="mt-8">
          <ActiveJobsSection />
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/layout/app-shell";
import { JOBS } from "@/lib/mock-data";
import { TRADERS } from "@/lib/constants";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { LocationOn , AccessTime, Business } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function MarketplaceJobDetailPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = JOBS.find((j) => j.id === params.jobId);
  const trader = job ? TRADERS.find((t) => t.id === job.traderId) : null;

  if (!job || !trader) {
    return (
      <AppShell role="trader">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <p className="text-navy text-lg">Job not found</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">{job.title}</h1>
              <p className="text-lg text-text-secondary">{job.traderName}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-text-secondary mb-1">Location</p>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <LocationOn sx={{ fontSize: "18px" }} />
                {job.location}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Duration</p>
              <div className="flex items-center gap-2 text-navy font-semibold">
                <AccessTime sx={{ fontSize: "18px" }} />
                {job.duration}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Pay</p>
              <p className="text-2xl font-bold text-navy">{formatNaira(job.pay)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Category</p>
              <p className="text-navy font-semibold">{job.category}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy mb-3">About This Job</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">{job.description}</p>

          <h3 className="text-lg font-semibold text-navy mb-3">What We&apos;re Looking For</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Reliable and punctual</li>
            <li>Strong attention to detail</li>
            <li>Friendly and professional attitude</li>
            <li>Previous relevant experience preferred</li>
          </ul>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Business sx={{ fontSize: "20px" }} />
            About the Business
          </h2>

          <div className="flex items-start gap-4">
            <img
              src={trader.image}
              alt={trader.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-navy text-lg">{trader.name}</h3>
              <p className="text-sm text-text-secondary mb-2">{trader.category}</p>
              <p className="text-sm text-text-secondary">{trader.location}</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1 text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Save Job
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

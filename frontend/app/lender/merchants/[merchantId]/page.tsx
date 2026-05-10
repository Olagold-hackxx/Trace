"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TRACE_SCORES, TRANSACTIONS, JOBS } from "@/lib/mock-data";
import { TRADERS } from "@/lib/constants";
import { MetricCard } from "@/components/common/metric-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/utils";
import { TrendingUp, Work, Wallet, EmojiEvents, CheckCircle } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function MerchantDetailPage({ params }: { params: { merchantId: string } }) {
  const trader = TRADERS.find((t) => t.id === params.merchantId);
  const traceScore = TRACE_SCORES[params.merchantId as keyof typeof TRACE_SCORES];
  const merchantTransactions = TRANSACTIONS.filter(
    (t) => t.traderId === params.merchantId
  );
  const merchantJobs = JOBS.filter((j) => j.traderId === params.merchantId);

  if (!trader || !traceScore) {
    return (
      <AppShell role="lender">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <p className="text-navy text-lg">Merchant not found</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="lender">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <img
              src={trader.image}
              alt={trader.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">{trader.name}</h1>
              <p className="text-text-secondary mb-2">Owner: {trader.owner}</p>
              <p className="text-text-secondary">{trader.location}</p>
            </div>
          </div>
          <StatusBadge status="approved" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="TraceScore"
            value={traceScore.score}
            icon={EmojiEvents}
            color={COLORS.role.lender}
          />
          <MetricCard
            label="Weekly Revenue"
            value={formatNaira(
              merchantTransactions.reduce((sum, t) => (t.type === "payment_received" ? sum + t.amount : sum), 0)
            )}
            icon={TrendingUp}
            color={COLORS.status.success}
          />
          <MetricCard
            label="Active Jobs"
            value={merchantJobs.length}
            icon={Work}
            color={COLORS.primary}
          />
          <MetricCard
            label="Account Balance"
            value={formatNaira(245500)}
            icon={Wallet}
            color={COLORS.primary}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Assessment */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-navy mb-4">Risk Assessment</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Overall Assessment</p>
                <p className="text-text-secondary leading-relaxed">
                  {trader.name} demonstrates strong financial discipline with consistent monthly revenues exceeding ₦1.8M.
                  The business has maintained a 100% repayment rate and actively hires verified workers through Trace Work,
                  indicating reliable operations and team management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Business History</p>
                  <p className="font-bold text-navy">24 months</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Repayment Rate</p>
                  <p className="font-bold text-green-600">100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Underwriting Decision</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-700 text-sm">Recommended for Approval</p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Strong credit profile, consistent revenue, active hiring
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Recommended Amount</p>
                <p className="text-2xl font-bold text-navy">₦500,000</p>
                <p className="text-xs text-text-secondary mt-1">18% APR, 12-month term</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: COLORS.status.success }}
                >
                  Approve Application
                </Button>
                <Button variant="outline" className="w-full">
                  Reject
                </Button>
                <Button variant="outline" className="w-full">
                  Request More Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {merchantTransactions.slice(0, 5).map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-navy">
                      {txn.type === "payment_received" ? "Payment In" : "Worker Payout"}
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: txn.type === "payment_received" ? COLORS.status.success : COLORS.primary }}>
                        {txn.type === "payment_received" ? "+" : "-"}{formatNaira(txn.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{formatDate(txn.date)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

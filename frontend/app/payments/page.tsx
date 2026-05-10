"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PaymentCard } from "@/components/payment/payment-card";
import { TransactionsTable } from "@/components/payment/transactions-table";
import { MetricCard } from "@/components/common/metric-card";
import { formatNaira } from "@/lib/utils";
import { Wallet, TrendingUp, AccessTime } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

export default function PaymentsPage() {
  return (
    <AppShell role="trader">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Payments</h1>
          <p className="text-text-secondary">Manage your payment channels and transaction history.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="Total Received (This Week)"
            value={formatNaira(1825000)}
            icon={Wallet}
            trend={12}
            color={COLORS.primary}
          />
          <MetricCard
            label="Average Daily Revenue"
            value={formatNaira(260700)}
            icon={TrendingUp}
            trend={8}
            color={COLORS.status.success}
          />
          <MetricCard
            label="Pending Transfers"
            value={formatNaira(45000)}
            icon={AccessTime}
            color={COLORS.status.warning}
          />
        </div>

        {/* Payment Channels */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-navy mb-4">Payment Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PaymentCard
              label="Primary Account"
              accountNumber="1234567890"
              bankName="Zenith Bank"
              accountName="Amaka Foods"
            />
            <PaymentCard
              label="Business Account"
              accountNumber="0987654321"
              bankName="GT Bank"
              accountName="Amaka Okonkwo"
            />
          </div>
        </div>

        {/* Transactions */}
        <TransactionsTable />
      </div>
    </AppShell>
  );
}

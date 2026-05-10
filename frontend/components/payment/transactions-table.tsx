"use client";

import { TRANSACTIONS } from "@/lib/mock-data";
import { formatNaira, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/common/status-badge";
import { NorthEast, SouthWest } from "@mui/icons-material";

export function TransactionsTable() {
  // Filter transactions for current trader
  const traderTransactions = TRANSACTIONS.filter((t) => t.traderId === "trader-1");

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-navy">Recent Transactions</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Source</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {traderTransactions.map((txn) => {
              const isIncoming = txn.type === "payment_received";
              return (
                <tr key={txn.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: isIncoming ? "#d1fae515" : "#fee2e215",
                        }}
                      >
                        {isIncoming ? (
                          <SouthWest sx={{ fontSize: "18px", color: "#10b981" }} />
                        ) : (
                          <NorthEast sx={{ fontSize: "18px", color: "#ff6b00" }} />
                        )}
                      </div>
                      <span className="font-medium text-navy">
                        {isIncoming ? "Incoming" : "Payout"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{txn.source}</td>
                  <td className="px-6 py-4">
                    <span
                      className="font-semibold"
                      style={{ color: isIncoming ? "#10b981" : "#ff6b00" }}
                    >
                      {isIncoming ? "+" : "-"}{formatNaira(txn.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(txn.date)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={txn.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

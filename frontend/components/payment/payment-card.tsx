"use client";

import { ContentCopy, CheckCircle, Payment } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";
import { useState } from "react";

interface PaymentCardProps {
  label: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export function PaymentCard({ label, accountNumber, bankName, accountName }: PaymentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Payment sx={{ fontSize: "24px" }} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-text-secondary mb-1">Account Number</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-mono font-semibold text-navy">{accountNumber}</p>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckCircle sx={{ fontSize: "18px", color: "#10b981" }} />
              ) : (
                <ContentCopy sx={{ fontSize: "18px", color: "#64748b" }} />
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-text-secondary mb-1">Bank</p>
          <p className="font-semibold text-navy">{bankName}</p>
        </div>

        <div>
          <p className="text-xs text-text-secondary mb-1">Account Name</p>
          <p className="font-semibold text-navy">{accountName}</p>
        </div>
      </div>
    </div>
  );
}

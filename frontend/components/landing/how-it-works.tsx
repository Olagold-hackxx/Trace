"use client";

import { Wallet, TrendingUp, Check,People} from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const steps = [
  {
    number: 1,
    title: "Trader Receives Payments",
    description: "Get instant, secure payments from customers via Trace Pay.",
    icon: Wallet,
  },
  {
    number: 2,
    title: "TraceScore Generated",
    description: "Your payment history builds your credit readiness score in real-time.",
    icon: TrendingUp,
  },
  {
    number: 3,
    title: "Lender Approves Capital",
    description: "Access verified, transparent underwriting. Get credit when you need it.",
    icon: Check,
  },
  {
    number: 4,
    title: "Assign Reliable Workers",
    description: "Post jobs, review applicants, and assign reliable workers directly from Trace.",
    icon: People,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">The Trace Product Loop</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Simple, transparent infrastructure that works for African traders, lenders, and job operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
                )}

                <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-4 relative z-10"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Icon sx={{ fontSize: "24px" }} />
                  </div>

                  <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

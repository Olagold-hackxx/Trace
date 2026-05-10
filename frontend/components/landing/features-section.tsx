"use client";

import { Payment, TrendingUp,People} from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const features = [
  {
    title: "Trace Pay",
    description: "Instant payment infrastructure for your shop or trade operation. Get paid fast and build history automatically.",
    icon: Payment,
    highlights: ["Instant settlements", "Virtual accounts", "Payment tracking", "Multi-currency"],
    color: COLORS.primary,
  },
  {
    title: "TraceScore",
    description: "Real-time credit readiness built from payment activity, repayment behavior, and trading consistency.",
    icon: TrendingUp,
    highlights: ["Real-time scoring", "Revenue tracking", "Repayment history", "Risk assessment"],
    color: COLORS.role.lender,
  },
  {
    title: "Trace Jobs",
    description: "Connect with reliable applicants, assign work quickly, and release payouts without leaving Trace.",
    icon: People,
    highlights: ["Verified applicants", "Reliability scores", "Skill matching", "Payout tracking"],
    color: COLORS.navy,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Trace Modules</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Everything traders and lenders need to scale. All built for Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon sx={{ fontSize: "24px" }} style={{ color: feature.color }} />
                </div>

                <h3 className="text-xl font-semibold text-navy mb-2">{feature.title}</h3>
                <p className="text-text-secondary mb-6 text-sm">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-text-secondary">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: feature.color }}
                      ></div>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

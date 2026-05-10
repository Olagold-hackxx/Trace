"use client";

import { Wallet, TrendingUp, CheckCircle, People } from "@mui/icons-material";
import { COLORS } from "@/lib/constants";

const steps = [
  {
    number: "01",
    title: "Collect Payments",
    description: "Share your Trace Pay link on WhatsApp or display your QR at your stall. Customers pay instantly — card, transfer, USSD.",
    icon: Wallet,
    color: "#FF6B35",
  },
  {
    number: "02",
    title: "Build Your Score",
    description: "Every verified payment automatically feeds your TraceScore — a real-time credit readiness profile lenders actually trust.",
    icon: TrendingUp,
    color: "#F5A623",
  },
  {
    number: "03",
    title: "Unlock Capital",
    description: "Lenders on Trace review your score and approve restock capital in days — not months. No collateral. No paperwork wahala.",
    icon: CheckCircle,
    color: "#22C55E",
  },
  {
    number: "04",
    title: "Hire & Scale",
    description: "Post jobs and get verified student workers from UNILAG, LASU nearby. Scale your operations and pay them directly through Trace.",
    icon: People,
    color: "#A855F7",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28" style={{ backgroundColor: "#0F0F1A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A40] px-4 py-2 mb-6" style={{ backgroundColor: "#141420" }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B99B5]">The Trace loop</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#F0EFE8] mb-6 tracking-tight">
            Four steps to a stronger business
          </h2>
          <p className="text-lg text-[#5C5A78] max-w-xl mx-auto">
            Each step feeds the next. The more you use Trace, the more powerful your financial profile becomes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-8 right-8 h-px hidden lg:block" style={{ background: "linear-gradient(to right, #FF6B35, #F5A623, #22C55E, #A855F7)" }} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative group">
                  <div
                    className="rounded-3xl p-8 h-full transition-all duration-300 hover:-translate-y-2"
                    style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
                  >
                    {/* Number badge */}
                    <div className="relative z-10 mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-0"
                        style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}40` }}
                      >
                        <Icon sx={{ fontSize: "28px", color: step.color }} />
                      </div>
                      <div
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-[#0A0A0F]"
                        style={{ backgroundColor: step.color }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: step.color }}>
                      Step {step.number}
                    </p>
                    <h3 className="text-xl font-black text-[#F0EFE8] mb-4">{step.title}</h3>
                    <p className="text-sm text-[#5C5A78] leading-7">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-16 rounded-3xl p-10 text-center" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          <p className="text-2xl font-black text-[#F0EFE8] mb-3">The loop never stops working for you.</p>
          <p className="text-[#5C5A78] max-w-2xl mx-auto">
            More payments → higher score → better capital terms → bigger inventory → more revenue → stronger score. Trace is infrastructure that compounds.
          </p>
        </div>
      </div>
    </section>
  );
}

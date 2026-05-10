"use client";

import { Payment, TrendingUp, People, ArrowForward } from "@mui/icons-material";
import { COLORS, IMAGES } from "@/lib/constants";

const features = [
  {
    title: "Trace Pay",
    subtitle: "Get paid. Every time.",
    description: "Payment links, QR codes, and virtual accounts built for market traders. One link shared on WhatsApp sends money straight to your Trace wallet.",
    icon: Payment,
    highlights: ["Instant settlements", "Virtual accounts", "QR code payments", "Payment links"],
    color: "#FF6B35",
    glow: "rgba(255,107,53,0.15)",
    image: IMAGES.payment,
  },
  {
    title: "TraceScore",
    subtitle: "Your money, proving itself.",
    description: "Every payment you collect builds your credit profile in real-time. Lenders see a verified score — not guesswork. Get capital when your business needs it.",
    icon: TrendingUp,
    highlights: ["Real-time scoring", "Revenue tracking", "Lender-ready reports", "Capital readiness"],
    color: "#F5A623",
    glow: "rgba(245,166,35,0.15)",
    image: IMAGES.market,
  },
  {
    title: "Trace Jobs",
    subtitle: "Staff your hustle fast.",
    description: "Post a job, get verified student applicants from nearby universities. Pay them directly through Trace — no middleman, no wahala.",
    icon: People,
    highlights: ["Verified applicants", "Reliability scores", "Direct payouts", "Skill matching"],
    color: "#A855F7",
    glow: "rgba(168,85,247,0.15)",
    image: IMAGES.jobs,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" style={{ backgroundColor: "#0A0A0F" }} className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A40] px-4 py-2 mb-6" style={{ backgroundColor: "#141420" }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B99B5]">Three modules. One platform.</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#F0EFE8] mb-6 tracking-tight">
            Everything your trade<br />operation needs
          </h2>
          <p className="text-lg text-[#5C5A78] max-w-2xl mx-auto">
            Built from the ground up for African informal traders — the infrastructure big banks never gave you.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
                style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
              >
                {/* Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ boxShadow: `inset 0 0 60px ${feature.glow}` }} />

                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${idx % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                  {/* Image */}
                  <div className={`relative overflow-hidden ${idx % 2 === 1 ? "lg:col-start-2" : ""}`} style={{ minHeight: "320px" }}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(${idx % 2 === 1 ? "to right" : "to left"}, rgba(20,20,32,0.95) 0%, rgba(20,20,32,0.3) 100%)` }} />
                    {/* Icon floating */}
                    <div className="absolute top-6 right-6 rounded-2xl p-3" style={{ backgroundColor: feature.glow, border: `1px solid ${feature.color}40` }}>
                      <Icon sx={{ fontSize: "32px", color: feature.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col justify-center p-10 lg:p-14 ${idx % 2 === 1 ? "lg:col-start-1" : ""}`}>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: feature.color }}>
                      {feature.subtitle}
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-black text-[#F0EFE8] mb-5">{feature.title}</h3>
                    <p className="text-[#9B99B5] leading-8 mb-8 text-base">{feature.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {feature.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full flex-none" style={{ backgroundColor: feature.color }} />
                          <span className="text-sm text-[#9B99B5]">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <button className="flex items-center gap-2 text-sm font-bold transition-all group/btn w-fit" style={{ color: feature.color }}>
                      Learn more
                      <ArrowForward sx={{ fontSize: "18px" }} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

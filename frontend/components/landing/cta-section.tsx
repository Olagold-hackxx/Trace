"use client";

import Link from "next/link";
import { COLORS, IMAGES } from "@/lib/constants";
import { ArrowForward } from "@mui/icons-material";

export function CTASection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem]" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img src={IMAGES.hero} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(20,20,32,0.97) 0%, rgba(20,20,32,0.8) 100%)" }} />
          </div>

          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#FF6B35" }} />
          <div className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full blur-3xl opacity-15" style={{ backgroundColor: "#F5A623" }} />

          <div className="relative px-8 py-20 sm:px-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 px-4 py-2 mb-8" style={{ backgroundColor: "rgba(255,107,53,0.1)" }}>
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-sm font-semibold text-[#F5A623]">Now open for early traders</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F0EFE8] tracking-tight mb-6 max-w-3xl mx-auto">
              Ready to build the business you always imagined?
            </h2>

            <p className="text-lg text-[#9B99B5] max-w-2xl mx-auto mb-12 leading-8">
              Join thousands of traders across Lagos using Trace to collect smarter, score higher, and grow faster. No bank required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="group flex items-center justify-center gap-3 rounded-2xl px-10 py-5 text-base font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: COLORS.primary, boxShadow: "0 8px 32px rgba(255,107,53,0.4)" }}
              >
                Start for Free
                <ArrowForward sx={{ fontSize: "20px" }} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#features"
                className="flex items-center justify-center gap-3 rounded-2xl border px-10 py-5 text-base font-black text-[#F0EFE8] transition-all hover:bg-[#1A1A2E]"
                style={{ borderColor: "#2A2A40" }}
              >
                See how it works
              </Link>
            </div>

            {/* Proof line */}
            <div className="mt-14 flex items-center justify-center gap-8 flex-wrap">
              {[
                { label: "No signup fee", icon: "✓" },
                { label: "Instant activation", icon: "✓" },
                { label: "Lagos-based support", icon: "✓" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[#22C55E] font-bold">{item.icon}</span>
                  <span className="text-sm text-[#5C5A78]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

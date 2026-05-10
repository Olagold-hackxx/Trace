"use client";

import Link from "next/link";
import { COLORS, IMAGES } from "@/lib/constants";
import { ArrowForward, TrendingUp, Verified, PlayArrow } from "@mui/icons-material";

const stats = [
  { value: "₦45B+", label: "Payment Volume" },
  { value: "3.8K+", label: "Jobs Completed" },
  { value: "1.2K+", label: "Active Traders" },
  { value: "94%", label: "Credit Approval" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "#0A0A0F", minHeight: "100vh" }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, #FF6B35 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F5A623 0%, transparent 45%)`
      }} />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, #2A2A40 60px, #2A2A40 61px), repeating-linear-gradient(0deg, transparent, transparent 60px, #2A2A40 60px, #2A2A40 61px)`
      }} />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 px-4 py-2" style={{ backgroundColor: "rgba(255,107,53,0.1)" }}>
              <Verified sx={{ color: "#F5A623", fontSize: "16px" }} />
              <span className="text-sm font-semibold text-[#F5A623]">Built for African informal trade</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F0EFE8] leading-[1.05]">
                Trade smarter,{" "}
                <span className="relative">
                  <span style={{ color: COLORS.primary }}>grow faster</span>
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full" style={{ backgroundColor: COLORS.primary, opacity: 0.4 }} />
                </span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#9B99B5]">
                Payments · Credit · Jobs — in one platform
              </h2>
            </div>

            <p className="text-lg text-[#9B99B5] max-w-lg leading-8">
              Trace gives African traders instant payment collection, real-time credit scores, and access to restock capital — all from one dashboard built for markets like yours.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/auth/register"
                className="group flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: COLORS.primary, boxShadow: "0 8px 32px rgba(255,107,53,0.4)" }}
              >
                Start as Trader
                <ArrowForward sx={{ fontSize: "20px" }} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-3 rounded-2xl border px-8 py-4 text-base font-bold text-[#F0EFE8] transition-all duration-300 hover:bg-[#1A1A2E]"
                style={{ borderColor: "#2A2A40" }}
              >
                Start as Lender
                <TrendingUp sx={{ fontSize: "20px", color: "#F5A623" }} />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[IMAGES.trader1, IMAGES.trader2, IMAGES.trader3].map((img, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0A0A0F] overflow-hidden">
                    <img src={img} alt="Trader" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#F5A623] text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs text-[#5C5A78]">Trusted by 1,200+ traders across Lagos</p>
              </div>
            </div>
          </div>

          {/* Right — hero image stack */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: "580px" }}>
              <img
                src={IMAGES.hero2}
                alt="African entrepreneur"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.7) 0%, transparent 50%)" }} />

              {/* Floating card — payment received */}
              <div className="absolute top-6 left-6 rounded-2xl p-4 backdrop-blur-xl" style={{ backgroundColor: "rgba(20,20,32,0.9)", border: "1px solid rgba(255,107,53,0.3)" }}>
                <p className="text-xs text-[#9B99B5] mb-1">Payment received</p>
                <p className="text-2xl font-black text-[#F0EFE8]">₦18,500</p>
                <p className="text-xs text-[#22C55E] mt-1">↑ TraceScore boosted</p>
              </div>

              {/* Floating card — score */}
              <div className="absolute bottom-24 right-6 rounded-2xl p-4 backdrop-blur-xl" style={{ backgroundColor: "rgba(20,20,32,0.9)", border: "1px solid rgba(245,166,35,0.3)" }}>
                <p className="text-xs text-[#9B99B5] mb-2">TraceScore</p>
                <p className="text-3xl font-black" style={{ color: "#F5A623" }}>742</p>
                <p className="text-xs text-[#9B99B5] mt-1">Excellent · Capital Ready</p>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
                    <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-xs font-semibold text-[#22C55E]">Collections Active</span>
                  </div>
                  <span className="text-xs text-[#9B99B5]">Amaka Foods, Yaba</span>
                </div>
              </div>
            </div>

            {/* Decorative blur orbs */}
            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "#FF6B35" }} />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#F5A623" }} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
              <p className="text-3xl font-black" style={{ color: COLORS.primary }}>{stat.value}</p>
              <p className="mt-2 text-sm text-[#5C5A78]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

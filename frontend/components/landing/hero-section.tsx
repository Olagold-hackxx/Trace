"use client";

import Link from "next/link";
import { COLORS, IMAGES } from "@/lib/constants";
import { ArrowForward, TrendingUp, Star } from "@mui/icons-material";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100/20 border border-orange-300/40">
              <TrendingUp sx={{ color: "#ff6b00", fontSize: "18px", marginRight: "8px" }} />
              <span className="text-sm font-medium" style={{ color: "#ff6b00" }}>Built for African traders and lenders</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Payments, credit and jobs <span style={{ color: COLORS.primary }}>in one platform</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Trace helps traders collect payments, build TraceScore, unlock lender-ready capital, and manage reliable worker operations from one dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                Start as Trader
                <ArrowForward sx={{ fontSize: "20px" }} />
              </Link>

              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-lg font-semibold text-white border-2 hover:bg-white/10 flex items-center justify-center gap-3 transition-all"
                style={{ borderColor: COLORS.primary, color: "#ffffff" }}
              >
                Start as Lender
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10">
              <div className="space-y-2">
                <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>₦45B+</p>
                <p className="text-sm text-gray-400">Total Volume</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>3.8K+</p>
                <p className="text-sm text-gray-400">Jobs Completed</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>1.2K+</p>
                <p className="text-sm text-gray-400">Verified Applicants</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={IMAGES.hero}
              alt="African trader using phone at market stall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent"></div>
            <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Star sx={{ color: "#ff6b00", fontSize: "20px" }} />
              <span className="text-sm font-semibold text-navy">Trusted by growing traders</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

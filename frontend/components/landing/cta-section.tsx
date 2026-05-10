"use client";

import Link from "next/link";
import { COLORS } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="bg-[#0f172a] px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-slate-950/30 sm:p-12">
        <div className="mx-auto mb-5 w-fit rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
          Built for informal trade
        </div>

        <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
          Ready to scale your trade operations?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          Join traders and lenders already using Trace to grow faster, access
          restock capital, and manage reliable student workers.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/register"
            className="rounded-xl px-8 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            Get Started Now
          </Link>

          <Link
            href="#features"
            className="rounded-xl border border-white/15 bg-white/10 px-8 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
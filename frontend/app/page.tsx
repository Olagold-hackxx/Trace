import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { COLORS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
              style={{ backgroundColor: COLORS.primary }}
            >
              T
            </div>
            <span className="text-lg font-black tracking-tight text-[#0f172a]">
              Trace
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[#64748b] transition hover:text-[#0f172a]"
            >
              Features
            </a>
            <a
              href="#how"
              className="text-sm font-medium text-[#64748b] transition hover:text-[#0f172a]"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#64748b] transition hover:text-[#0f172a]"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: COLORS.primary }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  T
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Trace
                </span>
              </div>
              <p className="max-w-xs text-sm leading-6 text-slate-300">
                Payments, TraceScore, restock capital, and on-demand work for
                African trade.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Trace Pay
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    TraceScore
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Trace Jobs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 transition hover:text-orange-300">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-sm text-slate-400">
            © 2026 Trace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
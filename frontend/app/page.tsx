import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { COLORS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen text-[#F0EFE8]" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2A2A40]/80 backdrop-blur-xl" style={{ backgroundColor: "rgba(10,10,15,0.85)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              T
            </div>
            <span className="text-lg font-black tracking-tight text-[#F0EFE8]">Trace</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#9B99B5] transition hover:text-[#F0EFE8]">Features</a>
            <a href="#how" className="text-sm font-medium text-[#9B99B5] transition hover:text-[#F0EFE8]">How It Works</a>
            <a href="#" className="text-sm font-medium text-[#9B99B5] transition hover:text-[#F0EFE8]">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-[#9B99B5] transition hover:text-[#F0EFE8]">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: COLORS.primary }}
            >
              Get Started
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
      <footer style={{ backgroundColor: "#07070D", borderTop: "1px solid #2A2A40" }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 border-b border-[#2A2A40] pb-12 md:grid-cols-4">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: COLORS.primary }}>
                  T
                </div>
                <span className="text-xl font-black tracking-tight text-[#F0EFE8]">Trace</span>
              </div>
              <p className="max-w-xs text-sm leading-7 text-[#5C5A78]">
                Payments, credit scores, and gig work for African informal trade — built for the next generation of entrepreneurs.
              </p>
              <div className="mt-6 flex gap-3">
                <div className="h-8 w-8 rounded-lg border border-[#2A2A40] flex items-center justify-center text-[#5C5A78] hover:border-[#FF6B35] hover:text-[#FF6B35] cursor-pointer transition-colors">𝕏</div>
                <div className="h-8 w-8 rounded-lg border border-[#2A2A40] flex items-center justify-center text-[#5C5A78] hover:border-[#FF6B35] hover:text-[#FF6B35] cursor-pointer transition-colors text-xs font-bold">in</div>
                <div className="h-8 w-8 rounded-lg border border-[#2A2A40] flex items-center justify-center text-[#5C5A78] hover:border-[#FF6B35] hover:text-[#FF6B35] cursor-pointer transition-colors text-xs">IG</div>
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#5C5A78]">Product</h4>
              <ul className="space-y-4 text-sm">
                {["Trace Pay", "TraceScore", "Trace Jobs", "Capital Access"].map((item) => (
                  <li key={item}><a href="#" className="text-[#9B99B5] transition hover:text-[#FF6B35]">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#5C5A78]">Company</h4>
              <ul className="space-y-4 text-sm">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}><a href="#" className="text-[#9B99B5] transition hover:text-[#FF6B35]">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#5C5A78]">Legal</h4>
              <ul className="space-y-4 text-sm">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <li key={item}><a href="#" className="text-[#9B99B5] transition hover:text-[#FF6B35]">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#5C5A78]">
            <span>© 2026 Trace Technologies Ltd. All rights reserved.</span>
            <span>Built for Africa 🌍</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

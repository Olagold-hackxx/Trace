"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      num: "01",
      title: "Collect Payments",
      desc: "Share your Trace link, get paid in minutes. Every naira collected builds your financial identity.",
    },
    {
      num: "02",
      title: "Build Your TraceScore",
      desc: "Your score grows with every transaction. Creditworthiness — no collateral, no guarantors.",
    },
    {
      num: "03",
      title: "Unlock Capital",
      desc: "Lenders see your score and come to you. Pre-qualified offers land in your dashboard.",
    },
    {
      num: "04",
      title: "Find Work & Hire",
      desc: "Post jobs or pick up gigs. Every job completed pushes your TraceScore higher.",
    },
  ];

  const testimonials = [
    {
      quote: "Before Trace, banks looked at me like I had nothing. My TraceScore of 768 got me ₦800,000 — no guarantor.",
      name: "Fatima Aliyu",
      role: "Fashion Trader · Alaba Market",
      img: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=600&q=85&auto=format&fit=crop&crop=top",
    },
    {
      quote: "I've deployed ₦12M through Trace this quarter. The risk banding is accurate and repayments are clean.",
      name: "Emeka Obi",
      role: "Private Lender · Lagos Island",
      img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600&q=85&auto=format&fit=crop&crop=top",
    },
    {
      quote: "I post a job, 20 verified workers apply in an hour. Trace changed how I hire completely.",
      name: "Chisom Nwachukwu",
      role: "Food Vendor · Surulere",
      img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=85&auto=format&fit=crop&crop=top",
    },
  ];

  const stats = [
    { value: "12,500+", label: "Active Merchants" },
    { value: "₦4.2B+", label: "Processed" },
    { value: "97.7%", label: "Repayment Rate" },
    { value: "₦890M+", label: "Capital Deployed" },
  ];

  return (
    <div
      style={{
        fontFamily: "'Hanken Grotesk', sans-serif",
        backgroundColor: "#0d0d0d",
        color: "#f0f0f0",
        overflowX: "hidden",
      }}
    >
      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(13,13,13,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1e1e1e",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <BrandLogo href="/" iconSize={36} textSize={21} textColor="#ffffff" />

          <div className="hidden md:flex" style={{ gap: 36, alignItems: "center" }}>
            {["Features", "How It Works", "Testimonials", "For Lenders"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: "#64748b", fontSize: 14, textDecoration: "none", fontWeight: 500 }}
              >
                {l}
              </a>
            ))}
          </div>

          <div className="hidden md:flex" style={{ gap: 10, alignItems: "center" }}>
            <Link
              href="/auth/login"
              style={{
                padding: "8px 18px",
                border: "1px solid #2a2a2a",
                borderRadius: 10,
                color: "#f0f0f0",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: "#ff6b00",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#f0f0f0" }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {menuOpen && (
          <div
            style={{
              padding: "16px 24px 24px",
              background: "#0d0d0d",
              borderTop: "1px solid #1e1e1e",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {["Features", "How It Works", "Testimonials", "For Lenders"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: "#64748b", fontSize: 15, textDecoration: "none", fontWeight: 500 }}
                onClick={() => setMenuOpen(false)}
              >
                {l}
              </a>
            ))}
            <Link
              href="/auth/login"
              style={{ padding: "11px 20px", border: "1px solid #2a2a2a", borderRadius: 10, color: "#f0f0f0", textDecoration: "none", fontSize: 14, fontWeight: 600, textAlign: "center" }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              style={{ padding: "11px 20px", borderRadius: 10, background: "#ff6b00", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, textAlign: "center" }}
            >
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=1400&q=85&auto=format&fit=crop"
          alt="Trader"
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.85) 50%, rgba(13,13,13,0.25) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ maxWidth: 600 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,107,0,0.12)",
                border: "1px solid rgba(255,107,0,0.3)",
                borderRadius: 100,
                padding: "5px 14px",
                marginBottom: 28,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff6b00", display: "inline-block" }} />
              <span style={{ color: "#ff6b00", fontSize: 13, fontWeight: 600 }}>Now live across Nigeria</span>
            </div>

            <h1
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(38px, 5.5vw, 68px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.08,
                marginBottom: 24,
                letterSpacing: "-0.02em",
              }}
            >
              Your financial identity,{" "}
              <span style={{ color: "#ff6b00" }}>built transaction</span>{" "}
              by transaction.
            </h1>

            <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>
              Trace turns every sale, every payment, and every gig into creditworthiness. Informal traders across Nigeria finally have a financial identity lenders can trust.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 64 }}>
              <Link
                href="/auth/register"
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  background: "#ff6b00",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Start for free <ArrowForwardIcon style={{ fontSize: 18 }} />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                See how it works
              </a>
            </div>

            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 24px", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ff6b00",
                display: "block",
                marginBottom: 14,
              }}
            >
              Everything you need
            </span>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                color: "#fff",
                maxWidth: 500,
                lineHeight: 1.15,
              }}
            >
              Built for African trade, end to end.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              border: "1px solid #1e1e1e",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#111111",
                  padding: "36px 28px",
                  borderRight: "1px solid #1e1e1e",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#ff6b00",
                    marginBottom: 20,
                    letterSpacing: "0.05em",
                  }}
                >
                  {f.num}
                </div>
                <h3
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 12,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{f.desc}</p>
                <div style={{ marginTop: 28, width: 32, height: 3, borderRadius: 2, background: "#ff6b00" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        style={{ position: "relative", padding: "100px 24px", overflow: "hidden" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=1400&q=80&auto=format&fit=crop"
          alt="background"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,13,0.93)" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ff6b00",
                display: "block",
                marginBottom: 14,
              }}
            >
              Simple process
            </span>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              From signup to loan offer in 4 steps.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { n: "01", title: "Sign Up", desc: "Create your account in 2 minutes. No documents needed to start." },
              { n: "02", title: "Collect Payments", desc: "Share your Trace link. Every transaction counts towards your score." },
              { n: "03", title: "Grow Your Score", desc: "Transact consistently. Your TraceScore rises with every naira." },
              { n: "04", title: "Get Capital", desc: "Lenders offer you credit based on your score. No collateral, no queues." },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "32px 24px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#ff6b00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Epilogue', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#fff",
                    marginBottom: 20,
                  }}
                >
                  {step.n}
                </div>
                <h3 style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 24px", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ff6b00",
                display: "block",
                marginBottom: 14,
              }}
            >
              Real people
            </span>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                color: "#fff",
                maxWidth: 500,
                lineHeight: 1.15,
              }}
            >
              Merchants and lenders who use Trace every day.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="testimonial-grid">
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  background: "#111111",
                  border: "1px solid #1e1e1e",
                  borderRadius: 20,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Full photo — tall */}
                <div style={{ position: "relative", height: 320, width: "100%", flexShrink: 0 }}>
                  <Image
                    src={t.img}
                    alt={t.name}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center center" }}
                  />
                  {/* subtle bottom fade into card */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                      background: "linear-gradient(to top, #111111, transparent)",
                    }}
                  />
                </div>

                {/* Quote + name */}
                <div style={{ padding: "24px 24px 28px", flex: 1 }}>
                  <p style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.75, fontStyle: "italic", marginBottom: 20 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR LENDERS ── */}
      <section
        id="for-lenders"
        style={{ position: "relative", padding: "100px 24px", overflow: "hidden" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&q=80&auto=format&fit=crop"
          alt="Lender"
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.9) 55%, rgba(13,13,13,0.5) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
            className="lender-grid"
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#ff6b00",
                  display: "block",
                  marginBottom: 20,
                }}
              >
                For Lenders
              </span>
              <h2
                style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontSize: "clamp(26px, 3.5vw, 44px)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.15,
                  marginBottom: 20,
                }}
              >
                Underwrite informal trade with confidence.
              </h2>
              <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75, marginBottom: 36 }}>
                Access a pre-scored pipeline of informal merchants with verified transaction histories. Our risk banding and real-time dashboards give you everything you need to extend credit responsibly.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                {[
                  "Real-time TraceScore API access",
                  "Risk banding: Low / Medium / High",
                  "Portfolio repayment analytics",
                  "Merchant financial history exports",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CheckCircleIcon style={{ color: "#ff6b00", fontSize: 18 }} />
                    <span style={{ color: "#cbd5e1", fontSize: 15 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 12,
                  background: "#ff6b00",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Join as a Lender <ArrowForwardIcon style={{ fontSize: 18 }} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Avg TraceScore", value: "718", sub: "Across active merchants" },
                { label: "NPL Rate", value: "2.3%", sub: "Non-performing loans" },
                { label: "Avg Loan Size", value: "₦680K", sub: "Per merchant" },
                { label: "Repayment Rate", value: "97.7%", sub: "On-time repayments" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    padding: "24px 20px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 30, fontWeight: 800, color: "#ff6b00", marginBottom: 4 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", background: "#0d0d0d", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,107,0,0.1)",
              border: "1px solid rgba(255,107,0,0.25)",
              borderRadius: 100,
              padding: "5px 14px",
              marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b00", display: "inline-block" }} />
            <span style={{ color: "#ff6b00", fontSize: 13, fontWeight: 600 }}>Join 12,500+ merchants</span>
          </div>

          <h2
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Your financial identity starts today.
          </h2>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, marginBottom: 40 }}>
            Sign up free, collect your first payment, and watch your TraceScore climb. No credit history required. No collateral. Just your hustle.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/register"
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "#ff6b00",
                color: "#fff",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Create Free Account <ArrowForwardIcon style={{ fontSize: 18 }} />
            </Link>
            <Link
              href="/auth/login"
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                border: "1px solid #2a2a2a",
                color: "#f0f0f0",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080808", padding: "56px 24px 32px", borderTop: "1px solid #1e1e1e" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }} className="footer-grid">
            <div>
              <div style={{ marginBottom: 16 }}>
                <BrandLogo href="/" iconSize={34} textSize={20} textColor="#ffffff" />
              </div>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, maxWidth: 260 }}>
                Building financial identity for informal African traders. From Lagos to Kano, every transaction counts.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "TraceScore", "Marketplace", "For Lenders"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {col.title}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link) => (
                    <a key={link} href="#" style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#334155" }}>&copy; 2026 Trace Financial Technologies Ltd. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "#334155" }}>Made with care in Lagos, Nigeria 🇳🇬</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .lender-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

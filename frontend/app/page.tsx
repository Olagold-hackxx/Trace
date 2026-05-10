"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PaymentsIcon from "@mui/icons-material/Payments";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WorkIcon from "@mui/icons-material/Work";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SecurityIcon from "@mui/icons-material/Security";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: <PaymentsIcon style={{ fontSize: 32, color: "#ff6b00" }} />,
      title: "Collect Payments",
      desc: "Generate payment links instantly and accept money from customers anywhere in Nigeria. Every transaction builds your financial identity.",
      tag: "Payments",
    },
    {
      icon: <BarChartIcon style={{ fontSize: 32, color: "#7c3aed" }} />,
      title: "TraceScore",
      desc: "Your proprietary creditworthiness score built from real transaction data — not collateral. The more you transact, the stronger your score.",
      tag: "Credit",
    },
    {
      icon: <AccountBalanceIcon style={{ fontSize: 32, color: "#2563eb" }} />,
      title: "Access Capital",
      desc: "Pre-qualified loan offers from verified lenders — no long queues, no paperwork mountains. Just your TraceScore speaking for you.",
      tag: "Finance",
    },
    {
      icon: <WorkIcon style={{ fontSize: 32, color: "#16a34a" }} />,
      title: "Hire Workers",
      desc: "Post jobs and find vetted, TraceScore-verified workers for your business. See reliability scores before you hire.",
      tag: "Employment",
    },
    {
      icon: <StorefrontIcon style={{ fontSize: 32, color: "#ff6b00" }} />,
      title: "Job Marketplace",
      desc: "Browse hundreds of daily and weekly gigs in your city. Earn money and grow your TraceScore simultaneously.",
      tag: "Marketplace",
    },
    {
      icon: <SecurityIcon style={{ fontSize: 32, color: "#2563eb" }} />,
      title: "Lender Tools",
      desc: "Institutional lenders get real-time portfolio analytics, risk banding, and a pipeline of pre-scored merchants ready for capital.",
      tag: "B2B",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Create Your Account",
      desc: "Sign up in under 2 minutes. Tell us about your business — whether you sell food, run logistics, or do fashion. No documents needed to start.",
      color: "#ff6b00",
    },
    {
      num: "02",
      title: "Collect Payments",
      desc: "Share your Trace payment link with customers. Every payment you receive gets recorded and counted towards your TraceScore.",
      color: "#7c3aed",
    },
    {
      num: "03",
      title: "Build Your Score",
      desc: "As you transact, your TraceScore rises. Hire workers, complete jobs, and maintain consistent revenue to unlock higher score tiers.",
      color: "#2563eb",
    },
    {
      num: "04",
      title: "Access Capital",
      desc: "Once your score is strong enough, lenders make pre-qualified offers directly to you. Accept the best terms and grow your business.",
      color: "#16a34a",
    },
  ];

  const jobs = [
    {
      title: "Market Sales Assistant",
      company: "Eko Fresh Foods Ltd",
      location: "Oshodi, Lagos",
      pay: "₦8,500/day",
      type: "Full-day",
      score: 600,
      applicants: 14,
      color: "#7c3aed",
    },
    {
      title: "Delivery Rider",
      company: "QuickRush Logistics",
      location: "Lekki, Lagos",
      pay: "₦6,000/day",
      type: "Part-day",
      score: 550,
      applicants: 28,
      color: "#ff6b00",
    },
    {
      title: "Fashion Store Attendant",
      company: "Bella Styles Boutique",
      location: "Surulere, Lagos",
      pay: "₦7,200/day",
      type: "Full-day",
      score: 620,
      applicants: 9,
      color: "#16a34a",
    },
    {
      title: "Warehouse Picker",
      company: "TradeBridge Nigeria",
      location: "Apapa, Lagos",
      pay: "₦9,000/day",
      type: "Full-day",
      score: 580,
      applicants: 21,
      color: "#2563eb",
    },
  ];

  const gaugeScore = 742;
  const gaugeMax = 900;
  const gaugeAngle = (gaugeScore / gaugeMax) * 180;
  const r = 90;
  const cx = 110;
  const cy = 110;
  const arcPath = (startDeg: number, endDeg: number, radius: number) => {
    const start = ((startDeg - 90) * Math.PI) / 180;
    const end = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: "#261812", overflowX: "hidden" }}>
      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,248,246,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2bfb0",
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
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#ff6b00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Epilogue', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: "#fff",
              }}
            >
              T
            </div>
            <span
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: "#261812",
              }}
            >
              Trace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
            {["Features", "How It Works", "Marketplace", "For Lenders"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: "#5a4136", fontSize: 15, textDecoration: "none", fontWeight: 500 }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex" style={{ gap: 12, alignItems: "center" }}>
            <Link
              href="/auth/login"
              style={{
                padding: "9px 20px",
                border: "1px solid #e2bfb0",
                borderRadius: 10,
                color: "#261812",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                background: "#fff",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                background: "#ff6b00",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#261812" }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            style={{
              padding: "16px 24px 24px",
              background: "#fff8f6",
              borderTop: "1px solid #e2bfb0",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {["Features", "How It Works", "Marketplace", "For Lenders"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: "#5a4136", fontSize: 15, textDecoration: "none", fontWeight: 500 }}
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <Link
              href="/auth/login"
              style={{
                padding: "11px 20px",
                border: "1px solid #e2bfb0",
                borderRadius: 10,
                color: "#261812",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                background: "#fff",
                textAlign: "center",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: "11px 20px",
                borderRadius: 10,
                background: "#ff6b00",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section
        id="features"
        style={{
          background: "#0f172a",
          padding: "80px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
            className="grid-cols-1 md:grid-cols-2"
          >
            {/* Left: Headline */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,107,0,0.12)",
                  border: "1px solid rgba(255,107,0,0.3)",
                  borderRadius: 100,
                  padding: "6px 16px",
                  marginBottom: 24,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6b00", display: "inline-block" }} />
                <span style={{ color: "#ff6b00", fontSize: 13, fontWeight: 600 }}>Now live across Nigeria</span>
              </div>

              <h1
                style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontSize: "clamp(36px, 5vw, 58px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  marginBottom: 24,
                  letterSpacing: "-0.02em",
                }}
              >
                Your financial identity,{" "}
                <span style={{ color: "#ff6b00" }}>built transaction</span> by transaction
              </h1>

              <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
                Trace turns every sale, every payment, and every job into creditworthiness. Informal traders across
                Africa finally have a financial identity that lenders can trust.
              </p>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 56 }}>
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
                  Start Building Your Score <ArrowForwardIcon style={{ fontSize: 18 }} />
                </Link>
                <a
                  href="#how-it-works"
                  style={{
                    padding: "14px 28px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  See How It Works
                </a>
              </div>

              {/* Stats Row */}
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                {[
                  { value: "12,500+", label: "Active Merchants" },
                  { value: "₦4.2B+", label: "Processed" },
                  { value: "₦890M+", label: "Capital Deployed" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      style={{
                        fontFamily: "'Epilogue', sans-serif",
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image Card with TraceScore overlay */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: 480,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80"
                  alt="Nigerian merchant at market"
                  style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
                />
                {/* Dark overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 50%)",
                  }}
                />
                {/* Score overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 24,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 16,
                      padding: "16px 20px",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 500 }}>
                      TraceScore
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span
                        style={{
                          fontFamily: "'Epilogue', sans-serif",
                          fontSize: 42,
                          fontWeight: 800,
                          color: "#ff6b00",
                        }}
                      >
                        742
                      </span>
                      <span style={{ color: "#64748b", fontSize: 16 }}>/900</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "rgba(22,163,74,0.2)",
                          color: "#4ade80",
                          borderRadius: 100,
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Excellent
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(742 / 900) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #ff6b00, #f59e0b)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                      Amaka Okonkwo · Lagos Trader · Pre-qualified for ₦1.5M
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge top right */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "12px 16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckCircleIcon style={{ color: "#16a34a", fontSize: 20 }} />
                <div>
                  <div style={{ fontSize: 11, color: "#5a4136", fontWeight: 600 }}>Loan Approved</div>
                  <div style={{ fontSize: 13, color: "#261812", fontWeight: 700 }}>₦1,200,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: "96px 24px", background: "#fff8f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(255,107,0,0.08)",
                color: "#ff6b00",
                borderRadius: 100,
                padding: "5px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Everything you need
            </div>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#261812",
                marginBottom: 16,
              }}
            >
              Built for African trade, end to end
            </h2>
            <p style={{ fontSize: 17, color: "#5a4136", maxWidth: 560, margin: "0 auto" }}>
              From collecting your first payment to securing a business loan — Trace handles the full financial
              journey of the informal trader.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2bfb0",
                  borderRadius: 20,
                  padding: 28,
                  boxShadow: "0px 4px 20px rgba(15,23,42,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "#fff8f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8e7164",
                    background: "#fff8f6",
                    borderRadius: 100,
                    padding: "3px 10px",
                    marginBottom: 10,
                    border: "1px solid #e2bfb0",
                  }}
                >
                  {f.tag}
                </div>
                <h3
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#261812",
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 15, color: "#5a4136", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "96px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(124,58,237,0.08)",
                color: "#7c3aed",
                borderRadius: 100,
                padding: "5px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Simple process
            </div>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#261812",
                marginBottom: 16,
              }}
            >
              How it works
            </h2>
            <p style={{ fontSize: 17, color: "#5a4136", maxWidth: 520, margin: "0 auto" }}>
              Four steps from signup to your first loan offer. No collateral. No guarantors. Just your track record.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 32,
              position: "relative",
            }}
          >
            {steps.map((step, idx) => (
              <div key={step.num} style={{ position: "relative" }}>
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 28,
                      right: -16,
                      width: 32,
                      height: 2,
                      background: "#e2bfb0",
                      zIndex: 1,
                    }}
                    className="hidden md:block"
                  />
                )}
                <div
                  style={{
                    background: "#fff8f6",
                    border: "1px solid #e2bfb0",
                    borderRadius: 20,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: step.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Epilogue', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "#fff",
                      marginBottom: 20,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontSize: 19,
                      fontWeight: 700,
                      color: "#261812",
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: "#5a4136", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACESCORE EXPLAINER */}
      <section style={{ padding: "96px 24px", background: "#fff8f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            {/* Left */}
            <div>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,107,0,0.08)",
                  color: "#ff6b00",
                  borderRadius: 100,
                  padding: "5px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                TraceScore
              </div>
              <h2
                style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontSize: "clamp(26px, 3.5vw, 40px)",
                  fontWeight: 800,
                  color: "#261812",
                  marginBottom: 20,
                }}
              >
                Your score. Your story. Your capital.
              </h2>
              <p style={{ fontSize: 16, color: "#5a4136", lineHeight: 1.7, marginBottom: 32 }}>
                TraceScore is a proprietary creditworthiness metric from 0–900. It measures five dimensions of
                your financial behaviour — not your assets. The higher it grows, the more capital options open up.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Payment History", pct: 90, color: "#16a34a" },
                  { label: "Revenue Consistency", pct: 74, color: "#ff6b00" },
                  { label: "Business Longevity", pct: 60, color: "#2563eb" },
                  { label: "Employment Record", pct: 45, color: "#7c3aed" },
                  { label: "Lender Trust", pct: 82, color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#261812",
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 700 }}>{item.pct}%</span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "#e2bfb0",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${item.pct}%`,
                          height: "100%",
                          background: item.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: SVG Gauge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2bfb0",
                  borderRadius: 24,
                  padding: 40,
                  boxShadow: "0px 4px 20px rgba(15,23,42,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: 360,
                }}
              >
                <svg width={220} height={150} viewBox="0 0 220 150">
                  {/* Background arc */}
                  <path
                    d={arcPath(180, 360, r)}
                    fill="none"
                    stroke="#f1e8e3"
                    strokeWidth={18}
                    strokeLinecap="round"
                  />
                  {/* Score arc */}
                  <path
                    d={arcPath(180, 180 + gaugeAngle, r)}
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth={18}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff6b00" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  {/* Score text */}
                  <text x={cx} y={cy + 15} textAnchor="middle" fill="#261812" fontSize={38} fontWeight={800} fontFamily="Epilogue, sans-serif">
                    742
                  </text>
                  <text x={cx} y={cy + 36} textAnchor="middle" fill="#8e7164" fontSize={13} fontFamily="Hanken Grotesk, sans-serif">
                    out of 900
                  </text>
                  {/* Min/Max labels */}
                  <text x={20} y={148} fill="#8e7164" fontSize={11}>0</text>
                  <text x={195} y={148} fill="#8e7164" fontSize={11}>900</text>
                </svg>

                <div
                  style={{
                    marginTop: 8,
                    display: "inline-block",
                    background: "rgba(22,163,74,0.1)",
                    color: "#16a34a",
                    borderRadius: 100,
                    padding: "5px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Excellent Credit
                </div>
                <p style={{ marginTop: 16, fontSize: 14, color: "#5a4136", textAlign: "center", lineHeight: 1.6 }}>
                  This score qualifies you for pre-approved loans up to <strong style={{ color: "#261812" }}>₦2,500,000</strong> from our lending partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOB MARKETPLACE PREVIEW */}
      <section id="marketplace" style={{ padding: "96px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(124,58,237,0.08)",
                color: "#7c3aed",
                borderRadius: 100,
                padding: "5px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Job Marketplace
            </div>
            <h2
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#261812",
                marginBottom: 16,
              }}
            >
              Earn while you build your score
            </h2>
            <p style={{ fontSize: 17, color: "#5a4136", maxWidth: 520, margin: "0 auto" }}>
              Browse daily and weekly gigs posted by verified businesses. Every completed job lifts your TraceScore.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {jobs.map((job) => (
              <div
                key={job.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2bfb0",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0px 4px 20px rgba(15,23,42,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${job.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WorkIcon style={{ color: job.color, fontSize: 22 }} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: job.color,
                      background: `${job.color}15`,
                      borderRadius: 100,
                      padding: "3px 10px",
                    }}
                  >
                    {job.type}
                  </span>
                </div>
                <h4
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#261812",
                    marginBottom: 4,
                  }}
                >
                  {job.title}
                </h4>
                <p style={{ fontSize: 13, color: "#5a4136", marginBottom: 12 }}>{job.company}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <LocationOnIcon style={{ fontSize: 14, color: "#8e7164" }} />
                  <span style={{ fontSize: 13, color: "#8e7164" }}>{job.location}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                  <AccessTimeIcon style={{ fontSize: 14, color: "#8e7164" }} />
                  <span style={{ fontSize: 13, color: "#8e7164" }}>{job.applicants} applicants</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 16,
                    borderTop: "1px solid #f1e8e3",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Epilogue', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#261812",
                      }}
                    >
                      {job.pay}
                    </div>
                    <div style={{ fontSize: 11, color: "#8e7164" }}>Min score: {job.score}</div>
                  </div>
                  <Link
                    href="/marketplace"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: "#7c3aed",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/marketplace"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                border: "1px solid #7c3aed",
                borderRadius: 12,
                color: "#7c3aed",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Browse all jobs <ArrowForwardIcon style={{ fontSize: 18 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* LENDERS DARK SECTION */}
      <section id="for-lenders" style={{ padding: "96px 24px", background: "#0f172a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(37,99,235,0.15)",
                  color: "#60a5fa",
                  borderRadius: 100,
                  padding: "5px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                For Lenders
              </div>
              <h2
                style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: 20,
                  lineHeight: 1.15,
                }}
              >
                Underwrite informal trade with confidence
              </h2>
              <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40 }}>
                Access a pre-scored pipeline of informal merchants with verified transaction histories. Our risk
                banding, real-time portfolio dashboards, and repayment analytics give institutional lenders
                everything they need to extend credit responsibly.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {[
                  "Real-time TraceScore API access",
                  "Risk banding: Low / Medium / High",
                  "Portfolio repayment analytics",
                  "Merchant financial history exports",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CheckCircleIcon style={{ color: "#2563eb", fontSize: 20 }} />
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
                  background: "#2563eb",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Apply as a Lender <ArrowForwardIcon style={{ fontSize: 18 }} />
              </Link>
            </div>

            {/* Stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                { label: "Average TraceScore", value: "718", sub: "Across active merchants" },
                { label: "NPL Rate", value: "2.3%", sub: "Portfolio non-performance" },
                { label: "Avg Loan Size", value: "₦680K", sub: "Per merchant deployment" },
                { label: "Repayment Rate", value: "97.7%", sub: "On-time repayments" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontSize: 32,
                      fontWeight: 800,
                      color: "#60a5fa",
                      marginBottom: 4,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "96px 24px", background: "#fff8f6" }}>
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,107,0,0.08)",
              border: "1px solid rgba(255,107,0,0.2)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 24,
            }}
          >
            <StarIcon style={{ color: "#ff6b00", fontSize: 16 }} />
            <span style={{ color: "#ff6b00", fontSize: 13, fontWeight: 600 }}>Join 12,500+ merchants</span>
          </div>

          <h2
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: "clamp(30px, 4vw, 50px)",
              fontWeight: 800,
              color: "#261812",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Your financial identity starts today
          </h2>
          <p style={{ fontSize: 17, color: "#5a4136", lineHeight: 1.7, marginBottom: 40 }}>
            Sign up free, collect your first payment, and watch your TraceScore begin to climb. No credit history
            required. No collateral needed. Just your hustle.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/register"
              style={{
                padding: "15px 32px",
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
                padding: "15px 32px",
                borderRadius: 12,
                border: "1px solid #e2bfb0",
                color: "#261812",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                background: "#fff",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 48,
              marginBottom: 56,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "#ff6b00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Epilogue', sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#fff",
                  }}
                >
                  T
                </div>
                <span
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#ffffff",
                  }}
                >
                  Trace
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 280 }}>
                Building financial identity for informal African traders. From Lagos to Kano, every transaction
                counts.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "TraceScore", "Marketplace", "For Lenders"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 16,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {col.title}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link) => (
                    <a key={link} href="#" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 13, color: "#475569" }}>
              &copy; 2026 Trace Financial Technologies Ltd. All rights reserved.
            </span>
            <span style={{ fontSize: 13, color: "#475569" }}>Made with care in Lagos, Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

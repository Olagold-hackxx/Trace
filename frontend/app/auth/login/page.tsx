"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "lender">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const primaryColor = role === "lender" ? "#2563eb" : "#ff6b00";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Please enter a valid email";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    console.log("Login attempt:", { ...formData, role });
    setTimeout(() => {
      setLoading(false);
      if (role === "lender") {
        router.push("/lender");
      } else {
        router.push("/dashboard");
      }
    }, 1200);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
      className="grid-cols-1 md:grid-cols-2"
    >
      {/* LEFT PANEL - Dark Navy */}
      <div
        style={{
          background: "#0f172a",
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "#ff6b00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Epilogue', sans-serif",
                fontWeight: 800,
                fontSize: 22,
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
                color: "#ffffff",
              }}
            >
              Trace
            </span>
          </Link>
        </div>

        {/* Middle content */}
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: 38,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Your financial identity,{" "}
            <span style={{ color: "#ff6b00" }}>built every day</span>
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40 }}>
            Every transaction you record on Trace becomes part of your creditworthiness. Sign in to pick up where
            you left off.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "TraceScore updated with each payment",
              "Pre-qualified loan offers waiting for you",
              "Job marketplace with 400+ active listings",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircleIcon style={{ color: "#ff6b00", fontSize: 18 }} />
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 24,
            position: "relative",
          }}
        >
          <FormatQuoteIcon
            style={{ color: "#ff6b00", fontSize: 28, position: "absolute", top: 16, right: 16, opacity: 0.6 }}
          />
          <p style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
            &ldquo;Before Trace, the bank would look at me like I had nothing. Now my TraceScore of 768 got me
            ₦800,000 to expand my stall. I did not even need a guarantor.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b00, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Epilogue', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
              }}
            >
              F
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#ffffff" }}>Fatima Aliyu</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Fashion Trader · Alaba Market, Lagos</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Sign In Form */}
      <div
        style={{
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          overflowY: "auto",
        }}
      >
        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ marginBottom: 32, justifyContent: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
            <span style={{ fontFamily: "'Epilogue', sans-serif", fontWeight: 700, fontSize: 20, color: "#261812" }}>
              Trace
            </span>
          </Link>
        </div>

        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: "#261812",
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 15, color: "#5a4136", marginBottom: 32 }}>
            Sign in to your Trace account to continue.
          </p>

          {/* Role Selector Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 32,
              background: "#fff8f6",
              border: "1px solid #e2bfb0",
              borderRadius: 14,
              padding: 6,
            }}
          >
            <button
              onClick={() => setRole("user")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Hanken Grotesk', sans-serif",
                background: role === "user" ? "#ffffff" : "transparent",
                color: role === "user" ? "#ff6b00" : "#8e7164",
                boxShadow: role === "user" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              <PersonIcon style={{ fontSize: 18 }} />
              Normal User
            </button>
            <button
              onClick={() => setRole("lender")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Hanken Grotesk', sans-serif",
                background: role === "lender" ? "#ffffff" : "transparent",
                color: role === "lender" ? "#2563eb" : "#8e7164",
                boxShadow: role === "lender" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              <AccountBalanceIcon style={{ fontSize: 18 }} />
              Lender
            </button>
          </div>

          {/* Google Button */}
          <button
            style={{
              width: "100%",
              padding: "12px 20px",
              border: "1px solid #e2bfb0",
              borderRadius: 12,
              background: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#261812",
              fontFamily: "'Hanken Grotesk', sans-serif",
              marginBottom: 24,
            }}
            onClick={() => console.log("Google sign in")}
          >
            <GoogleIcon style={{ fontSize: 20, color: "#ea4335" }} />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#e2bfb0" }} />
            <span style={{ fontSize: 13, color: "#8e7164" }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "#e2bfb0" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#261812",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <EmailIcon
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    color: "#8e7164",
                  }}
                />
                <input
                  type="email"
                  placeholder="amaka@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 44px",
                    border: `1px solid ${errors.email ? "#dc2626" : "#e2bfb0"}`,
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#261812",
                    background: "#ffffff",
                    outline: "none",
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? "#dc2626" : "#e2bfb0")}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#261812" }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: primaryColor, textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <LockIcon
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    color: "#8e7164",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 44px",
                    border: `1px solid ${errors.password ? "#dc2626" : "#e2bfb0"}`,
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#261812",
                    background: "#ffffff",
                    outline: "none",
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "#dc2626" : "#e2bfb0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8e7164",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPassword ? <VisibilityOffIcon style={{ fontSize: 18 }} /> : <VisibilityIcon style={{ fontSize: 18 }} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#94a3b8" : primaryColor,
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: "background 0.2s",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in..." : `Sign in as ${role === "lender" ? "Lender" : "User"}`}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#5a4136" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              style={{ color: primaryColor, textDecoration: "none", fontWeight: 600 }}
            >
              Create one for free
            </Link>
          </p>

          {role === "lender" && (
            <div
              style={{
                marginTop: 24,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <p style={{ fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
                <strong>Lender Access:</strong> Your dashboard provides real-time portfolio analytics, risk banding,
                and access to the full merchant pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

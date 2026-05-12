"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  DEMO_TRADER_SIGNUP_DEFAULTS,
  fetchBackend,
  persistTraderSession,
} from "@/lib/backend";

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetchBackend<{
        user: {
          id: string;
          phone: string;
          fullName: string;
          businessName?: string;
          businessType?: string;
          marketName?: string;
          role?: "trader" | "lender" | "admin";
          bvnLast4?: string;
        };
        virtualAccount: {
          accountNumber: string;
          bankName?: string;
          status?: string;
        };
      }>("/auth/signup", {
        method: "POST",
        bodyJson: {
          phone: form.phone,
          fullName: form.fullName,
          ...DEMO_TRADER_SIGNUP_DEFAULTS,
        },
      });

      persistTraderSession({
        user: result.user,
        virtualAccount: result.virtualAccount,
      });

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create your account");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    fontSize: 14,
    color: "#f0f0f0",
    background: "#141414",
    outline: "none",
    fontFamily: "'Hanken Grotesk', sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Hanken Grotesk', sans-serif",
        backgroundColor: "#0d0d0d",
      }}
    >
      {/* LEFT PANEL — real photo */}
      <div
        className="hidden lg:block"
        style={{ width: "42%", position: "relative", overflow: "hidden", minHeight: "100vh" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=85&auto=format&fit=crop"
          alt="Lagos market traders"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #0d0d0d 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        {/* Logo */}
        <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
          <BrandLogo href="/" iconSize={38} textSize={22} textColor="#ffffff" />
        </div>
        {/* Bottom caption */}
        <div style={{ position: "absolute", bottom: 48, left: 40, right: 40, zIndex: 10 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff6b00",
              marginBottom: 12,
            }}
          >
            Built for Nigeria
          </p>
          <h2
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Your financial identity,{" "}
            <span style={{ color: "#ff6b00" }}>built every day.</span>
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>
            Every transaction you record becomes part of your creditworthiness — and opens doors banks never could.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          overflowY: "auto",
        }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden" style={{ marginBottom: 32, width: "100%", maxWidth: 440 }}>
          <BrandLogo href="/" iconSize={34} textSize={20} textColor="#ffffff" />
        </div>

        <div style={{ maxWidth: 420, width: "100%" }}>
          <h1
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
            Get started in under 2 minutes.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Amaka Okonkwo"
                  required
                  value={form.fullName}
                  onChange={set("fullName")}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  required
                  value={form.phone}
                  onChange={set("phone")}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="amaka@amakafoods.ng"
                required
                value={form.email}
                onChange={set("email")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set("password")}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPass ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>

            {error ? (
              <p style={{ fontSize: 12, color: "#f87171", marginTop: -4 }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#2a2a2a" : "#ff6b00",
                color: loading ? "#64748b" : "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Hanken Grotesk', sans-serif",
                marginTop: 6,
              }}
            >
              {loading ? "Creating account..." : "Continue →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#ff6b00", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

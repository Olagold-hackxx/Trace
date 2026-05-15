"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  BackendUser,
  BackendVirtualAccount,
  fetchBackend,
  persistTraderSession,
  storeAuthToken,
} from "@/lib/backend";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.email) errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email address";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const loginResult = await fetchBackend<{ token: string; user: BackendUser }>("/auth/login", {
        method: "POST",
        bodyJson: {
          email: formData.email,
          password: formData.password,
        },
      });

      storeAuthToken(loginResult.token);

      const virtualAccount = await fetchBackend<BackendVirtualAccount>("/virtual-accounts/me");

      persistTraderSession({ user: loginResult.user, virtualAccount });
      setLoading(false);
      if (loginResult.user.role === "lender") {
        router.push("/lender");
      } else if (loginResult.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (submitError) {
      setLoading(false);
      setErrors({
        password: submitError instanceof Error ? submitError.message : "Could not sign you in",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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
        {/* gradient overlay */}
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
            Every transaction you record on Trace becomes part of your creditworthiness — and opens doors banks never could.
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
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
            Sign in to your Trace account to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
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
                    color: "#64748b",
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
                    border: `1px solid ${errors.email ? "#dc2626" : "#2a2a2a"}`,
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#f0f0f0",
                    background: "#141414",
                    outline: "none",
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? "#dc2626" : "#2a2a2a")}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: "#ff6b00", textDecoration: "none", fontWeight: 500 }}>
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
                    color: "#64748b",
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
                    border: `1px solid ${errors.password ? "#dc2626" : "#2a2a2a"}`,
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#f0f0f0",
                    background: "#141414",
                    outline: "none",
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "#dc2626" : "#2a2a2a")}
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
                    color: "#64748b",
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
                transition: "background 0.2s",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: "#ff6b00", textDecoration: "none", fontWeight: 600 }}>
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

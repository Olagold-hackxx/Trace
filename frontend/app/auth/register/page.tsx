"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { Visibility, VisibilityOff, Person, Phone, Lock, Email } from "@mui/icons-material";
import {
  DEMO_TRADER_SIGNUP_DEFAULTS,
  fetchBackend,
  persistTraderSession,
  BackendUser,
  BackendVirtualAccount,
} from "@/lib/backend";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px 12px 44px",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  fontSize: 14,
  color: "#f0f0f0",
  background: "#141414",
  outline: "none",
  fontFamily: "'Hanken Grotesk', sans-serif",
  boxSizing: "border-box",
};

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#64748b" }} />
        {children}
      </div>
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a valid Nigerian phone number";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const result = await fetchBackend<{ user: BackendUser; virtualAccount: BackendVirtualAccount }>("/auth/signup", {
        method: "POST",
        bodyJson: {
          phone: form.phone,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          ...DEMO_TRADER_SIGNUP_DEFAULTS,
        },
      });

      persistTraderSession({ user: result.user, virtualAccount: result.virtualAccount });
      router.push("/dashboard");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not create your account. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (field: string) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#ff6b00"),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = errors[field] ? "#dc2626" : "#2a2a2a"),
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Hanken Grotesk', sans-serif", backgroundColor: "#0d0d0d" }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:block" style={{ width: "42%", position: "relative", overflow: "hidden", minHeight: "100vh" }}>
        <Image
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=85&auto=format&fit=crop"
          alt="Lagos market traders"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)" }} />
        <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
          <BrandLogo href="/" iconSize={38} textSize={22} textColor="#ffffff" />
        </div>
        <div style={{ position: "absolute", bottom: 48, left: 40, right: 40, zIndex: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff6b00", marginBottom: 12 }}>
            Built for Nigeria
          </p>
          <h2 style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 14 }}>
            Your financial identity,{" "}
            <span style={{ color: "#ff6b00" }}>built every day.</span>
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>
            Every transaction you record becomes part of your creditworthiness — and opens doors banks never could.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", overflowY: "auto" }}>

        <div className="flex lg:hidden" style={{ marginBottom: 32, width: "100%", maxWidth: 440 }}>
          <BrandLogo href="/" iconSize={34} textSize={20} textColor="#ffffff" />
        </div>

        <div style={{ maxWidth: 420, width: "100%" }}>
          <h1 style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
            Get started in under 2 minutes. No paperwork.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Full Name */}
            <Field label="Full Name" icon={Person} error={errors.fullName}>
              <input
                type="text"
                placeholder="Amaka Okonkwo"
                value={form.fullName}
                onChange={set("fullName")}
                style={{ ...inputStyle, borderColor: errors.fullName ? "#dc2626" : "#2a2a2a" }}
                {...focusStyle("fullName")}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" icon={Email} error={errors.email}>
              <input
                type="email"
                placeholder="amaka@example.com"
                value={form.email}
                onChange={set("email")}
                style={{ ...inputStyle, borderColor: errors.email ? "#dc2626" : "#2a2a2a" }}
                {...focusStyle("email")}
              />
            </Field>

            {/* Phone */}
            <Field label="Phone Number" icon={Phone} error={errors.phone}>
              <input
                type="tel"
                placeholder="+2348012345678"
                value={form.phone}
                onChange={set("phone")}
                style={{ ...inputStyle, borderColor: errors.phone ? "#dc2626" : "#2a2a2a" }}
                {...focusStyle("phone")}
              />
            </Field>

            {/* Password */}
            <Field label="Password" icon={Lock} error={errors.password}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
                style={{ ...inputStyle, paddingRight: 44, borderColor: errors.password ? "#dc2626" : "#2a2a2a" }}
                {...focusStyle("password")}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex" }}>
                {showPass ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
              </button>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                style={{ ...inputStyle, paddingRight: 44, borderColor: errors.confirmPassword ? "#dc2626" : "#2a2a2a" }}
                {...focusStyle("confirmPassword")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex" }}>
                {showConfirm ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
              </button>
            </Field>

            {/* Password strength hint */}
            {form.password && (
              <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    backgroundColor: form.password.length >= i * 3
                      ? form.password.length >= 12 ? "#16a34a" : form.password.length >= 8 ? "#ff6b00" : "#dc2626"
                      : "#2a2a2a",
                    transition: "background 0.2s"
                  }} />
                ))}
                <p style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", alignSelf: "center", marginLeft: 6 }}>
                  {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Good" : "Strong"}
                </p>
              </div>
            )}

            {errors.form && (
              <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "#1c0f0f", border: "1px solid #7f1d1d" }}>
                <p style={{ fontSize: 13, color: "#fca5a5" }}>{errors.form}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px 20px", borderRadius: 12, border: "none",
                background: loading ? "#2a2a2a" : "#ff6b00",
                color: loading ? "#64748b" : "#fff",
                fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Hanken Grotesk', sans-serif",
                marginTop: 4,
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>

            <p style={{ fontSize: 12, color: "#3d4752", textAlign: "center", lineHeight: 1.6 }}>
              By continuing you agree to Trace's Terms of Service and Privacy Policy.
            </p>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
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

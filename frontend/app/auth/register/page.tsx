"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import {
  Visibility,
  VisibilityOff,
  Person,
  Phone,
  Lock,
  Email,
  AssignmentInd,
} from "@mui/icons-material";
import {
  BackendUser,
  BackendVirtualAccount,
  fetchBackend,
  persistTraderSession,
  storeAuthToken,
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
  colorScheme: "dark",
};

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#94a3b8",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "#64748b",
            }}
          />
        )}
        {children}
      </div>
      {error ? (
        <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{error}</p>
      ) : null}
    </div>
  );
}
export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bvn: "",
    password: "",
  });

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
    };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.email.trim()) nextErrors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      nextErrors.email = "Enter a valid email address";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 10)
      nextErrors.phone = "Enter a valid Nigerian phone number";
    if (!form.bvn.trim()) nextErrors.bvn = "BVN is required";
    else if (!/^\d{11}$/.test(form.bvn))
      nextErrors.bvn = "BVN must be 11 digits";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters";

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await fetchBackend<{
        token: string;
        user: BackendUser;
        virtualAccount: BackendVirtualAccount;
      }>("/auth/signup", {
        method: "POST",
        bodyJson: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          bvn: form.bvn,
          password: form.password,
        },
      });

      storeAuthToken(result.token);
      persistTraderSession({
        user: result.user,
        virtualAccount: result.virtualAccount,
      });
      router.push("/auth/role");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Could not create your account. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (field: keyof typeof form) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = "#ff6b00";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = errors[field] ? "#dc2626" : "#2a2a2a";
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Hanken Grotesk', sans-serif",
        backgroundColor: "#0d0d0d",
      }}
    >
      <div
        className="hidden lg:block"
        style={{
          width: "42%",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}
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
        <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
          <BrandLogo href="/" iconSize={38} textSize={22} textColor="#ffffff" />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 40,
            right: 40,
            zIndex: 10,
          }}
        >
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
            Every transaction you record becomes part of your creditworthiness —
            and opens doors banks never could.
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "80px 24px 48px",
          overflowY: "auto",
        }}
      >
        <div
          className="flex lg:hidden"
          style={{ marginBottom: 32, width: "100%", maxWidth: 440 }}
        >
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
            Get started in under 2 minutes. No paperwork.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <Field label="Full Name" icon={Person} error={errors.fullName}>
              <input
                type="text"
                placeholder="Amaka Okonkwo"
                value={form.fullName}
                onChange={set("fullName")}
                style={{
                  ...inputStyle,
                  borderColor: errors.fullName ? "#dc2626" : "#2a2a2a",
                }}
                {...focusStyle("fullName")}
              />
            </Field>

            <Field label="Phone Number" icon={Phone} error={errors.phone}>
              <input
                type="tel"
                placeholder="+2348012345678"
                value={form.phone}
                onChange={set("phone")}
                style={{
                  ...inputStyle,
                  borderColor: errors.phone ? "#dc2626" : "#2a2a2a",
                }}
                {...focusStyle("phone")}
              />
            </Field>

            <Field label="Email Address" icon={Email} error={errors.email}>
              <input
                type="email"
                placeholder="amaka@amakafoods.ng"
                value={form.email}
                onChange={set("email")}
                style={{
                  ...inputStyle,
                  borderColor: errors.email ? "#dc2626" : "#2a2a2a",
                }}
                {...focusStyle("email")}
              />
            </Field>

            <Field label="BVN" icon={AssignmentInd} error={errors.bvn}>
              <input
                type="text"
                placeholder="Enter your 11-digit BVN"
                value={form.bvn}
                onChange={set("bvn")}
                maxLength={11}
                style={{
                  ...inputStyle,
                  borderColor: errors.bvn ? "#dc2626" : "#2a2a2a",
                }}
                {...focusStyle("bvn")}
              />
            </Field>

            <Field label="Password" icon={Lock} error={errors.password}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
                style={{
                  ...inputStyle,
                  paddingRight: 44,
                  borderColor: errors.password ? "#dc2626" : "#2a2a2a",
                }}
                {...focusStyle("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
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
                {showPass ? (
                  <VisibilityOff style={{ fontSize: 18 }} />
                ) : (
                  <Visibility style={{ fontSize: 18 }} />
                )}
              </button>
            </Field>

            {errors.form ? (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  backgroundColor: "#1c0f0f",
                  border: "1px solid #7f1d1d",
                }}
              >
                <p style={{ fontSize: 13, color: "#fca5a5" }}>{errors.form}</p>
              </div>
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
                marginTop: 4,
              }}
            >
              {loading ? "Creating account..." : "Continue →"}
            </button>

            <p
              style={{
                fontSize: 12,
                color: "#3d4752",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              By continuing you agree to Trace&apos;s Terms of Service and
              Privacy Policy.
            </p>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 14,
              color: "#64748b",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#ff6b00",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

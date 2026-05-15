"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { BackendUser, BackendVirtualAccount, fetchBackend, persistTraderSession } from "@/lib/backend";

type Role = "trader" | "lender";

const roles: {
  id: Role;
  label: string;
  sub: string;
  image: string;
  tag?: string;
}[] = [
  {
    id: "trader",
    label: "Trader / Merchant",
    sub: "I buy, sell, or run a business. I want to collect payments and build my financial identity.",
    image:
      "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&q=80&auto=format&fit=crop",
    tag: "Most popular",
  },
  {
    id: "lender",
    label: "Lender",
    sub: "I give out loans or credit to traders and want to track repayments.",
    image:
      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80&auto=format&fit=crop",
  },
];

export default function RolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      await fetchBackend("/users/me", {
        method: "PATCH",
        bodyJson: { role: selected },
      });
      const [user, virtualAccount] = await Promise.all([
        fetchBackend<BackendUser>("/users/me"),
        fetchBackend<BackendVirtualAccount>("/virtual-accounts/me").catch(() => null),
      ]);
      persistTraderSession({ user, virtualAccount: virtualAccount ?? undefined });
      router.push(selected === "lender" ? "/lender" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100%",
minHeight: "100dvh",
        backgroundColor: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 48 }}>
        <BrandLogo href="/" iconSize={38} textSize={22} textColor="#ffffff" />
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 480 }}>
        <h1
          style={{
            fontFamily: "'Epilogue', sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          What best describes you?
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
          Choose your role on Trace. You can always change this later.
        </p>
      </div>

      {/* Role blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          width: "100%",
          maxWidth: 680,
          marginBottom: 28,
        }}
        className="role-grid"
      >
        {roles.map((r) => {
          const isSelected = selected === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              style={{
                textAlign: "left",
                borderRadius: 20,
                overflow: "hidden",
                border: isSelected ? "2px solid #ff6b00" : "2px solid #1e1e1e",
                background: "#141414",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.2s, transform 0.15s",
                transform: isSelected ? "scale(1.01)" : "scale(1)",
                padding: 0,
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: 180, width: "100%" }}>
                <Image
                  src={r.image}
                  alt={r.label}
                  fill
                  style={{
                    objectFit: "cover",
                    filter: isSelected ? "brightness(0.9)" : "brightness(0.45)",
                    transition: "filter 0.2s",
                  }}
                />
                {/* Tag */}
                {r.tag && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "#ff6b00",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {r.tag}
                  </span>
                )}
                {/* Checkmark */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#ff6b00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M2 6.5L5 9.5L11 3.5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {/* Bottom gradient on image */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    background: "linear-gradient(to top, #141414, transparent)",
                  }}
                />
              </div>

              {/* Text */}
              <div style={{ padding: "16px 18px 20px" }}>
                <p
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: isSelected ? "#ff6b00" : "#fff",
                    marginBottom: 6,
                    transition: "color 0.2s",
                  }}
                >
                  {r.label}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  {r.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ width: "100%", maxWidth: 680 }}>
        {error && (
          <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", marginBottom: 12 }}>{error}</p>
        )}
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 14,
            border: "none",
            background: selected && !loading ? "#ff6b00" : "#1e1e1e",
            color: selected && !loading ? "#fff" : "#475569",
            fontSize: 15,
            fontWeight: 700,
            cursor: selected && !loading ? "pointer" : "not-allowed",
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: "all 0.2s",
          }}
        >
          {loading
            ? "Setting up your account..."
            : selected
            ? `Continue as ${selected === "trader" ? "Trader / Merchant" : "Lender"} →`
            : "Select a role to continue"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#475569" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#ff6b00", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Mobile stacking */}
      <style>{`
        @media (max-width: 600px) {
          .role-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

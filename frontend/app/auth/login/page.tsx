"use client";

import Link from "next/link";
import { useState } from "react";
import { COLORS, IMAGES } from "@/lib/constants";
import { Mail, Lock, ArrowForward, Storefront, AccountBalance } from "@mui/icons-material";

export default function LoginPage() {
  const [userType, setUserType] = useState<"trader" | "lender">("trader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const routes: Record<string, string> = { trader: "/dashboard", lender: "/lender" };
    window.location.href = routes[userType];
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={IMAGES.trader1} alt="Trader" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.85) 100%)" }} />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: COLORS.primary }}>T</div>
            <span className="text-xl font-black text-white tracking-tight">Trace</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 px-4 py-2 mb-6" style={{ backgroundColor: "rgba(255,107,53,0.1)" }}>
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-sm font-semibold text-[#F5A623]">1,200+ active traders</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-5 leading-tight">
              Your business is<br />waiting for you.
            </h2>
            <p className="text-[#9B99B5] text-lg leading-8 max-w-sm">
              Log back in and keep collecting payments, building your score, and hiring reliable workers.
            </p>

            {/* Floating stats */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: "Received today", value: "₦18,500" },
                { label: "TraceScore", value: "742" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-4 backdrop-blur-md" style={{ backgroundColor: "rgba(20,20,32,0.8)", border: "1px solid rgba(42,42,64,0.8)" }}>
                  <p className="text-xs text-[#5C5A78] mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-[#F0EFE8]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-[#3A3A58]">© 2026 Trace Technologies Ltd.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: COLORS.primary }}>T</div>
              <span className="text-xl font-black text-[#F0EFE8]">Trace</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#F0EFE8] mb-2">Welcome back</h1>
            <p className="text-[#5C5A78]">Sign in to your Trace account.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { value: "trader", label: "Trader", icon: Storefront, color: COLORS.role.trader },
              { value: "lender", label: "Lender", icon: AccountBalance, color: COLORS.role.lender },
            ].map((type) => {
              const Icon = type.icon;
              const isActive = userType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserType(type.value as "trader" | "lender")}
                  className="flex flex-col items-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold transition-all duration-200"
                  style={isActive
                    ? { backgroundColor: `${type.color}20`, border: `1.5px solid ${type.color}`, color: type.color }
                    : { backgroundColor: "#141420", border: "1.5px solid #2A2A40", color: "#5C5A78" }
                  }
                >
                  <Icon sx={{ fontSize: "22px" }} />
                  {type.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Email address</label>
              <div className="relative">
                <Mail sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#F0EFE8] outline-none transition placeholder:text-[#3A3A58]"
                  style={{ backgroundColor: "#141420", border: "1.5px solid #2A2A40" }}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-[#9B99B5]">Password</label>
                <a href="#" className="text-xs font-semibold" style={{ color: COLORS.primary }}>Forgot?</a>
              </div>
              <div className="relative">
                <Lock sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#F0EFE8] outline-none transition"
                  style={{ backgroundColor: "#141420", border: "1.5px solid #2A2A40" }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-3 rounded-xl py-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: COLORS.primary, boxShadow: "0 4px 24px rgba(255,107,53,0.35)" }}
            >
              Sign In
              <ArrowForward sx={{ fontSize: "18px" }} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5C5A78]">
            No account?{" "}
            <Link href="/auth/register" className="font-bold hover:underline" style={{ color: COLORS.primary }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

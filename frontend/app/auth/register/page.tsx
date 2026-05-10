"use client";

import Link from "next/link";
import { useState } from "react";
import { COLORS, IMAGES } from "@/lib/constants";
import { Mail, Lock, AccountCircle, Storefront, Phone, AccountBalance, ArrowForward } from "@mui/icons-material";

export default function RegisterPage() {
  const [userType, setUserType] = useState<"trader" | "lender">("trader");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", shopName: "" });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = userType === "trader" ? "/dashboard" : "/lender";
  };

  const inputClass = "w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#F0EFE8] outline-none transition placeholder:text-[#3A3A58]";
  const inputStyle = { backgroundColor: "#141420", border: "1.5px solid #2A2A40" };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={IMAGES.marketplace} alt="Traders" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.2) 0%, rgba(10,10,15,0.9) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: COLORS.primary }}>T</div>
            <span className="text-xl font-black text-white">Trace</span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 px-4 py-2 mb-6" style={{ backgroundColor: "rgba(255,107,53,0.1)" }}>
              <span className="text-sm font-semibold text-[#F5A623]">Free to start. No bank required.</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-5 leading-tight">
              Turn your hustle into<br />verifiable history.
            </h2>
            <p className="text-[#9B99B5] text-lg leading-8 max-w-sm">
              Join Trace — collect payments, build your TraceScore, and get capital when your business needs to grow.
            </p>
            <div className="mt-10 space-y-3">
              {["No collateral needed", "Instant payment activation", "Hire students within 24hrs"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span className="text-sm text-[#9B99B5]">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#3A3A58]">© 2026 Trace Technologies Ltd.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: COLORS.primary }}>T</div>
              <span className="text-xl font-black text-[#F0EFE8]">Trace</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#F0EFE8] mb-2">Create your account</h1>
            <p className="text-[#5C5A78]">Join 1,200+ traders already on Trace.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { value: "trader", label: "I'm a Trader", icon: Storefront, color: COLORS.role.trader },
              { value: "lender", label: "I'm a Lender", icon: AccountBalance, color: COLORS.role.lender },
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

          <form onSubmit={handleSignup} className="space-y-4">
            {userType === "trader" && (
              <div>
                <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Shop Name</label>
                <div className="relative">
                  <Storefront sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" placeholder="e.g. Amaka Foods" value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className={inputClass} style={inputStyle} required />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Full Name</label>
              <div className="relative">
                <AccountCircle sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="text" placeholder="Your full name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Email address</label>
              <div className="relative">
                <Mail sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="email" placeholder="you@example.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Phone number</label>
              <div className="relative">
                <Phone sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="tel" placeholder="+234 8xx xxx xxxx" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#9B99B5]">Password</label>
              <div className="relative">
                <Lock sx={{ fontSize: "18px", color: "#3A3A58" }} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="password" placeholder="Min. 8 characters" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputClass} style={inputStyle} required />
              </div>
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-3 rounded-xl py-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-xl mt-2"
              style={{ backgroundColor: COLORS.primary, boxShadow: "0 4px 24px rgba(255,107,53,0.35)" }}
            >
              Create Account
              <ArrowForward sx={{ fontSize: "18px" }} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5C5A78]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold hover:underline" style={{ color: COLORS.primary }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

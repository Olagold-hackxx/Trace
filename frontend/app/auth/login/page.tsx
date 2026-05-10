"use client";

import Link from "next/link";
import { useState } from "react";
import { COLORS } from "@/lib/constants";
import { Mail, Lock } from "@mui/icons-material";

export default function LoginPage() {
  const [userType, setUserType] = useState<"trader" | "lender">("trader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const routes: Record<string, string> = {
      trader: "/dashboard",
      lender: "/lender",
    };

    window.location.href = routes[userType];
  };

  const userTypes = [
    { value: "trader", label: "Trader", color: COLORS.primary },
    { value: "lender", label: "Lender", color: COLORS.role.lender },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white lg:grid lg:grid-cols-2">
      {/* Left side */}
      <aside className="hidden min-h-screen flex-col justify-between bg-[#0f172a] p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
            style={{ backgroundColor: COLORS.primary }}
          >
            T
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Trace
          </span>
        </Link>

        <div className="max-w-xl">
          <div className="mb-5 w-fit rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
            Welcome back
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">
            Manage payments, credit, and jobs in one place.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Access your Trace account to manage business payments, TraceScore,
            restock capital, and worker operations.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          © 2024 Trace. All rights reserved.
        </p>
      </aside>

      {/* Right side */}
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-[#e2e8f0] bg-white p-6 text-[#0f172a] shadow-2xl shadow-slate-950/10 sm:p-8">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
                style={{ backgroundColor: COLORS.primary }}
              >
                T
              </div>
              <span className="text-lg font-black tracking-tight text-[#0f172a]">
                Trace
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">
            Sign In
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#64748b]">
            Log in to your Trace account.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setUserType(type.value as "trader" | "lender")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  userType === type.value
                    ? "text-white shadow-sm"
                    : "border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]"
                }`}
                style={
                  userType === type.value
                    ? { backgroundColor: type.color }
                    : undefined
                }
              >
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#0f172a]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-[#64748b]" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#e2e8f0] bg-white py-3 pl-10 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#0f172a]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-[#64748b]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#e2e8f0] bg-white py-3 pl-10 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
              style={{ backgroundColor: COLORS.primary }}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748b]">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold hover:underline"
                style={{ color: COLORS.primary }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
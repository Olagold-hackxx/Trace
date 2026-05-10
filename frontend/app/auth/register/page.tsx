"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";

type AccountType = "user" | "lender";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    businessName: "", institutionName: "", rcNumber: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(accountType === "lender" ? "/lender" : "/dashboard");
  };

  const isLender = accountType === "lender";
  const accentColor = isLender ? "#2563eb" : "#ff6b00";
  const accentBg = isLender ? "#dae2fd" : "#fff1eb";

  const inputCls = "w-full px-3 py-3 text-sm rounded-xl border outline-none transition-all focus:ring-2";
  const inputStyle = { borderColor: "#e2bfb0", backgroundColor: "#fff8f6", color: "#261812" };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#fff8f6" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ backgroundColor: "#0f172a" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}>T</div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "Epilogue, sans-serif" }}>Trace</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Epilogue, sans-serif", lineHeight: 1.2 }}>
            Your financial identity starts here.
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Join thousands of Lagos merchants and lenders building the future of informal finance.
          </p>
          <div className="space-y-5">
            {[
              { icon: "💳", title: "Collect payments instantly", desc: "Share your link, get paid in minutes" },
              { icon: "📊", title: "Build your TraceScore", desc: "Every transaction improves your financial identity" },
              { icon: "💰", title: "Unlock capital", desc: "Pre-qualified offers from verified lenders" },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2026 Trace Financial Technology Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center py-10 px-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#ff6b00" }}>T</div>
              <span className="font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>Trace</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>Create your account</h1>
            <p className="text-sm text-[#8e7164] mt-1">Get started in under 2 minutes.</p>
          </div>

          {/* Account type */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["user", "lender"] as AccountType[]).map((t) => (
              <button
                key={t}
                onClick={() => setAccountType(t)}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: accountType === t ? (t === "lender" ? "#2563eb" : "#ff6b00") : "#e2bfb0",
                  backgroundColor: accountType === t ? (t === "lender" ? "#dae2fd" : "#fff1eb") : "#fff",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{t === "user" ? "🧑‍💼" : "🏦"}</span>
                  {accountType === t && <CheckCircle style={{ fontSize: 18, color: t === "lender" ? "#2563eb" : "#ff6b00" }} />}
                </div>
                <p className="text-sm font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  {t === "user" ? "Normal User" : "Lender"}
                </p>
                <p className="text-xs text-[#8e7164] mt-0.5">
                  {t === "user" ? "Merchant, trader, worker" : "Microfinance, bank, fund"}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Full Name</label>
                <input type="text" placeholder="Amaka Okonkwo" required value={form.fullName} onChange={set("fullName")} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Phone Number</label>
                <input type="tel" placeholder="+234 801 234 5678" required value={form.phone} onChange={set("phone")} className={inputCls} style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Email Address</label>
              <input type="email" placeholder="amaka@amakafoods.ng" required value={form.email} onChange={set("email")} className={inputCls} style={inputStyle} />
            </div>

            {isLender ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Institution Name</label>
                  <input type="text" placeholder="Zenith Capital Finance" required value={form.institutionName} onChange={set("institutionName")} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">RC Number</label>
                  <input type="text" placeholder="RC-0012834" value={form.rcNumber} onChange={set("rcNumber")} className={inputCls} style={inputStyle} />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Business Name <span className="text-[#8e7164] font-normal">(optional)</span></label>
                <input type="text" placeholder="Amaka Foods" value={form.businessName} onChange={set("businessName")} className={inputCls} style={inputStyle} />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" required value={form.password} onChange={set("password")} className={inputCls + " pr-10"} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-[#8e7164]">
                  {showPass ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Confirm Password</label>
              <input type="password" placeholder="Repeat password" required value={form.confirmPassword} onChange={set("confirmPassword")} className={inputCls} style={inputStyle} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded" style={{ accentColor }} />
              <span className="text-xs text-[#5a4136] leading-relaxed">
                I agree to the <Link href="#" className="underline" style={{ color: accentColor }}>Terms of Service</Link> and{" "}
                <Link href="#" className="underline" style={{ color: accentColor }}>Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              Create {isLender ? "Lender" : ""} Account
            </button>
          </form>

          <p className="text-center text-sm text-[#8e7164] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold" style={{ color: accentColor }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

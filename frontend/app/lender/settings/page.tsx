"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import {
  Business,
  Notifications,
  Security,
  AccountBalance,
  Edit,
  CheckCircle,
} from "@mui/icons-material";

export default function LenderSettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const inputClass = "w-full rounded-xl py-3 px-4 text-sm text-[#F0EFE8] outline-none placeholder:text-[#3A3A58]";
  const inputStyle = { backgroundColor: "#0F0F1A", border: "1.5px solid #2A2A40" };

  return (
    <AppShell role="lender">
      <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: "#0A0A0F" }}>
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5C5A78] mb-2">Account</p>
          <h1 className="text-3xl font-black text-[#F0EFE8]">Settings</h1>
          <p className="text-[#5C5A78] mt-1">Manage your institution profile and preferences.</p>
        </div>

        {/* Profile preview card */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
          <div className="h-24" style={{ background: "linear-gradient(135deg, #1C1020 0%, #0F1A1C 100%)" }} />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-6">
              <div className="flex items-end gap-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white border-4"
                  style={{ backgroundColor: "#FF6B35", borderColor: "#0A0A0F" }}
                >
                  Z
                </div>
                <div className="pb-1">
                  <p className="text-xl font-black text-[#F0EFE8]">Zenith Capital</p>
                  <p className="text-sm text-[#5C5A78]">Financial Institution · Lagos, Nigeria</p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#9B99B5] hover:text-[#F0EFE8] transition-all"
                style={{ border: "1px solid #2A2A40" }}
              >
                <Edit sx={{ fontSize: "16px" }} />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Approval Rate", value: "90%", color: "#22C55E" },
                { label: "Total Approved", value: "18", color: "#F5A623" },
                { label: "Capital Deployed", value: "₦9.2M", color: "#FF6B35" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}>
                  <p className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-[#5C5A78]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Institution profile */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: "#FF6B3520" }}>
                <Business sx={{ fontSize: "20px", color: "#FF6B35" }} />
              </div>
              <h2 className="text-lg font-black text-[#F0EFE8]">Institution Profile</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Institution Name", placeholder: "Zenith Capital", defaultValue: "Zenith Capital" },
                { label: "Registration Number", placeholder: "RC-XXXXXXX", defaultValue: "RC-2019847" },
                { label: "Contact Email", placeholder: "contact@zenith.com", defaultValue: "contact@zenith.com" },
                { label: "Phone Number", placeholder: "+234 800 000 0000", defaultValue: "+234 803 456 7890" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-[#9B99B5] mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    defaultValue={f.defaultValue}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave("profile")}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 mt-2"
                style={{ backgroundColor: "#FF6B35" }}
              >
                {saved === "profile" ? <CheckCircle sx={{ fontSize: "18px" }} /> : null}
                {saved === "profile" ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Lending preferences */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: "#F5A62320" }}>
                <AccountBalance sx={{ fontSize: "20px", color: "#F5A623" }} />
              </div>
              <h2 className="text-lg font-black text-[#F0EFE8]">Lending Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Min TraceScore", placeholder: "700", defaultValue: "700" },
                { label: "Max Loan Amount (₦)", placeholder: "1,000,000", defaultValue: "1,000,000" },
                { label: "Interest Rate (APR %)", placeholder: "18", defaultValue: "18" },
                { label: "Max Repayment Months", placeholder: "12", defaultValue: "12" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-[#9B99B5] mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    defaultValue={f.defaultValue}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave("lending")}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 mt-2"
                style={{ backgroundColor: "#FF6B35" }}
              >
                {saved === "lending" ? <CheckCircle sx={{ fontSize: "18px" }} /> : null}
                {saved === "lending" ? "Saved!" : "Save Preferences"}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: "#A855F720" }}>
                <Notifications sx={{ fontSize: "20px", color: "#A855F7" }} />
              </div>
              <h2 className="text-lg font-black text-[#F0EFE8]">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "New application submitted", on: true },
                { label: "TraceScore updates for watchlist", on: true },
                { label: "Repayment reminders", on: false },
                { label: "Weekly portfolio summary", on: true },
                { label: "Platform announcements", on: false },
              ].map((item) => {
                const [on, setOn] = useState(item.on);
                return (
                  <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #1C1C2E" }}>
                    <span className="text-sm text-[#9B99B5]">{item.label}</span>
                    <button
                      onClick={() => setOn(!on)}
                      className="w-11 h-6 rounded-full transition-all duration-300 relative flex-none"
                      style={{ backgroundColor: on ? "#FF6B35" : "#2A2A40" }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                        style={{ left: on ? "22px" : "2px" }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: "#22C55E20" }}>
                <Security sx={{ fontSize: "20px", color: "#22C55E" }} />
              </div>
              <h2 className="text-lg font-black text-[#F0EFE8]">Security</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Current Password", placeholder: "••••••••", type: "password" },
                { label: "New Password", placeholder: "••••••••", type: "password" },
                { label: "Confirm New Password", placeholder: "••••••••", type: "password" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-[#9B99B5] mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className={inputClass} style={inputStyle} />
                </div>
              ))}

              {/* 2FA toggle */}
              <div
                className="flex items-center justify-between rounded-2xl p-4"
                style={{ backgroundColor: "#0F0F1A", border: "1px solid #2A2A40" }}
              >
                <div>
                  <p className="text-sm font-bold text-[#F0EFE8]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#5C5A78] mt-0.5">Add extra security to your account</p>
                </div>
                <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>Enabled</span>
              </div>

              <button
                onClick={() => handleSave("security")}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: "#FF6B35" }}
              >
                {saved === "security" ? <CheckCircle sx={{ fontSize: "18px" }} /> : null}
                {saved === "security" ? "Saved!" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

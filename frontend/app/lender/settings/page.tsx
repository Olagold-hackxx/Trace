"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import {
  Business,
  Lock,
  Notifications,
  AccountBalance,
  Save,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material";

const tabs = ["Institution", "Underwriting Rules", "Notifications", "API Access"];

export default function LenderSettingsPage() {
  const [activeTab, setActiveTab] = useState("Institution");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    institutionName: "Zenith Capital Finance",
    contactEmail: "loans@zenithcapital.ng",
    phone: "+234 1 234 5678",
    address: "14 Marina Street, Lagos Island",
    rcNumber: "RC-0012834",
    minScore: "600",
    maxAmount: "5000000",
    defaultRate: "18",
    maxTenor: "24",
    riskTolerance: "medium",
    emailAlerts: true,
    newApplications: true,
    repaymentDue: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell role="lender" title="Settings">
      <div className="p-6 max-w-5xl mx-auto">
        {saved && (
          <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" }}>
            <CheckCircle style={{ fontSize: 20, color: "#16a34a" }} />
            <p className="text-sm font-semibold text-[#16a34a]">Settings saved successfully.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
              style={
                activeTab === t
                  ? { backgroundColor: "#2563eb", color: "#fff" }
                  : { color: "#cbd5e1" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Institution Tab */}
        {activeTab === "Institution" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#dae2fd" }}>
                <Business style={{ fontSize: 20, color: "#2563eb" }} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Institution Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: "Institution Name", key: "institutionName", type: "text" },
                { label: "Contact Email", key: "contactEmail", type: "email" },
                { label: "Phone Number", key: "phone", type: "text" },
                { label: "RC Number", key: "rcNumber", type: "text" },
                { label: "Business Address", key: "address", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(settings as Record<string, string>)[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
                    style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "#1e1e1e" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#f0f0f0] text-sm">Settlement Account</h3>
                <button className="text-sm font-semibold" style={{ color: "#2563eb" }}>Add account</button>
              </div>
              <div className="p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <AccountBalance style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <p className="text-sm font-semibold text-[#f0f0f0]">Zenith Bank — 1234567890</p>
                  <p className="text-xs text-[#94a3b8]">Primary disbursement & repayment account</p>
                </div>
                <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>Verified</span>
              </div>
            </div>
            <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#2563eb" }}>
              <Save style={{ fontSize: 18 }} />Save Changes
            </button>
          </div>
        )}

        {/* Underwriting Rules Tab */}
        {activeTab === "Underwriting Rules" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#dae2fd" }}>
                <AccountBalance style={{ fontSize: 20, color: "#2563eb" }} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Underwriting Rules</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: "Minimum TraceScore", key: "minScore", suffix: "/ 900" },
                { label: "Maximum Loan Amount (₦)", key: "maxAmount", suffix: "" },
                { label: "Default Interest Rate (%)", key: "defaultRate", suffix: "% p.a." },
                { label: "Maximum Tenor (months)", key: "maxTenor", suffix: "months" },
              ].map(({ label, key, suffix }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={(settings as Record<string, string>)[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="flex-1 px-3 py-2.5 text-sm rounded-xl border outline-none"
                      style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                    />
                    {suffix && <span className="text-sm text-[#94a3b8] whitespace-nowrap">{suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-2">Risk Tolerance</label>
              <div className="grid grid-cols-3 gap-3">
                {["low", "medium", "high"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSettings({ ...settings, riskTolerance: r })}
                    className="py-3 rounded-xl text-sm font-semibold capitalize border transition-all"
                    style={
                      settings.riskTolerance === r
                        ? { backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                        : { backgroundColor: "#161616", color: "#cbd5e1", borderColor: "#1e1e1e" }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs font-semibold text-[#cbd5e1] mb-2">Auto-approval Threshold</p>
              <p className="text-sm text-[#94a3b8]">Applications with TraceScore ≥ 750 and amount ≤ ₦500,000 will be auto-approved.</p>
              <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <div className="relative w-10 h-5 rounded-full transition-all" style={{ backgroundColor: "#2563eb" }}>
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-[#111111]" />
                </div>
                <span className="text-sm font-medium text-[#f0f0f0]">Auto-approve enabled</span>
              </label>
            </div>
            <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#2563eb" }}>
              <Save style={{ fontSize: 18 }} />Save Rules
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "Notifications" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#dae2fd" }}>
                <Notifications style={{ fontSize: 20, color: "#2563eb" }} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive all alerts via email" },
                { key: "newApplications", label: "New Loan Applications", desc: "Notify when a merchant submits a new application" },
                { key: "repaymentDue", label: "Repayment Due Reminders", desc: "3-day and 1-day reminders before repayment date" },
                { key: "weeklyReport", label: "Weekly Portfolio Report", desc: "Portfolio summary every Monday morning" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <div>
                    <p className="text-sm font-semibold text-[#f0f0f0]">{label}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, [key]: !(settings as Record<string, boolean>)[key] })}
                    className="relative w-11 h-6 rounded-full transition-all"
                    style={{ backgroundColor: (settings as Record<string, boolean>)[key] ? "#2563eb" : "#1e1e1e" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-all"
                      style={{ left: (settings as Record<string, boolean>)[key] ? "calc(100% - 22px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#2563eb" }}>
              <Save style={{ fontSize: 18 }} />Save Preferences
            </button>
          </div>
        )}

        {/* API Access Tab */}
        {activeTab === "API Access" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#dae2fd" }}>
                <Lock style={{ fontSize: 20, color: "#2563eb" }} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>API Access</h2>
            </div>
            <p className="text-sm text-[#cbd5e1] mb-6">Use our API to integrate TraceScore directly into your loan origination system.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value="trc_live_zenith_k92mxpq4n8rlzjew"
                    readOnly
                    className="flex-1 px-3 py-2.5 text-sm rounded-xl border font-mono outline-none"
                    style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                  />
                  <button onClick={() => setShowKey(!showKey)} className="p-2.5 rounded-xl border transition-all hover:bg-[#161616]" style={{ borderColor: "#1e1e1e" }}>
                    {showKey ? <VisibilityOff style={{ fontSize: 18, color: "#cbd5e1" }} /> : <Visibility style={{ fontSize: 18, color: "#cbd5e1" }} />}
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-xs font-semibold text-[#cbd5e1] mb-3">API Endpoints</p>
                <div className="space-y-2 font-mono text-xs text-[#f0f0f0]">
                  <p>GET /v1/tracescore/{"{merchant_id}"}</p>
                  <p>GET /v1/merchants/{"{merchant_id}"}/profile</p>
                  <p>POST /v1/loans/decision</p>
                  <p>GET /v1/loans/{"{loan_id}"}/repayments</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "API Calls (30d)", val: "4,291" },
                  { label: "Avg Response", val: "120ms" },
                  { label: "Error Rate", val: "0.02%" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <p className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{s.val}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

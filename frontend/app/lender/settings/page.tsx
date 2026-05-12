"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState } from "react";
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
import { fetchBackend, formatNairaFromKobo } from "@/lib/backend";

const tabs = ["Institution", "Underwriting Rules", "Notifications", "API Access"];

interface ApiKeysPayload {
  publicKey: string;
  docs: string[];
}

export default function LenderSettingsPage() {
  const [activeTab, setActiveTab] = useState("Institution");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeysPayload | null>(null);
  const [settlementAccount, setSettlementAccount] = useState("Zenith Bank — 1234567890");
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

  useEffect(() => {
    void Promise.all([
      fetchBackend<{
        institutionName: string;
        minScore: number;
        maxAmountKobo: number;
        riskTolerance: string;
      }>("/lender/settings"),
      fetchBackend<ApiKeysPayload>("/lender/api-keys"),
    ]).then(([backendSettings, backendApiKeys]) => {
      setSettings((current) => ({
        ...current,
        institutionName: backendSettings.institutionName,
        minScore: String(backendSettings.minScore),
        maxAmount: String(Math.round(backendSettings.maxAmountKobo / 100)),
        riskTolerance: backendSettings.riskTolerance,
      }));
      setApiKeys(backendApiKeys);
    });
  }, []);

  const flashSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const handleSave = async () => {
    await fetchBackend("/lender/settings", {
      method: "PATCH",
      bodyJson: {
        institutionName: settings.institutionName,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        address: settings.address,
        rcNumber: settings.rcNumber,
        minScore: Number(settings.minScore),
        maxAmountKobo: Number(settings.maxAmount) * 100,
        defaultRate: Number(settings.defaultRate),
        maxTenor: Number(settings.maxTenor),
        riskTolerance: settings.riskTolerance,
        notifications: {
          emailAlerts: settings.emailAlerts,
          newApplications: settings.newApplications,
          repaymentDue: settings.repaymentDue,
          weeklyReport: settings.weeklyReport,
        },
      },
    });
    flashSaved();
  };

  const handleAddSettlementAccount = async () => {
    const payload = {
      bankName: "Zenith Bank",
      accountNumber: "1234567890",
      label: "Primary settlement account",
    };

    await fetchBackend<{ account?: { bankName?: string; accountNumber?: string } }>("/lender/settlement-accounts", {
      method: "POST",
      bodyJson: payload,
    });

    setSettlementAccount(`${payload.bankName} — ${payload.accountNumber}`);
    flashSaved();
  };

  return (
    <AppShell role="lender" title="Settings">
      <div className="p-6 max-w-5xl mx-auto">
        {saved && (
          <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" }}>
            <CheckCircle style={{ fontSize: 20, color: "#16a34a" }} />
            <p className="text-sm font-semibold text-[#16a34a]">Settings synced with the lender backend.</p>
          </div>
        )}

        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
              style={activeTab === t ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "Institution" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#3b1d09" }}>
                <Business style={{ fontSize: 20, color: "#ff6b00" }} />
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
                <button onClick={() => void handleAddSettlementAccount()} className="text-sm font-semibold" style={{ color: "#ff6b00" }}>Add account</button>
              </div>
              <div className="p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <AccountBalance style={{ fontSize: 24, color: "#ff6b00" }} />
                <div>
                  <p className="text-sm font-semibold text-[#f0f0f0]">{settlementAccount}</p>
                  <p className="text-xs text-[#94a3b8]">Primary disbursement & repayment account</p>
                </div>
                <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>Verified</span>
              </div>
            </div>
            <button onClick={() => void handleSave()} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#ff6b00" }}>
              <Save style={{ fontSize: 18 }} />Save Changes
            </button>
          </div>
        )}

        {activeTab === "Underwriting Rules" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#3b1d09" }}>
                <AccountBalance style={{ fontSize: 20, color: "#ff6b00" }} />
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
                        ? { backgroundColor: "#ff6b00", color: "#fff", borderColor: "#ff6b00" }
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
              <p className="text-sm text-[#94a3b8]">
                Applications with TraceScore ≥ {settings.minScore} and amount ≤ {formatNairaFromKobo(Number(settings.maxAmount) * 100)} stay within your configured range.
              </p>
              <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <div className="relative w-10 h-5 rounded-full transition-all" style={{ backgroundColor: "#ff6b00" }}>
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-[#111111]" />
                </div>
                <span className="text-sm font-medium text-[#f0f0f0]">Auto-approve enabled</span>
              </label>
            </div>
            <button onClick={() => void handleSave()} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#ff6b00" }}>
              <Save style={{ fontSize: 18 }} />Save Rules
            </button>
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#3b1d09" }}>
                <Notifications style={{ fontSize: 20, color: "#ff6b00" }} />
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
                    style={{ backgroundColor: (settings as Record<string, boolean>)[key] ? "#ff6b00" : "#1e1e1e" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-all"
                      style={{ left: (settings as Record<string, boolean>)[key] ? "calc(100% - 22px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => void handleSave()} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#ff6b00" }}>
              <Save style={{ fontSize: 18 }} />Save Preferences
            </button>
          </div>
        )}

        {activeTab === "API Access" && (
          <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#3b1d09" }}>
                <Lock style={{ fontSize: 20, color: "#ff6b00" }} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>API Access</h2>
            </div>
            <p className="text-sm text-[#cbd5e1] mb-6">Use the lender API to pull score, profile, and repayment decisions into your origination stack.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Public API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeys?.publicKey ?? "loading..."}
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
                  {(apiKeys?.docs ?? []).map((doc) => (
                    <p key={doc}>{doc}</p>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Live Routes", val: String((apiKeys?.docs ?? []).length) },
                  { label: "Policy Floor", val: settings.minScore },
                  { label: "Max Ticket", val: formatNairaFromKobo(Number(settings.maxAmount) * 100) },
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { fetchBackend, readTraderSession, persistTraderSession, BackendUser, formatNairaFromKobo } from "@/lib/backend";

const CATEGORIES = [
  { value: "delivery",          label: "Delivery / Dispatch" },
  { value: "welding",           label: "Welding" },
  { value: "electrical",        label: "Electrician" },
  { value: "plumbing",          label: "Plumbing" },
  { value: "painting",          label: "Painting / Sign writing" },
  { value: "tailoring",         label: "Tailoring / Fashion" },
  { value: "carpentry",         label: "Carpentry / Furniture" },
  { value: "cleaning",          label: "Cleaning / Laundry" },
  { value: "catering",          label: "Catering / Cooking" },
  { value: "security",          label: "Security / Guard" },
  { value: "driving",           label: "Driving / Logistics" },
  { value: "errands",           label: "Errands / Personal assistant" },
  { value: "okada_rider",       label: "Okada / Motorcycle delivery" },
  { value: "pos_agent",         label: "POS Agent / Mobile money" },
  { value: "market_food_vendor","label": "Market food vendor" },
  { value: "general",           label: "General labour" },
];

const LOCATIONS = [
  "Unilag", "Yaba", "Surulere", "Mushin", "Lekki", "Ikeja",
  "Computer Village", "Alaba", "Idumota", "Balogun", "Agege",
  "Oshodi", "Lagos Island", "Ajah", "Ikorodu", "Festac",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: 6,
};

export default function WorkerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    workerCategory: "",
    skills: [] as string[],
    bio: "",
    marketName: "",
    dailyRateKobo: "",
    serviceRadiusKm: "15",
  });

  // Pre-fill from existing session
  useEffect(() => {
    const session = readTraderSession();
    if (session?.user) {
      const u = session.user as BackendUser & {
        workerCategory?: string;
        skills?: string[];
        bio?: string;
        dailyRateKobo?: number;
        serviceRadiusKm?: number;
      };
      setForm((prev) => ({
        ...prev,
        workerCategory: u.workerCategory || u.archetype || "",
        skills: u.skills || [],
        bio: u.bio || "",
        marketName: u.marketName || "",
        dailyRateKobo: u.dailyRateKobo ? String(Math.round(u.dailyRateKobo / 100)) : "",
        serviceRadiusKm: u.serviceRadiusKm ? String(u.serviceRadiusKm) : "15",
      }));
    }
  }, []);

  const toggleSkill = (val: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(val)
        ? prev.skills.filter((s) => s !== val)
        : [...prev.skills, val],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.workerCategory) errs.workerCategory = "Select your main trade";
    if (!form.bio.trim() || form.bio.trim().length < 20) errs.bio = "Write at least 20 characters about yourself";
    if (!form.marketName) errs.marketName = "Select your location";
    if (!form.dailyRateKobo || Number(form.dailyRateKobo) < 500)
      errs.dailyRateKobo = "Enter a daily rate (min ₦500)";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    const allSkills = Array.from(new Set([form.workerCategory, ...form.skills]));

    try {
      const updated = await fetchBackend<BackendUser>("/users/me", {
        method: "PATCH",
        bodyJson: {
          workerCategory: form.workerCategory,
          skills: allSkills,
          bio: form.bio.trim(),
          marketName: form.marketName,
          dailyRateKobo: Math.round(Number(form.dailyRateKobo) * 100),
          serviceRadiusKm: Number(form.serviceRadiusKm),
        },
      });

      const session = readTraderSession();
      persistTraderSession({ user: { ...session?.user, ...updated }, virtualAccount: session?.virtualAccount });
      router.push("/dashboard");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not save your profile. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#0d0d0d", fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <BrandLogo href="/" iconSize={32} textSize={18} textColor="#ffffff" />
        </div>

        <h1 style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Build your worker profile
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 40, lineHeight: 1.6 }}>
          This is how employers and the job matching engine will find you. The more detail you add, the better your matches.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Primary Trade */}
          <div>
            <label style={labelStyle}>Primary trade / skill <span style={{ color: "#ff6b00" }}>*</span></label>
            <select
              value={form.workerCategory}
              onChange={(e) => { setForm((p) => ({ ...p, workerCategory: e.target.value })); setErrors((p) => ({ ...p, workerCategory: "" })); }}
              style={{ ...inputStyle, borderColor: errors.workerCategory ? "#dc2626" : "#2a2a2a" }}
            >
              <option value="">Select your main trade…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.workerCategory && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.workerCategory}</p>}
          </div>

          {/* Secondary Skills */}
          <div>
            <label style={labelStyle}>Other skills you offer <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {CATEGORIES.filter((c) => c.value !== form.workerCategory).map((c) => {
                const active = form.skills.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleSkill(c.value)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 999,
                      border: `1px solid ${active ? "#ff6b00" : "#2a2a2a"}`,
                      background: active ? "rgba(255,107,0,0.12)" : "#141414",
                      color: active ? "#ff6b00" : "#94a3b8",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>About you <span style={{ color: "#ff6b00" }}>*</span></label>
            <textarea
              rows={4}
              placeholder="Describe your experience, how long you've been doing it, and what makes you reliable. E.g. 'I've been doing delivery in Yaba for 3 years. I own my own bike and know the Unilag area well.'"
              value={form.bio}
              onChange={(e) => { setForm((p) => ({ ...p, bio: e.target.value })); setErrors((p) => ({ ...p, bio: "" })); }}
              style={{
                ...inputStyle,
                padding: "12px 16px",
                resize: "vertical",
                minHeight: 110,
                lineHeight: 1.6,
                borderColor: errors.bio ? "#dc2626" : "#2a2a2a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
              onBlur={(e) => (e.target.style.borderColor = errors.bio ? "#dc2626" : "#2a2a2a")}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {errors.bio
                ? <p style={{ fontSize: 12, color: "#dc2626" }}>{errors.bio}</p>
                : <span />}
              <p style={{ fontSize: 12, color: form.bio.length >= 20 ? "#22c55e" : "#475569" }}>
                {form.bio.length} / 20 min
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Your base location <span style={{ color: "#ff6b00" }}>*</span></label>
            <select
              value={form.marketName}
              onChange={(e) => { setForm((p) => ({ ...p, marketName: e.target.value })); setErrors((p) => ({ ...p, marketName: "" })); }}
              style={{ ...inputStyle, borderColor: errors.marketName ? "#dc2626" : "#2a2a2a" }}
            >
              <option value="">Select your area…</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.marketName && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.marketName}</p>}
          </div>

          {/* Daily Rate + Service Radius side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Daily rate (₦) <span style={{ color: "#ff6b00" }}>*</span></label>
              <input
                type="number"
                min={500}
                placeholder="e.g. 5000"
                value={form.dailyRateKobo}
                onChange={(e) => { setForm((p) => ({ ...p, dailyRateKobo: e.target.value })); setErrors((p) => ({ ...p, dailyRateKobo: "" })); }}
                style={{ ...inputStyle, borderColor: errors.dailyRateKobo ? "#dc2626" : "#2a2a2a" }}
                onFocus={(e) => (e.target.style.borderColor = "#ff6b00")}
                onBlur={(e) => (e.target.style.borderColor = errors.dailyRateKobo ? "#dc2626" : "#2a2a2a")}
              />
              {errors.dailyRateKobo && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>{errors.dailyRateKobo}</p>}
              {form.dailyRateKobo && !errors.dailyRateKobo && (
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  {formatNairaFromKobo(Number(form.dailyRateKobo) * 100)} / day
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Travel radius (km)</label>
              <select
                value={form.serviceRadiusKm}
                onChange={(e) => setForm((p) => ({ ...p, serviceRadiusKm: e.target.value }))}
                style={inputStyle}
              >
                {[5, 10, 15, 20, 30, 50].map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>How far you're willing to travel</p>
            </div>
          </div>

          {/* Error */}
          {errors.form && (
            <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "#1c0f0f", border: "1px solid #7f1d1d" }}>
              <p style={{ fontSize: 13, color: "#fca5a5" }}>{errors.form}</p>
            </div>
          )}

          {/* Preview card */}
          {form.workerCategory && form.bio.length >= 20 && form.marketName && (
            <div style={{ padding: "16px 20px", borderRadius: 14, border: "1px solid #1e1e1e", background: "#111" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#ff6b00", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Profile preview
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {CATEGORIES.find((c) => c.value === form.workerCategory)?.label}
                {form.skills.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#64748b", marginLeft: 8 }}>
                    + {form.skills.length} more skill{form.skills.length > 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8, lineHeight: 1.6 }}>{form.bio}</p>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94a3b8" }}>
                <span>📍 {form.marketName}</span>
                {form.dailyRateKobo && <span>💰 ₦{Number(form.dailyRateKobo).toLocaleString()}/day</span>}
                <span>🛵 {form.serviceRadiusKm} km radius</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 14,
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
            {loading ? "Saving profile…" : "Save profile & go to dashboard →"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Hanken Grotesk', sans-serif",
              textAlign: "center",
              marginTop: -16,
            }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

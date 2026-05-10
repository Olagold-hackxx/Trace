"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import Link from "next/link";
import { ArrowBack, LocationOn, AccessTime, People, Star, CheckCircle, Work } from "@mui/icons-material";

const job = {
  id: "1", title: "Sales Assistant", company: "Amaka Foods", companyRating: 4.7, companyJobs: 12, companyWorkers: 38,
  location: "Yaba, Lagos", area: "Market stall — Yaba main market",
  pay: "₦8,500", period: "day", type: "Full-day", duration: "3 days",
  minScore: 500, applicants: 14, posted: "2 hours ago",
  urgent: true,
  description: `We are looking for a reliable and personable Sales Assistant to help manage our food stall at Yaba main market. Amaka Foods is one of the most popular food vendors in Yaba, serving hundreds of customers daily with fresh Nigerian meals.

You will work directly alongside our team, assist customers with their orders, handle cash and POS payments, and help maintain the stall throughout the day. This is a great opportunity to earn good pay while building your work history on Trace.`,
  responsibilities: [
    "Greet customers and take food orders accurately",
    "Handle cash, POS, and Trace payment link transactions",
    "Help pack and serve food promptly",
    "Maintain cleanliness of the stall throughout the shift",
    "Report sales totals at the end of each day",
    "Assist with restocking and inventory when required",
  ],
  requirements: [
    "Must be reliable and punctual — shift starts at 7:30am",
    "Good communication skills in English and/or Yoruba",
    "Basic numeracy for handling cash",
    "TraceScore of 500 or above preferred",
    "Verifiable ID (NIN or student ID)",
  ],
  bring: ["Personal protective clothing or apron", "Phone for Trace work app", "Willingness to work in an outdoor market environment"],
};

const similarJobs = [
  { id: "4", title: "Cashier", company: "Buka Hub", pay: "₦5,500/day", tag: "Open", tagColor: "#16a34a", tagBg: "#dcfce7" },
  { id: "9", title: "Kitchen Assistant", company: "Eko Buka", pay: "₦5,000/day", tag: "Open", tagColor: "#16a34a", tagBg: "#dcfce7" },
  { id: "5", title: "Event Caterer", company: "Mama Cooks", pay: "₦15,000/event", tag: "Open", tagColor: "#16a34a", tagBg: "#dcfce7" },
];

export default function JobDetailPage() {
  const [applied, setApplied] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [available, setAvailable] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setShowForm(false);
  };

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f0f0f0] transition-colors">
            <ArrowBack style={{ fontSize: 18 }} />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}>
                    {job.company[0]}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</h1>
                    <p className="text-[#cbd5e1] mt-1">{job.company}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><LocationOn style={{ fontSize: 14 }} />{job.location}</span>
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><AccessTime style={{ fontSize: 14 }} />Posted {job.posted}</span>
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><People style={{ fontSize: 14 }} />{job.applicants} applicants</span>
                    </div>
                  </div>
                </div>
                {job.urgent && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex-none" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>🔴 Urgent</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Pay</p>
                  <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.pay}</p>
                  <p className="text-xs text-[#94a3b8]">per {job.period}</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Duration</p>
                  <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.duration}</p>
                  <p className="text-xs text-[#94a3b8]">{job.type}</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Min Score</p>
                  <p className="text-xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: "#ff6b00" }}>{job.minScore}</p>
                  <p className="text-xs text-[#94a3b8]">TraceScore</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Location</p>
                  <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Yaba</p>
                  <p className="text-xs text-[#94a3b8]">Main market</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>About this Job</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>What You&#39;ll Do</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#cbd5e1]">
                    <CheckCircle style={{ fontSize: 18, color: "#ff6b00", marginTop: 1 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#cbd5e1]">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-none" style={{ backgroundColor: "#ff6b00" }} />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                <p className="text-xs font-semibold text-[#cbd5e1] mb-2">What to bring</p>
                <ul className="space-y-1">
                  {job.bring.map((b, i) => (
                    <li key={i} className="text-xs text-[#cbd5e1]">· {b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Apply form */}
            {!applied ? (
              !showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: "#ff6b00" }}
                >
                  Apply for this Job
                </button>
              ) : (
                <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
                  <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Your Application</h2>
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Cover Note <span className="text-[#94a3b8] font-normal">(optional)</span></label>
                      <textarea
                        value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows={4}
                        placeholder="Tell the employer why you&#39;re a great fit for this role..."
                        className="w-full px-3 py-3 text-sm rounded-xl border outline-none resize-none"
                        style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                      <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                        className="w-4 h-4 rounded" style={{ accentColor: "#ff6b00" }} />
                      <span className="text-sm text-[#cbd5e1]">I confirm I am available for the full duration of this job</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setShowForm(false)}
                        className="py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]"
                        style={{ borderColor: "#1e1e1e" }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={!available}
                        className="py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "#ff6b00" }}>
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              )
            ) : (
              <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#dcfce7" }}>
                    <CheckCircle style={{ fontSize: 24, color: "#16a34a" }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>Application Submitted</h2>
                    <p className="text-sm text-[#cbd5e1] mt-2">Amaka Foods will review your profile and contact you if selected.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href="/jobs" className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#ff6b00" }}>
                        View My Applications
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setApplied(false);
                          setShowForm(false);
                          setAvailable(false);
                          setCoverNote("");
                        }}
                        className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold border text-[#f0f0f0] hover:bg-[#161616]"
                        style={{ borderColor: "#1e1e1e" }}
                      >
                        Apply to Another Role
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Company card */}
            <div className="bg-[#111111] rounded-2xl p-5" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>About {job.company}</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ff6b00" }}>
                  {job.company[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#f0f0f0] text-sm">{job.company}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star style={{ fontSize: 14, color: "#d97706" }} />
                    <span className="text-xs font-semibold text-[#f0f0f0]">{job.companyRating}</span>
                    <span className="text-xs text-[#94a3b8]">employer rating</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Jobs posted</span>
                  <span className="font-semibold text-[#f0f0f0]">{job.companyJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Workers hired</span>
                  <span className="font-semibold text-[#f0f0f0]">{job.companyWorkers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Payout rate</span>
                  <span className="font-semibold" style={{ color: "#16a34a" }}>100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Location</span>
                  <span className="font-semibold text-[#f0f0f0]">Yaba, Lagos</span>
                </div>
              </div>
            </div>

            {/* Your score */}
            <div className="bg-[#111111] rounded-2xl p-5" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <p className="text-xs font-semibold text-[#94a3b8] mb-2">Your TraceScore</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: "#ff6b00" }}>742</p>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>Exceeds min.</span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-1">Minimum required: {job.minScore}</p>
              <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                <div className="h-full rounded-full" style={{ width: "82%", backgroundColor: "#ff6b00" }} />
              </div>
            </div>

            {/* Similar jobs */}
            <div className="bg-[#111111] rounded-2xl p-5" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Similar Jobs</h2>
              <div className="space-y-3">
                {similarJobs.map((j) => (
                  <Link key={j.id} href={`/marketplace/${j.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#161616] transition-colors" style={{ border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#ff6b00" }}>
                        <Work style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#f0f0f0]">{j.title}</p>
                        <p className="text-xs text-[#94a3b8]">{j.company}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#f0f0f0]">{j.pay}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

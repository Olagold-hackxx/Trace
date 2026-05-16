"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Add, People, CheckCircle, Cancel, AccessTime, Work, Close, Phone } from "@mui/icons-material";
import { Spinner } from "@/components/ui/spinner";
import {
  BackendJob,
  BackendJobApplication,
  fetchBackend,
  formatDateLabel,
  formatNairaFromKobo,
} from "@/lib/backend";

interface JobApplicant {
  id: string;
  userId: string;
  coverNote: string | null;
  status: string;
  createdAt: string;
  applicant: { name: string; phone: string; businessName: string | null } | null;
}

const statusMap: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Active: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  Completed: { color: "#2563eb", bg: "#dae2fd", icon: CheckCircle },
  Draft: { color: "#94a3b8", bg: "#161616", icon: AccessTime },
  Closed: { color: "#cbd5e1", bg: "#161616", icon: Cancel },
  Pending: { color: "#d97706", bg: "#fef3c7", icon: AccessTime },
  Accepted: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  Rejected: { color: "#dc2626", bg: "#fee2e2", icon: Cancel },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || statusMap.Pending;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
      <Icon style={{ fontSize: 12 }} />{status}
    </span>
  );
}

export default function JobsPage() {
  const [postedJobs, setPostedJobs] = useState<BackendJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<BackendJobApplication[]>([]);
  const [jobsIndex, setJobsIndex] = useState<Record<string, BackendJob>>({});
  const [tab, setTab] = useState<"posted" | "applied">("posted");
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", pay: "", duration: "", location: "", desc: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicantsJob, setApplicantsJob] = useState<BackendJob | null>(null);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = { borderColor: "#1e1e1e", backgroundColor: "#111111", color: "#f0f0f0" };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openPost") === "1") {
      setTab("posted");
      setShowPostForm(true);
    }

    void loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const [mine, applications, marketplace] = await Promise.all([
        fetchBackend<BackendJob[]>("/jobs/mine"),
        fetchBackend<BackendJobApplication[]>("/job-applications/mine"),
        fetchBackend<BackendJob[]>("/marketplace/jobs"),
      ]);

      setPostedJobs(mine);
      setAppliedJobs(applications);
      setJobsIndex(Object.fromEntries(marketplace.map((job) => [job.id, job])));

      // Fetch real applicant counts for posted jobs
      const counts = await Promise.all(
        mine.map(async (job) => {
          const apps = await fetchBackend<JobApplicant[]>(`/jobs/${job.id}/applications`).catch(() => []);
          return [job.id, apps.length] as [string, number];
        })
      );
      setApplicantCounts(Object.fromEntries(counts));
    } finally {
      setLoading(false);
    }
  };

  const openApplicants = async (job: BackendJob) => {
    setApplicantsJob(job);
    setApplicants([]);
    setApplicantsLoading(true);
    try {
      const apps = await fetchBackend<JobApplicant[]>(`/jobs/${job.id}/applications`);
      setApplicants(apps);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handlePostJob = async () => {
    if (!form.title || !form.category || !form.pay || !form.duration || !form.location || !form.desc) {
      setFormError("Fill in the full job form before posting.");
      setFormSuccess(null);
      return;
    }

    try {
      const nextJob = await fetchBackend<BackendJob>("/jobs", {
        method: "POST",
        bodyJson: {
          title: form.title,
          category: form.category,
          payKobo: String(Number(form.pay) * 100),
          durationLabel: form.duration,
          location: form.location,
          description: form.desc,
        },
      });

      setForm({ title: "", category: "", pay: "", duration: "", location: "", desc: "" });
      setFormError(null);
      setFormSuccess(`${nextJob.title} is now live in your posted jobs.`);
      setShowPostForm(false);
      setTab("posted");
      await loadJobs();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not post job.");
      setFormSuccess(null);
    }
  };

  return (
    <AppShell role="user">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>My Jobs</h1>
            <p className="text-sm text-[#94a3b8] mt-1 hidden sm:block">Manage jobs you posted and track your applications</p>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
            style={{ backgroundColor: "#ff6b00" }}
          >
            <Add style={{ fontSize: 18 }} />
            <span className="hidden sm:inline">Post a Job</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>

        {formSuccess ? (
          <div className="mb-6 rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
            <CheckCircle style={{ fontSize: 18, color: "#16a34a" }} />
            <p className="text-sm text-[#f0f0f0]">{formSuccess}</p>
          </div>
        ) : null}

        {/* Post job form */}
        {showPostForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Post a New Job</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Job Title</label>
                <input type="text" placeholder="e.g. Sales Assistant" value={form.title} onChange={set("title")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Category</label>
                <select value={form.category} onChange={set("category")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle}>
                  <option value="">Select category</option>
                  {["Sales", "Delivery", "Catering", "Cleaning", "Security", "Admin", "Management"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Daily Pay (₦)</label>
                <input type="number" placeholder="8500" value={form.pay} onChange={set("pay")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Duration</label>
                <input type="text" placeholder="e.g. 3 days" value={form.duration} onChange={set("duration")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Location</label>
                <input type="text" placeholder="e.g. Yaba main market" value={form.location} onChange={set("location")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">Job Description</label>
                <textarea rows={3} placeholder="Describe the role, responsibilities, and requirements..." value={form.desc} onChange={set("desc")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none" style={inputStyle} />
              </div>
            </div>
            {formError ? <p className="mt-4 text-sm text-[#f97316]">{formError}</p> : null}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={handlePostJob}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#ff6b00" }}
              >
                Post Job
              </button>
              <button
                onClick={() => {
                  setShowPostForm(false);
                  setFormError(null);
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#161616] text-[#f0f0f0]"
                style={{ borderColor: "#1e1e1e" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
          <button onClick={() => setTab("posted")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "posted" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}>
            Posted Jobs ({postedJobs.length})
          </button>
          <button onClick={() => setTab("applied")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "applied" ? { backgroundColor: "#ff6b00", color: "#fff" } : { color: "#cbd5e1" }}>
            Applied Jobs ({appliedJobs.length})
          </button>
        </div>

        {/* Posted Jobs */}
        {tab === "posted" && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                    {["Job Title", "Category", "Status", "Applicants", "Pay", "Posted", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-4 font-semibold text-xs text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#3b1d09" }}>
                            <Work style={{ fontSize: 16, color: "#ff6b00" }} />
                          </div>
                          <span className="font-semibold text-[#f0f0f0]">{j.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#cbd5e1]">{j.category}</td>
                      <td className="px-5 py-4"><StatusBadge status={j.status === "active" ? "Active" : j.status} /></td>
                      <td className="px-5 py-4">
                        <button onClick={() => openApplicants(j)} className="flex items-center gap-1 text-[#cbd5e1] hover:text-[#ff6b00] transition-colors">
                          <People style={{ fontSize: 14 }} />{applicantCounts[j.id] ?? 0}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#f0f0f0]">{formatNairaFromKobo(j.payKobo)}/day</td>
                      <td className="px-5 py-4 text-[#94a3b8]">{formatDateLabel(j.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => openApplicants(j)} className="text-xs font-semibold transition-colors hover:underline" style={{ color: "#ff6b00" }}>
                          View applicants
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y" style={{ borderColor: "#1e1e1e" }}>
              {postedJobs.map((j) => (
                <div key={j.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#3b1d09" }}>
                      <Work style={{ fontSize: 16, color: "#ff6b00" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#f0f0f0] truncate">{j.title}</p>
                      <p className="text-xs text-[#94a3b8]">{j.category} · {formatNairaFromKobo(j.payKobo)}/day</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={j.status === "active" ? "Active" : j.status} />
                    <button onClick={() => openApplicants(j)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ff6b00" }}>
                      <People style={{ fontSize: 12 }} />{applicantCounts[j.id] ?? 0} applicants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Jobs */}
        {tab === "applied" && (
          <div className="space-y-3">
            {appliedJobs.map((j) => {
              const job = jobsIndex[j.jobId];
              return (
              <div key={j.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ff6b00" }}>
                    {job?.title?.[0] ?? "J"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job?.title ?? "Marketplace role"}</p>
                    <p className="text-sm text-[#cbd5e1]">{job?.category ?? "General"} · {job?.location ?? "Lagos"}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">Applied {formatDateLabel(j.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-none">
                  <span className="text-sm font-bold text-[#f0f0f0]">{job ? `${formatNairaFromKobo(job.payKobo)}/day` : "Flexible"}</span>
                  <StatusBadge status={j.status.charAt(0).toUpperCase() + j.status.slice(1)} />
                  {j.status === "accepted" && (
                    <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>
                      View details
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8 text-[#ff6b00]" />
              <p className="text-sm text-[#94a3b8]">Loading jobs...</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Jobs Posted", val: postedJobs.length.toString(), color: "#ff6b00" },
            { label: "Workers Hired", val: appliedJobs.filter(j => j.status === "accepted").length.toString(), color: "#ff6b00" },
            { label: "Applications Sent", val: appliedJobs.length.toString(), color: "#2563eb" },
            { label: "Accepted", val: appliedJobs.filter(j => j.status === "Accepted").length.toString(), color: "#16a34a" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: s.color }}>{s.val}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Applicants drawer */}
      {applicantsJob && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setApplicantsJob(null)} />
          <div
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{ width: "min(480px, 100vw)", backgroundColor: "#0d0d0d", borderLeft: "1px solid #1e1e1e" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #1a1a1a" }}>
              <div>
                <p className="text-base font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
                  Applicants
                </p>
                <p className="text-xs text-[#64748b] mt-0.5">{applicantsJob.title} · {applicantsJob.location}</p>
              </div>
              <button onClick={() => setApplicantsJob(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#1a1a1a]">
                <Close style={{ fontSize: 18, color: "#64748b" }} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {applicantsLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#ff6b00] border-t-transparent" style={{ animation: "spin 0.8s linear infinite" }} />
                  <p className="text-sm text-[#64748b]">Loading applicants…</p>
                </div>
              )}

              {!applicantsLoading && applicants.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <People style={{ fontSize: 40, color: "#334155" }} />
                  <p className="text-sm text-[#64748b]">No applications yet</p>
                </div>
              )}

              {!applicantsLoading && applicants.map((app, i) => (
                <div key={app.id} className="rounded-2xl p-5" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#ff6b00" }}>
                      {app.applicant?.name?.[0] ?? String(i + 1)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#f0f0f0]">{app.applicant?.name ?? "Unknown applicant"}</p>
                      {app.applicant?.businessName && (
                        <p className="text-xs text-[#94a3b8]">{app.applicant.businessName}</p>
                      )}
                    </div>
                    <StatusBadge status={app.status.charAt(0).toUpperCase() + app.status.slice(1)} />
                  </div>

                  {app.applicant?.phone && (
                    <div className="flex items-center gap-2 mb-3">
                      <Phone style={{ fontSize: 14, color: "#64748b" }} />
                      <span className="text-xs text-[#94a3b8]">{app.applicant.phone}</span>
                    </div>
                  )}

                  {app.coverNote && (
                    <p className="text-xs text-[#cbd5e1] leading-relaxed p-3 rounded-xl" style={{ backgroundColor: "#161616" }}>
                      {app.coverNote}
                    </p>
                  )}

                  <p className="text-xs text-[#475569] mt-3">Applied {formatDateLabel(app.createdAt)}</p>
                </div>
              ))}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </>
      )}
    </AppShell>
  );
}

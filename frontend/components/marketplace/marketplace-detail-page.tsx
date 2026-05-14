"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/spinner";
import {
  BackendJob,
  fetchBackend,
  formatNairaFromKobo,
  formatRelativeDate,
} from "@/lib/backend";
import { ArrowBack, LocationOn, AccessTime, People, CheckCircle } from "@mui/icons-material";

export function MarketplaceDetailPage({
  role,
  backHref,
  applicationsHref,
  similarBasePath,
  jobId,
}: {
  role: "user" | "lender";
  backHref: string;
  applicationsHref: string;
  similarBasePath: string;
  jobId: string;
}) {
  const [job, setJob] = useState<BackendJob | null>(null);
  const [similarJobs, setSimilarJobs] = useState<BackendJob[]>([]);
  const [applied, setApplied] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [available, setAvailable] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchBackend<BackendJob>(`/marketplace/jobs/${jobId}`),
      fetchBackend<BackendJob[]>("/marketplace/jobs"),
    ]).then(([jobResult, jobs]) => {
      setJob(jobResult);
      setSimilarJobs(jobs.filter((item) => item.id !== jobId).slice(0, 3));
    });
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchBackend(`/marketplace/jobs/${jobId}/apply`, {
      method: "POST",
    });
    setApplied(true);
    setShowForm(false);
  };

  if (!job) {
    return (
      <AppShell role={role}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading job details...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f0f0f0] transition-colors">
            <ArrowBack style={{ fontSize: 18 }} />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}>
                    {job.title[0]}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.title}</h1>
                    <p className="text-[#cbd5e1] mt-1">{job.category}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><LocationOn style={{ fontSize: 14 }} />{job.location}</span>
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><AccessTime style={{ fontSize: 14 }} />Posted {formatRelativeDate(job.createdAt)}</span>
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><People style={{ fontSize: 14 }} />Open backend listing</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex-none" style={{ backgroundColor: "#3b1d09", color: "#ff6b00" }}>{job.status}</span>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Pay</p>
                  <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{formatNairaFromKobo(job.payKobo)}</p>
                  <p className="text-xs text-[#94a3b8]">per day</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                  <p className="text-xs text-[#94a3b8]">Duration</p>
                  <p className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{job.durationLabel}</p>
                  <p className="text-xs text-[#94a3b8]">{job.category}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>About this Job</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

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
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        rows={4}
                        placeholder="Tell the employer why you're a great fit for this role..."
                        className="w-full px-3 py-3 text-sm rounded-xl border outline-none resize-none"
                        style={{ borderColor: "#1e1e1e", backgroundColor: "#161616", color: "#f0f0f0" }}
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                      <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                        className="w-4 h-4 rounded" style={{ accentColor: "#ff6b00" }} />
                      <span className="text-sm text-[#cbd5e1]">I confirm I am available for the duration of this job</span>
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
                    <p className="text-sm text-[#cbd5e1] mt-2">This backend job application is now recorded in your profile.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={applicationsHref} className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#ff6b00" }}>
                        View My Applications
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-[#111111] rounded-2xl p-5" style={{ border: "1px solid #1e1e1e", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Similar Listings</h2>
              <div className="space-y-3">
                {similarJobs.map((item) => (
                  <Link key={item.id} href={`${similarBasePath}/${item.id}`} className="block rounded-xl p-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <p className="font-semibold text-[#f0f0f0] text-sm">{item.title}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">{item.location}</p>
                    <p className="text-sm font-bold text-[#ff6b00] mt-2">{formatNairaFromKobo(item.payKobo)}/day</p>
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

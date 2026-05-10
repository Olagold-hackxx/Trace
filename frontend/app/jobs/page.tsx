"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Add, People, CheckCircle, Cancel, AccessTime, Work, ChevronRight } from "@mui/icons-material";

const initialPostedJobs = [
  { id: "p1", title: "Sales Assistant", status: "Active", applicants: 14, hired: 2, pay: "₦8,500/day", posted: "May 8", expires: "May 15", category: "Sales" },
  { id: "p2", title: "Market Supervisor", status: "Active", applicants: 7, hired: 1, pay: "₦12,000/day", posted: "May 9", expires: "May 13", category: "Management" },
  { id: "p3", title: "Delivery Rider", status: "Completed", applicants: 22, hired: 3, pay: "₦6,000/day", posted: "May 1", expires: "May 7", category: "Delivery" },
  { id: "p4", title: "Event Caterer", status: "Draft", applicants: 0, hired: 0, pay: "₦15,000/event", posted: "—", expires: "—", category: "Catering" },
  { id: "p5", title: "Cashier", status: "Closed", applicants: 31, hired: 2, pay: "₦5,500/day", posted: "Apr 20", expires: "Apr 27", category: "Finance" },
  { id: "p6", title: "Store Cleaner", status: "Completed", applicants: 9, hired: 1, pay: "₦3,500/day", posted: "Apr 15", expires: "Apr 17", category: "Cleaning" },
];

const appliedJobs = [
  { id: "a1", title: "Brand Promoter", company: "LagosDrinks Co.", status: "Pending", pay: "₦8,000/day", applied: "May 9", location: "Alimosho" },
  { id: "a2", title: "Office Admin", company: "Trace Partner SME", status: "Accepted", pay: "₦6,500/day", applied: "May 7", location: "Gbagada" },
  { id: "a3", title: "Security Guard", company: "SafeGuard Ltd", status: "Pending", pay: "₦7,000/shift", applied: "May 6", location: "Maryland" },
  { id: "a4", title: "Kitchen Assistant", company: "Eko Buka", status: "Rejected", pay: "₦5,000/day", applied: "May 4", location: "Agege" },
  { id: "a5", title: "Inventory Counter", company: "Wholesale Plus", status: "Accepted", pay: "₦4,000/day", applied: "May 2", location: "Trade Fair" },
  { id: "a6", title: "Store Assistant", company: "Fashion Hub", status: "Pending", pay: "₦4,500/day", applied: "Apr 30", location: "Oshodi" },
  { id: "a7", title: "Sales Rep", company: "Kemi Snacks", status: "Rejected", pay: "₦7,500/day", applied: "Apr 28", location: "Yaba" },
  { id: "a8", title: "Event Helper", company: "Mama Cooks", status: "Accepted", pay: "₦5,000/event", applied: "Apr 25", location: "V.I." },
];

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
  const searchParams = useSearchParams();
  const [postedJobs, setPostedJobs] = useState(initialPostedJobs);
  const [tab, setTab] = useState<"posted" | "applied">("posted");
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", pay: "", duration: "", location: "", desc: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = { borderColor: "#1e1e1e", backgroundColor: "#111111", color: "#f0f0f0" };

  useEffect(() => {
    if (searchParams.get("openPost") === "1") {
      setTab("posted");
      setShowPostForm(true);
    }
  }, [searchParams]);

  const handlePostJob = () => {
    if (!form.title || !form.category || !form.pay || !form.duration || !form.location || !form.desc) {
      setFormError("Fill in the full job form before posting.");
      setFormSuccess(null);
      return;
    }

    const amount = Number(form.pay);
    const postedLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const nextJob = {
      id: `p${Date.now()}`,
      title: form.title,
      status: "Active",
      applicants: 0,
      hired: 0,
      pay: Number.isFinite(amount) && amount > 0 ? `₦${amount.toLocaleString()}/day` : form.pay,
      posted: postedLabel,
      expires: form.duration,
      category: form.category,
    };

    setPostedJobs((current) => [nextJob, ...current]);
    setForm({ title: "", category: "", pay: "", duration: "", location: "", desc: "" });
    setFormError(null);
    setFormSuccess(`${nextJob.title} is now live in your posted jobs.`);
    setShowPostForm(false);
    setTab("posted");
  };

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>My Jobs</h1>
            <p className="text-sm text-[#94a3b8] mt-1">Manage jobs you posted and track your applications</p>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#ff6b00" }}
          >
            <Add style={{ fontSize: 18 }} />
            Post a Job
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
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161616", borderBottom: "1px solid #1e1e1e" }}>
                  {["Job Title", "Category", "Status", "Applicants", "Hired", "Pay", "Posted", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold text-xs text-[#94a3b8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postedJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#161616] transition-colors" style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#3b1d09" }}>
                          <Work style={{ fontSize: 16, color: "#ff6b00" }} />
                        </div>
                        <span className="font-semibold text-[#f0f0f0]">{j.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#cbd5e1]">{j.category}</td>
                    <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-[#cbd5e1]">
                        <People style={{ fontSize: 14 }} />{j.applicants}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#f0f0f0]">{j.hired}</td>
                    <td className="px-5 py-4 font-semibold text-[#f0f0f0]">{j.pay}</td>
                    <td className="px-5 py-4 text-[#94a3b8]">{j.posted}</td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1 text-xs font-semibold transition-colors hover:underline" style={{ color: "#ff6b00" }}>
                        View <ChevronRight style={{ fontSize: 14 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Applied Jobs */}
        {tab === "applied" && (
          <div className="space-y-3">
            {appliedJobs.map((j) => (
              <div key={j.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#ff6b00" }}>
                    {j.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{j.title}</p>
                    <p className="text-sm text-[#cbd5e1]">{j.company} · {j.location}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">Applied {j.applied}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-none">
                  <span className="text-sm font-bold text-[#f0f0f0]">{j.pay}</span>
                  <StatusBadge status={j.status} />
                  {j.status === "Accepted" && (
                    <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#16a34a" }}>
                      View details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Jobs Posted", val: postedJobs.length.toString(), color: "#ff6b00" },
            { label: "Workers Hired", val: "9", color: "#ff6b00" },
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
    </AppShell>
  );
}

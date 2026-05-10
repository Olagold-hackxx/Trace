"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useState } from "react";
import Link from "next/link";
import { Add, People, CheckCircle, Cancel, AccessTime, Work, ChevronRight } from "@mui/icons-material";

const postedJobs = [
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
  Draft: { color: "#8e7164", bg: "#f8ddd2", icon: AccessTime },
  Closed: { color: "#5a4136", bg: "#f8ddd2", icon: Cancel },
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
  const [tab, setTab] = useState<"posted" | "applied">("posted");
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", pay: "", duration: "", location: "", desc: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = { borderColor: "#e2bfb0", backgroundColor: "#fff8f6", color: "#261812" };

  return (
    <AppShell role="user">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>My Jobs</h1>
            <p className="text-sm text-[#8e7164] mt-1">Manage jobs you posted and track your applications</p>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#7c3aed" }}
          >
            <Add style={{ fontSize: 18 }} />
            Post a Job
          </button>
        </div>

        {/* Post job form */}
        {showPostForm && (
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: "1px solid #7c3aed", boxShadow: "0px 4px 20px rgba(124,58,237,0.1)" }}>
            <h2 className="text-lg font-bold text-[#261812] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Post a New Job</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Job Title</label>
                <input type="text" placeholder="e.g. Sales Assistant" value={form.title} onChange={set("title")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Category</label>
                <select value={form.category} onChange={set("category")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle}>
                  <option value="">Select category</option>
                  {["Sales", "Delivery", "Catering", "Cleaning", "Security", "Admin", "Management"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Daily Pay (₦)</label>
                <input type="number" placeholder="8500" value={form.pay} onChange={set("pay")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Duration</label>
                <input type="text" placeholder="e.g. 3 days" value={form.duration} onChange={set("duration")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Location</label>
                <input type="text" placeholder="e.g. Yaba main market" value={form.location} onChange={set("location")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#5a4136] mb-1.5">Job Description</label>
                <textarea rows={3} placeholder="Describe the role, responsibilities, and requirements..." value={form.desc} onChange={set("desc")} className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none" style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#7c3aed" }}>
                Post Job
              </button>
              <button onClick={() => setShowPostForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-[#fff1eb] text-[#261812]" style={{ borderColor: "#e2bfb0" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: "#fff1eb", border: "1px solid #e2bfb0" }}>
          <button onClick={() => setTab("posted")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "posted" ? { backgroundColor: "#7c3aed", color: "#fff" } : { color: "#5a4136" }}>
            Posted Jobs ({postedJobs.length})
          </button>
          <button onClick={() => setTab("applied")} className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={tab === "applied" ? { backgroundColor: "#7c3aed", color: "#fff" } : { color: "#5a4136" }}>
            Applied Jobs ({appliedJobs.length})
          </button>
        </div>

        {/* Posted Jobs */}
        {tab === "posted" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#fff8f6", borderBottom: "1px solid #e2bfb0" }}>
                  {["Job Title", "Category", "Status", "Applicants", "Hired", "Pay", "Posted", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold text-xs text-[#8e7164]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postedJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#fff8f6] transition-colors" style={{ borderBottom: "1px solid #f8ddd2" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ede9fe" }}>
                          <Work style={{ fontSize: 16, color: "#7c3aed" }} />
                        </div>
                        <span className="font-semibold text-[#261812]">{j.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#5a4136]">{j.category}</td>
                    <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-[#5a4136]">
                        <People style={{ fontSize: 14 }} />{j.applicants}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#261812]">{j.hired}</td>
                    <td className="px-5 py-4 font-semibold text-[#261812]">{j.pay}</td>
                    <td className="px-5 py-4 text-[#8e7164]">{j.posted}</td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1 text-xs font-semibold transition-colors hover:underline" style={{ color: "#7c3aed" }}>
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
              <div key={j.id} className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4" style={{ border: "1px solid #e2bfb0", boxShadow: "0px 4px 20px rgba(15,23,42,0.05)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#7c3aed" }}>
                    {j.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#261812]" style={{ fontFamily: "Epilogue, sans-serif" }}>{j.title}</p>
                    <p className="text-sm text-[#5a4136]">{j.company} · {j.location}</p>
                    <p className="text-xs text-[#8e7164] mt-0.5">Applied {j.applied}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-none">
                  <span className="text-sm font-bold text-[#261812]">{j.pay}</span>
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
            { label: "Jobs Posted", val: postedJobs.length.toString(), color: "#7c3aed" },
            { label: "Workers Hired", val: "9", color: "#ff6b00" },
            { label: "Applications Sent", val: appliedJobs.length.toString(), color: "#2563eb" },
            { label: "Accepted", val: appliedJobs.filter(j => j.status === "Accepted").length.toString(), color: "#16a34a" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center" style={{ border: "1px solid #e2bfb0" }}>
              <p className="text-2xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: s.color }}>{s.val}</p>
              <p className="text-xs text-[#8e7164] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

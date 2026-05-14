"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { fetchMerchantSnapshot } from "@/hooks/use-lender-data";
import { fetchBackend, formatDateLabel, formatNairaFromKobo } from "@/lib/backend";
import {
  ArrowBack,
  TrendingUp,
  Wallet,
  Work,
  Business,
  CheckCircle,
  Cancel,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";
import { Spinner } from "@/components/ui/spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}

export default function MerchantCreditFilePage({ params }: { params: Promise<{ merchantId: string }> }) {
  const router = useRouter();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchMerchantSnapshot>> | null>(null);
  const [applications, setApplications] = useState<Array<{ id: string; userId: string; status: string; amountKobo: string; purpose: string }>>([]);
  const [decision, setDecision] = useState<"approve" | "decline" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void params.then(({ merchantId: id }) => setMerchantId(id));
  }, [params]);

  useEffect(() => {
    if (!merchantId) return;
    void Promise.all([
      fetchMerchantSnapshot(merchantId),
      fetchBackend<Array<{ id: string; userId: string; status: string; amountKobo: string; purpose: string }>>("/lender/applications"),
    ]).then(([merchantSnapshot, allApplications]) => {
      setSnapshot(merchantSnapshot);
      setApplications(allApplications.filter((item) => item.userId === merchantId));
    });
  }, [merchantId]);

  const latestApplication = applications[0] ?? null;

  const scoreHistory = useMemo(() => {
    if (!snapshot?.score) return [];
    return [{ month: formatDateLabel(snapshot.score.createdAt).split(" ")[0], score: snapshot.score.score }];
  }, [snapshot?.score]);

  const handleDecision = async (nextDecision: "approve" | "decline") => {
    if (!latestApplication) return;
    await fetchBackend(`/lender/applications/${latestApplication.id}/decision`, {
      method: "POST",
      bodyJson: { decision: nextDecision },
    });
    setDecision(nextDecision);
    setSubmitted(true);
    if (nextDecision === "approve") {
      setTimeout(() => router.push("/lender/approvals"), 1200);
    }
  };

  if (!snapshot) {
    return (
      <AppShell role="lender">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8 text-[#ff6b00]" />
            <p className="text-sm text-[#94a3b8]">Loading merchant profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const merchant = snapshot.profile;
  const score = snapshot.score?.score ?? 0;
  const scoreColor = score >= 700 ? "#16a34a" : score >= 500 ? "#d97706" : "#dc2626";
  const scoreBg = score >= 700 ? "#dcfce7" : score >= 500 ? "#fef3c7" : "#fee2e2";

  return (
    <AppShell role="lender">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/lender/traders" className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-[#f0f0f0] transition-colors">
            <ArrowBack style={{ fontSize: 18 }} />
            Back to Merchants
          </Link>
        </div>

        <div className="bg-[#111111] rounded-2xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6" style={{ border: "1px solid #1e1e1e" }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: "#ff6b00", fontFamily: "Epilogue, sans-serif" }}>
              {(merchant.businessName ?? merchant.fullName)[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{merchant.businessName ?? merchant.fullName}</h1>
              <p className="text-[#cbd5e1] text-sm mt-1">{merchant.fullName} · {merchant.businessType ?? "General trade"}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <LocationOn style={{ fontSize: 14 }} />{merchant.marketName ?? "Lagos"}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <CalendarToday style={{ fontSize: 14 }} />Joined {formatDateLabel(merchant.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">TraceScore</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "Epilogue, sans-serif", color: scoreColor }}>{score || "—"}</p>
              <Badge label={score >= 700 ? "Strong" : score >= 500 ? "Watch" : "Risk"} color={scoreColor} bg={scoreBg} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">Latest request</p>
              <p className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{latestApplication ? formatNairaFromKobo(latestApplication.amountKobo) : "—"}</p>
              <Badge label={latestApplication?.status ?? "No application"} color="#ff6b00" bg="#3b1d09" />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
              <p className="text-xs text-[#94a3b8] mb-1">Transactions</p>
              <p className="text-2xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>{snapshot.transactions.length}</p>
              <Badge label="Live feed" color="#16a34a" bg="#dcfce7" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Score Snapshot</h2>
              <div className="space-y-4">
                {Object.entries(snapshot.score?.subScores ?? {}).map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-[#f0f0f0] capitalize">{label.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-bold text-[#f0f0f0]">{String(value)}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                      <div className="h-full rounded-full" style={{ width: `${Number(value)}%`, backgroundColor: "#ff6b00" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Score History</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 900]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, fontSize: 12, color: "#f0f0f0" }} />
                  <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5} dot={{ fill: "#ff6b00", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-5" style={{ fontFamily: "Epilogue, sans-serif" }}>Recent Transactions</h2>
              <div className="space-y-2">
                {snapshot.transactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ backgroundColor: "#161616" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: transaction.type === "debit" ? "#fee2e2" : "#dcfce7" }}>
                        {transaction.type === "debit"
                          ? <Wallet style={{ fontSize: 16, color: "#dc2626" }} />
                          : <TrendingUp style={{ fontSize: 16, color: "#16a34a" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f0f0f0]">{transaction.senderName ?? transaction.reference}</p>
                        <p className="text-xs text-[#94a3b8]">{formatDateLabel(transaction.occurredAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{ color: transaction.type === "debit" ? "#dc2626" : "#16a34a" }}>
                      {transaction.type === "debit" ? "-" : "+"}{formatNairaFromKobo(transaction.amountKobo)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Business Profile</h2>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Business, label: "Business Type", val: merchant.businessType ?? "General" },
                  { icon: LocationOn, label: "Market", val: merchant.marketName ?? "Lagos" },
                  { icon: Work, label: "Role", val: merchant.role },
                  { icon: CalendarToday, label: "Joined", val: formatDateLabel(merchant.createdAt) },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon style={{ fontSize: 16, color: "#94a3b8", marginTop: 2 }} />
                    <div>
                      <p className="text-[#94a3b8] text-xs">{label}</p>
                      <p className="text-[#f0f0f0] font-medium">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-4" style={{ fontFamily: "Epilogue, sans-serif" }}>Loan History</h2>
              <div className="space-y-3">
                {snapshot.loans.map((loan) => (
                  <div key={loan.id} className="p-4 rounded-xl" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#f0f0f0]">{loan.lenderName}</p>
                      <Badge label={loan.status} color={loan.status === "active" ? "#ff6b00" : "#16a34a"} bg={loan.status === "active" ? "#3b1d09" : "#dcfce7"} />
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1">{formatNairaFromKobo(loan.principalKobo)} · {loan.rateLabel} · {loan.tenorLabel}</p>
                    <p className="text-xs text-[#cbd5e1] mt-2">Repaid: {formatNairaFromKobo(loan.amountRepaidKobo)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] rounded-2xl p-6" style={{ border: "1px solid #1e1e1e" }}>
              <h2 className="text-base font-bold text-[#f0f0f0] mb-1" style={{ fontFamily: "Epilogue, sans-serif" }}>Application Decision</h2>
              <p className="text-xs text-[#94a3b8] mb-4">Latest purpose: {latestApplication?.purpose ?? "No open application"}</p>

              {submitted ? (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: decision === "approve" ? "#dcfce7" : "#fee2e2", border: `1px solid ${decision === "approve" ? "#bbf7d0" : "#fecaca"}` }}>
                  {decision === "approve" ? <CheckCircle style={{ fontSize: 32, color: "#16a34a" }} /> : <Cancel style={{ fontSize: 32, color: "#dc2626" }} />}
                  <p className="text-sm font-bold mt-2" style={{ color: decision === "approve" ? "#16a34a" : "#dc2626" }}>
                    {decision === "approve" ? "Application Approved" : "Application Declined"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => void handleDecision("approve")}
                    disabled={!latestApplication}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#16a34a" }}
                  >
                    <CheckCircle style={{ fontSize: 18 }} />
                    Approve
                  </button>
                  <button
                    onClick={() => void handleDecision("decline")}
                    disabled={!latestApplication}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    <Cancel style={{ fontSize: 18 }} />
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

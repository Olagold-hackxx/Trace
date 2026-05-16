"use client";

import { useEffect, useRef, useState } from "react";
import { BackendFraudAlert, BackendUser, buildBackendUrl, fetchBackend } from "@/lib/backend";
import { Warning, Close, Shield } from "@mui/icons-material";

export function FraudAlertModal() {
  const [alert, setAlert] = useState<BackendFraudAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const streamStarted = useRef(false);

  // On mount: fetch existing open anomalous alerts
  useEffect(() => {
    fetchBackend<BackendFraudAlert[]>("/fraud-alerts")
      .then((data) => {
        if (!Array.isArray(data)) return;
        const open = data.find((a) => a.isAnomalous && a.status === "open");
        if (open) setAlert(open);
      })
      .catch(() => {});
  }, []);

  // SSE: fetch user id then listen for real-time fraud.alert events
  useEffect(() => {
    if (streamStarted.current) return;
    let source: EventSource | null = null;

    fetchBackend<BackendUser>("/users/me")
      .then((user) => {
        if (streamStarted.current) return;
        streamStarted.current = true;

        source = new EventSource(buildBackendUrl(`/stream/user/${user.id}`), {
          withCredentials: true,
        });

        source.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data) as {
              type: string;
              payload: {
                transactionId?: string;
                anomalyScore?: number;
                severity?: string;
                topSignals?: string[];
                fraudPenalty?: number;
              };
              createdAt: string;
            };

            if (parsed.type === "fraud.alert") {
              setAlert({
                id: String(parsed.payload.transactionId ?? Date.now()),
                transactionId: parsed.payload.transactionId,
                userId: user.id,
                anomalyScore: parsed.payload.anomalyScore ?? 0,
                isAnomalous: true,
                topSignals: parsed.payload.topSignals ?? [],
                fraudPenalty: parsed.payload.fraudPenalty ?? 0,
                severity: (parsed.payload.severity ?? "low") as BackendFraudAlert["severity"],
                status: "open",
                createdAt: parsed.createdAt,
              });
              setDismissed(false);
            }
          } catch {
            // ignore malformed events
          }
        };
      })
      .catch(() => {});

    return () => {
      source?.close();
      streamStarted.current = false;
    };
  }, []);

  if (!alert || dismissed) return null;

  const severityConfig = {
    high: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "#ef444440", label: "High Risk" },
    medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "#f59e0b40", label: "Medium Risk" },
    low: { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "#64748b40", label: "Low Risk" },
  };
  const s = severityConfig[alert.severity] ?? severityConfig.low;
  const signals = alert.topSignals.slice(0, 3).map((sig) => sig.replace(/_/g, " "));
  const penaltyPts = Math.round((alert.fraudPenalty ?? 0) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={() => setDismissed(true)}
      />

      {/* Modal */}
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-auto rounded-2xl p-6"
        style={{
          backgroundColor: "#111111",
          border: `1px solid ${s.border}`,
          boxShadow: `0 0 60px ${s.color}20, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Close */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-[#1e1e1e]"
          style={{ color: "#64748b" }}
        >
          <Close style={{ fontSize: 18 }} />
        </button>

        {/* Icon + header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
          >
            <Warning style={{ fontSize: 24, color: s.color }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: s.color }}>
              {s.label} · Fraud Alert
            </p>
            <h2 className="text-xl font-bold text-[#f0f0f0]" style={{ fontFamily: "Epilogue, sans-serif" }}>
              Suspicious Activity Detected
            </h2>
            <p className="text-sm text-[#94a3b8] mt-1">
              An anomalous transaction was flagged on your account.
            </p>
          </div>
        </div>

        {/* Signals */}
        {signals.length > 0 && (
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Signals Detected</p>
            <div className="flex flex-wrap gap-2">
              {signals.map((sig) => (
                <span
                  key={sig}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                >
                  {sig}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Penalty */}
        {penaltyPts > 0 && (
          <div className="rounded-xl p-4 mb-5 flex items-center gap-3" style={{ backgroundColor: "#161616", border: "1px solid #1e1e1e" }}>
            <Shield style={{ fontSize: 20, color: "#f59e0b" }} />
            <p className="text-sm text-[#cbd5e1]">
              A temporary <span className="font-bold text-[#f59e0b]">–{penaltyPts} point</span> penalty has been applied to your TraceScore pending review.
            </p>
          </div>
        )}

        <p className="text-xs text-[#64748b] mb-5">
          This is a soft flag. If this transaction was legitimate, the penalty will be lifted after review. No action is required from you.
        </p>

        {/* CTA */}
        <button
          onClick={() => setDismissed(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#ff6b00" }}
        >
          I Understand
        </button>
      </div>
    </>
  );
}

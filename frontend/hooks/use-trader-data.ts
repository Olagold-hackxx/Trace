"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BackendLoan,
  BackendLoanOffer,
  BackendPaymentLink,
  BackendScoreSnapshot,
  BackendTransaction,
  BackendTransactionsSummary,
  BackendUser,
  BackendVirtualAccount,
  fetchBackend,
  readTraderSession,
} from "@/lib/backend";

interface TraderDataState {
  user: BackendUser | null;
  virtualAccount: BackendVirtualAccount | null;
  score: BackendScoreSnapshot | null;
  scoreHistory: BackendScoreSnapshot[];
  explanation: { score: number; factors: Array<Record<string, unknown>> } | null;
  summary: BackendTransactionsSummary | null;
  transactions: BackendTransaction[];
  defaultPaymentLink: BackendPaymentLink | null;
  paymentLinks: BackendPaymentLink[];
  activeLoan: BackendLoan | null;
  offers: BackendLoanOffer[];
  loading: boolean;
  error: string | null;
}

const initialState: TraderDataState = {
  user: null,
  virtualAccount: null,
  score: null,
  scoreHistory: [],
  explanation: null,
  summary: null,
  transactions: [],
  defaultPaymentLink: null,
  paymentLinks: [],
  activeLoan: null,
  offers: [],
  loading: true,
  error: null,
};

export function useTraderData(enabled = true) {
  const [state, setState] = useState<TraderDataState>(initialState);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState({ ...initialState, loading: false });
      return;
    }

    const stored = readTraderSession();
    setState((current) => ({
      ...current,
      loading: true,
      user: current.user ?? stored?.user ?? null,
      virtualAccount: current.virtualAccount ?? stored?.virtualAccount ?? null,
      error: null,
    }));

    const results = await Promise.allSettled([
      fetchBackend<BackendUser>("/users/me"),
      fetchBackend<BackendVirtualAccount>("/virtual-accounts/me"),
      fetchBackend<BackendScoreSnapshot>("/score"),
      fetchBackend<BackendScoreSnapshot[]>("/score/history"),
      fetchBackend<{ score: number; factors: Array<Record<string, unknown>> }>("/score/explain"),
      fetchBackend<BackendTransactionsSummary>("/transactions/summary"),
      fetchBackend<BackendTransaction[]>("/transactions?limit=8"),
      fetchBackend<BackendPaymentLink>("/payments/links/default"),
      fetchBackend<BackendPaymentLink[]>("/payments/links"),
      fetchBackend<BackendLoan | null>("/loans/active"),
      fetchBackend<BackendLoanOffer[]>("/loans/offers"),
    ]);

    const firstError = results.find((result) => result.status === "rejected");

    setState({
      user: results[0].status === "fulfilled" ? results[0].value : stored?.user ?? null,
      virtualAccount: results[1].status === "fulfilled" ? results[1].value : stored?.virtualAccount ?? null,
      score: results[2].status === "fulfilled" ? results[2].value : null,
      scoreHistory: results[3].status === "fulfilled" ? results[3].value : [],
      explanation: results[4].status === "fulfilled" ? results[4].value : null,
      summary: results[5].status === "fulfilled" ? results[5].value : null,
      transactions: results[6].status === "fulfilled" ? results[6].value : [],
      defaultPaymentLink: results[7].status === "fulfilled" ? results[7].value : null,
      paymentLinks: results[8].status === "fulfilled" ? results[8].value : [],
      activeLoan: results[9].status === "fulfilled" ? results[9].value : null,
      offers: results[10].status === "fulfilled" ? results[10].value : [],
      loading: false,
      error:
        firstError?.status === "rejected" ? firstError.reason instanceof Error ? firstError.reason.message : "Failed to load trader data" : null,
    });
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}

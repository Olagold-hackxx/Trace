"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BackendJob,
  BackendLenderPortfolioSummary,
  BackendLenderWallet,
  BackendLoan,
  BackendLoanApplication,
  BackendScoreSnapshot,
  BackendTransaction,
  BackendUser,
  fetchBackend,
} from "@/lib/backend";

interface LenderDataState {
  user: BackendUser | null;
  summary: BackendLenderPortfolioSummary | null;
  wallet: BackendLenderWallet | null;
  applications: BackendLoanApplication[];
  merchants: BackendUser[];
  jobs: BackendJob[];
  loading: boolean;
}

export function useLenderData() {
  const [state, setState] = useState<LenderDataState>({
    user: null,
    summary: null,
    wallet: null,
    applications: [],
    merchants: [],
    jobs: [],
    loading: true,
  });

  const refresh = useCallback(() => {
    void Promise.all([
      fetchBackend<BackendUser>("/users/me"),
      fetchBackend<BackendLenderPortfolioSummary>("/lender/portfolio/summary"),
      fetchBackend<BackendLenderWallet>("/lender/wallet"),
      fetchBackend<BackendLoanApplication[]>("/lender/applications"),
      fetchBackend<BackendUser[]>("/lender/merchants"),
      fetchBackend<BackendJob[]>("/lender/portfolio/jobs"),
    ]).then(([user, summary, wallet, applications, merchants, jobs]) => {
      setState({ user, summary, wallet, applications, merchants, jobs, loading: false });
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, refresh };
}

export async function fetchMerchantSnapshot(merchantId: string) {
  const [profile, transactions, loans, score] = await Promise.all([
    fetchBackend<BackendUser>(`/lender/merchants/${merchantId}/profile`),
    fetchBackend<BackendTransaction[]>(`/lender/merchants/${merchantId}/transactions`),
    fetchBackend<BackendLoan[]>(`/lender/merchants/${merchantId}/loans`),
    fetchBackend<BackendScoreSnapshot | null>(`/lender/merchants/${merchantId}/score`),
  ]);

  return { profile, transactions, loans, score };
}

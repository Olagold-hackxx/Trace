"use client";

import { useEffect, useState } from "react";
import {
  BackendJob,
  BackendLenderPortfolioSummary,
  BackendLoan,
  BackendLoanApplication,
  BackendScoreSnapshot,
  BackendTransaction,
  BackendUser,
  fetchBackend,
} from "@/lib/backend";

interface LenderDataState {
  summary: BackendLenderPortfolioSummary | null;
  applications: BackendLoanApplication[];
  merchants: BackendUser[];
  jobs: BackendJob[];
  loading: boolean;
}

export function useLenderData() {
  const [state, setState] = useState<LenderDataState>({
    summary: null,
    applications: [],
    merchants: [],
    jobs: [],
    loading: true,
  });

  useEffect(() => {
    void Promise.all([
      fetchBackend<BackendLenderPortfolioSummary>("/lender/portfolio/summary"),
      fetchBackend<BackendLoanApplication[]>("/lender/applications"),
      fetchBackend<BackendUser[]>("/lender/merchants"),
      fetchBackend<BackendJob[]>("/lender/portfolio/jobs"),
    ]).then(([summary, applications, merchants, jobs]) => {
      setState({
        summary,
        applications,
        merchants,
        jobs,
        loading: false,
      });
    });
  }, []);

  return state;
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

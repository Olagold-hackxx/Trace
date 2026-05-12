"use client";

import { useEffect, useState } from "react";
import {
  BackendScoreSnapshot,
  BackendUser,
  BackendVirtualAccount,
  fetchBackend,
  readTraderSession,
} from "@/lib/backend";

interface TraderIdentityState {
  user: BackendUser | null;
  virtualAccount: BackendVirtualAccount | null;
  score: BackendScoreSnapshot | null;
  loading: boolean;
}

export function useTraderIdentity(enabled = true) {
  const [state, setState] = useState<TraderIdentityState>({
    user: null,
    virtualAccount: null,
    score: null,
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ user: null, virtualAccount: null, score: null, loading: false });
      return;
    }

    const stored = readTraderSession();
    if (stored?.user || stored?.virtualAccount) {
      setState((current) => ({
        ...current,
        user: stored.user ?? current.user,
        virtualAccount: stored.virtualAccount ?? current.virtualAccount,
        loading: true,
      }));
    }

    let cancelled = false;

    Promise.allSettled([
      fetchBackend<BackendUser>("/users/me"),
      fetchBackend<BackendVirtualAccount>("/virtual-accounts/me"),
      fetchBackend<BackendScoreSnapshot>("/score"),
    ]).then(([userResult, accountResult, scoreResult]) => {
      if (cancelled) return;

      setState({
        user: userResult.status === "fulfilled" ? userResult.value : stored?.user ?? null,
        virtualAccount:
          accountResult.status === "fulfilled" ? accountResult.value : stored?.virtualAccount ?? null,
        score: scoreResult.status === "fulfilled" ? scoreResult.value : null,
        loading: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

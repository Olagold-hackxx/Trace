"use client";

export const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;
export const BACKEND_BASE_URL = BACKEND_API_BASE_URL;

export const TRADER_SESSION_STORAGE_KEY = "trace.trader.session";
export const AUTH_TOKEN_KEY = "trace.auth.token";

export function storeAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export interface BackendUser {
  id: string;
  phone: string;
  fullName: string;
  businessName?: string;
  businessType?: string;
  marketName?: string;
  language?: string;
  role?: "trader" | "lender" | "admin";
  bvnLast4?: string;
  email?: string;
  lenderVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendVirtualAccount {
  id?: string;
  userId?: string;
  accountNumber: string;
  squadCustomerId?: string;
  bankName?: string;
  status?: string;
}

export interface BackendScoreSnapshot {
  id?: string;
  score: number;
  subScores: Record<string, unknown>;
  factors: Array<Record<string, unknown>>;
  modelVersion?: string;
  createdAt?: string;
}

export interface BackendTransaction {
  id: string;
  reference: string;
  type: string;
  amountKobo: string;
  senderName?: string;
  senderAccount?: string;
  status: string;
  occurredAt: string;
  rawPayload?: Record<string, unknown>;
}

export interface BackendTransactionsSummary {
  totalInflowKobo: number;
  totalOutflowKobo: number;
  balanceKobo: number;
  transactionCount: number;
}

export interface BackendPaymentLink {
  id: string;
  name: string;
  slug: string;
  url: string;
  amountKobo?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendLoanOffer {
  id: string;
  lenderName: string;
  amountKobo: string;
  rateLabel: string;
  tenorLabel: string;
  monthlyRepaymentLabel: string;
  status?: string;
  createdAt?: string;
}

export interface BackendLoan {
  id: string;
  userId: string;
  offerId?: string;
  lenderName: string;
  principalKobo: string;
  amountRepaidKobo: string;
  rateLabel: string;
  tenorLabel: string;
  repaymentMethod: string;
  repaymentPctLabel: string;
  status: string;
  nextDueDate?: string;
  squadPayoutRef?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendJob {
  id: string;
  postedByUserId: string;
  title: string;
  category: string;
  payKobo: string;
  durationLabel: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendJobApplication {
  id: string;
  jobId: string;
  userId: string;
  coverNote?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendLenderPortfolioSummary {
  totalAumKobo: number;
  activeLoans: number;
  totalLoans: number;
  availableCapitalKobo: number;
  deployedKobo: number;
  totalReturnsKobo: number;
}

export interface BackendLenderWallet {
  id: string;
  userId: string;
  availableKobo: string;
  deployedKobo: string;
  totalDepositedKobo: string;
  totalReturnsKobo: string;
  virtualAccountNumber?: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendLenderSettings {
  institutionName: string;
  minScore: number;
  maxAmountKobo: number;
  riskTolerance: string;
}

export interface BackendLoanApplication {
  id: string;
  userId: string;
  amountKobo: string;
  purpose: string;
  tenor: string;
  revenueSource: string;
  proposal: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BackendAdminOverview {
  users: number;
  transactions: number;
  loans: number;
  applications: number;
}

export interface BackendFraudAlert {
  id: string;
  transactionId?: string;
  userId: string;
  traderName?: string;
  anomalyScore: number;
  isAnomalous: boolean;
  topSignals: string[];
  fraudPenalty: number;
  severity: "low" | "medium" | "high";
  status: "open" | "reviewed";
  reviewedAt?: string;
  createdAt: string;
}

export interface BackendDailyForecast {
  date: string;
  predicted_inflow_kobo: number;
  lower_bound_kobo: number;
  upper_bound_kobo: number;
}

export interface BackendForecastResponse {
  user_id: string;
  model_version: string;
  daily: BackendDailyForecast[];
  dip_warning: {
    dip_start_date: string;
    dip_end_date: string;
    severity: string;
    expected_gap_kobo: number;
    suggested_loan_kobo: number;
  } | null;
}

export interface TraderSessionSnapshot {
  user: BackendUser;
  virtualAccount?: BackendVirtualAccount | null;
}

type FetchOptions = RequestInit & {
  bodyJson?: unknown;
};

export async function fetchBackend<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = options;
  const token = getAuthToken();
  const response = await fetch(`${BACKEND_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: bodyJson ? JSON.stringify(bodyJson) : rest.body,
    ...rest,
  });

  if (!response.ok) {
    const isAuthRoute = path.includes("/auth/login") || path.includes("/auth/signup");
    if (response.status === 401 && !isAuthRoute && typeof window !== "undefined") {
      window.localStorage.removeItem(TRADER_SESSION_STORAGE_KEY);
      clearAuthToken();
      window.location.href = "/auth/login";
      throw new Error("Session expired. Redirecting to login.");
    }

    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message =
        typeof errorBody?.message === "string"
          ? errorBody.message
          : Array.isArray(errorBody?.message)
            ? errorBody.message.join(", ")
            : message;
    } catch {
      // Ignore JSON parse failures and keep the HTTP status message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function persistTraderSession(snapshot: TraderSessionSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRADER_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
}

export function readTraderSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(TRADER_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TraderSessionSnapshot;
  } catch {
    return null;
  }
}

export function formatNairaFromKobo(value?: number | string | null) {
  const numeric = typeof value === "string" ? Number(value) : value ?? 0;
  return `₦${Math.round(numeric / 100).toLocaleString()}`;
}

export function formatDateLabel(value?: string | Date) {
  if (!value) return "Just now";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getInitials(name?: string) {
  if (!name) return "TR";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function buildBackendUrl(path: string) {
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

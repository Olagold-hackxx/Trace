import type { Job, JobActivity, JobApplication } from "@/lib/jobs";

export const jobs: Job[] = [
  {
    id: "job_001",
    title: "Sales assistant needed today",
    category: "Sales assistant",
    created_by_name: "Mama Ngozi's Provisions",
    created_by_user_id: "user_trader_001",
    creator_role_context: "trader",
    location: "Mile 12 Market, Lagos",
    state: "Lagos",
    pay_amount_kobo: 800000,
    duration: "1 day",
    status: "open",
    payment_status: "held",
    applicants: 6,
    required_skills: ["Sales", "Customer handling", "Cash handling"],
    description:
      "Need someone to assist with sales and customer management during market rush.",
    created_at: "2025-05-07T09:00:00.000Z",
    updated_at: "2025-05-08T11:00:00.000Z"
  },
  {
    id: "job_002",
    title: "Field agent for shop verification",
    category: "Field verification",
    created_by_name: "BlueRiver Microfinance",
    created_by_user_id: "user_lender_001",
    creator_role_context: "lender",
    location: "Yaba, Lagos",
    state: "Lagos",
    pay_amount_kobo: 1200000,
    duration: "4 hours",
    status: "open",
    payment_status: "pending",
    applicants: 3,
    required_skills: ["Verification", "Smartphone", "Reporting"],
    description:
      "Visit merchant location, confirm business activity, and upload verification notes.",
    created_at: "2025-05-06T10:30:00.000Z",
    updated_at: "2025-05-08T12:10:00.000Z"
  },
  {
    id: "job_003",
    title: "Inventory helper for electronics shop",
    category: "Inventory helper",
    created_by_name: "Chidi's Electronics",
    created_by_user_id: "user_trader_002",
    creator_role_context: "trader",
    location: "Onitsha Main Market",
    state: "Anambra",
    pay_amount_kobo: 1000000,
    duration: "1 day",
    status: "active",
    payment_status: "held",
    applicants: 9,
    required_skills: ["Inventory", "Lifting", "Organization"],
    description: "Assist with stock counting and product arrangement.",
    created_at: "2025-05-05T08:15:00.000Z",
    updated_at: "2025-05-08T14:40:00.000Z"
  }
];

export const applicants: JobApplication[] = [
  {
    id: "app_001",
    job_id: "job_001",
    applicant_user_id: "user_trader_010",
    applicant_name: "Timi Ade",
    applicant_role_context: "trader",
    location: "Ketu, Lagos",
    reliabilityScore: 92,
    message: "I can start today and handle rush-hour customer flow.",
    status: "pending",
    created_at: "2025-05-08T09:15:00.000Z"
  },
  {
    id: "app_002",
    job_id: "job_001",
    applicant_user_id: "user_lender_008",
    applicant_name: "Aisha Bello",
    applicant_role_context: "lender",
    location: "Yaba, Lagos",
    reliabilityScore: 87,
    message: "Available after loan field rounds and familiar with sales reporting.",
    status: "accepted",
    created_at: "2025-05-08T10:15:00.000Z"
  },
  {
    id: "app_003",
    job_id: "job_002",
    applicant_user_id: "user_023",
    applicant_name: "Daniel Okafor",
    applicant_role_context: "user",
    location: "Mile 12, Lagos",
    reliabilityScore: 79,
    message: "Can submit photo proof, geo-tagged notes, and completion summary.",
    status: "pending",
    created_at: "2025-05-08T11:15:00.000Z"
  }
];

export const jobActivities: JobActivity[] = [
  {
    id: "activity_001",
    job_id: "job_001",
    actor_user_id: "user_trader_001",
    action: "job_created",
    note: "Trader created a same-day sales support request.",
    created_at: "2025-05-07T09:00:00.000Z"
  },
  {
    id: "activity_002",
    job_id: "job_001",
    actor_user_id: "user_lender_008",
    action: "application_received",
    note: "Aisha Bello applied with customer handling and cash support experience.",
    created_at: "2025-05-08T10:15:00.000Z"
  },
  {
    id: "activity_003",
    job_id: "job_001",
    actor_user_id: "user_trader_001",
    action: "worker_selected",
    note: "Trader shortlisted the strongest availability and reliability fit.",
    created_at: "2025-05-08T11:40:00.000Z"
  },
  {
    id: "activity_004",
    job_id: "job_001",
    actor_user_id: "user_trader_001",
    action: "payment_prepared",
    note: "Funds moved into held status pending confirmed completion.",
    created_at: "2025-05-08T12:05:00.000Z"
  }
];

export const traderTransactions = [
  {
    id: "txn_001",
    type: "Squad payment",
    counterparty: "Retail customer batch",
    amount: "+NGN 285,000",
    status: "Settled",
    time: "08:24"
  },
  {
    id: "txn_002",
    type: "Inventory supplier",
    counterparty: "Mainland stock house",
    amount: "-NGN 95,000",
    status: "Paid",
    time: "09:02"
  },
  {
    id: "txn_003",
    type: "Job escrow hold",
    counterparty: "Sales helper wallet",
    amount: "-NGN 8,000",
    status: "Held",
    time: "10:20"
  }
];

export const traderPayments = [
  {
    title: "Incoming payment velocity",
    value: "NGN 1.8M",
    note: "7-day captured payment volume"
  },
  {
    title: "Repeat customers",
    value: "64%",
    note: "Signals stable repayment behavior"
  },
  {
    title: "Chargeback rate",
    value: "0.8%",
    note: "Low dispute pressure on score"
  }
];

export const scoreBreakdown = [
  { label: "Payment consistency", value: "36 / 40" },
  { label: "Business activity depth", value: "24 / 25" },
  { label: "Seasonal resilience", value: "18 / 20" },
  { label: "Operational reliability", value: "11 / 15" }
];

export const loans = [
  {
    id: "loan_001",
    title: "Working capital top-up",
    amount: "NGN 450,000",
    rate: "5.5% / month",
    status: "Approved",
    note: "Disbursement linked to verified payment trail."
  },
  {
    id: "loan_002",
    title: "Stock expansion line",
    amount: "NGN 900,000",
    rate: "6.2% / month",
    status: "Under review",
    note: "Awaiting more recent revenue and turnover history."
  }
];

export const merchants = [
  {
    id: "merchant_001",
    name: "Mama Ngozi's Provisions",
    sector: "Groceries",
    location: "Mile 12, Lagos",
    score: 82,
    need: "Restock financing before weekend rush"
  },
  {
    id: "merchant_002",
    name: "Chidi's Electronics",
    sector: "Electronics",
    location: "Onitsha",
    score: 77,
    need: "Inventory helper and short-term float"
  }
];

export const lenderPortfolio = [
  {
    title: "Active merchants",
    value: "128",
    note: "Payment-linked underwriting cohort"
  },
  {
    title: "At-risk accounts",
    value: "7",
    note: "Need follow-up tasks and verification"
  },
  {
    title: "Recovered through jobs",
    value: "NGN 2.3M",
    note: "Field work improved collections and onboarding"
  }
];

export const adminFeed = [
  "New job created by trader",
  "New job created by lender",
  "Applicant applied",
  "Applicant accepted",
  "Payment released"
];

export const demoStory = [
  "Trader receives Squad payment",
  "KudiScore updates",
  "Lender sees trader as loan-ready",
  "Loan is approved",
  "Trader creates a job for sales help",
  "Another user applies",
  "Trader accepts applicant",
  "Job is completed",
  "Payment is released"
];

export function getJob(jobId: string) {
  return jobs.find((job) => job.id === jobId) ?? jobs[0];
}

export function getApplicationsForJob(jobId: string) {
  return applicants.filter((application) => application.job_id === jobId);
}

export function getActivitiesForJob(jobId: string) {
  return jobActivities.filter((activity) => activity.job_id === jobId);
}

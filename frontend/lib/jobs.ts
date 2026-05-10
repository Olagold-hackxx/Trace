export type RoleContext = "trader" | "lender" | "user";

export type JobStatus = "open" | "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "held" | "released";

export type Job = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  state: string;
  pay_amount_kobo: number;
  duration: string;
  required_skills: string[];
  created_by_user_id: string;
  created_by_name: string;
  creator_role_context: Extract<RoleContext, "trader" | "lender">;
  assigned_user_id?: string;
  status: JobStatus;
  payment_status: PaymentStatus;
  applicants: number;
  created_at: string;
  updated_at: string;
};

export type JobApplication = {
  id: string;
  job_id: string;
  applicant_user_id: string;
  applicant_name: string;
  applicant_role_context: RoleContext;
  location: string;
  reliabilityScore: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

export type JobActivity = {
  id: string;
  job_id: string;
  actor_user_id: string;
  action: string;
  note: string;
  created_at: string;
};

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(kobo / 100);
}

export function titleCaseStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

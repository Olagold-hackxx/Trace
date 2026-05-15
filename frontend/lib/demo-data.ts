export interface ScoreFactor {
  label: string;
  score: number;
  weight: string;
  desc: string;
  color: string;
  status: string;
  whatHelped: string;
  nextMove: string;
  direction: "up" | "steady" | "watch";
}

export interface LenderOffer {
  id: string;
  name: string;
  amount: string;
  amountValue: number;
  rate: string;
  tenor: string;
  monthly: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  decisionWindow: string;
  disbursement: string;
  purpose: string;
}

export interface DashboardTransaction {
  id: string;
  date: string;
  desc: string;
  type: "Credit" | "Debit";
  amount: number;
  status: "Success" | "Pending" | "Failed";
}

export interface DashboardJob {
  title: string;
  workers: number;
  status: string;
  pay: string;
  daysLeft: number;
}

export interface LiveDashboardEvent {
  id: string;
  label: string;
  title: string;
  description: string;
  revenueDelta?: number;
  pendingPaymentsDelta?: number;
  scoreDelta?: number;
  balanceDelta?: number;
  preQualifiedAmount?: number;
  transaction?: DashboardTransaction;
}

export const scoreHistory = [
  { month: "Jun", score: 688 },
  { month: "Jul", score: 698 },
  { month: "Aug", score: 704 },
  { month: "Sep", score: 710 },
  { month: "Oct", score: 718 },
  { month: "Nov", score: 725 },
  { month: "Dec", score: 719 },
  { month: "Jan", score: 724 },
  { month: "Feb", score: 728 },
  { month: "Mar", score: 730 },
  { month: "Apr", score: 735 },
  { month: "May", score: 742 },
];

export const scoreFactors: ScoreFactor[] = [
  {
    label: "Payment History",
    score: 90,
    weight: "35%",
    desc: "48 of 48 payments on time. Zero missed or late payments.",
    color: "#ff6b00",
    status: "Excellent",
    whatHelped: "Consistent collections and on-time supplier payments kept this factor near the top band.",
    nextMove: "Keep the next 30 days clean. One missed repayment would hit this factor the fastest.",
    direction: "up",
  },
  {
    label: "Revenue Consistency",
    score: 74,
    weight: "25%",
    desc: "Monthly revenue stable within ±20% range over 12 months.",
    color: "#ff6b00",
    status: "Good",
    whatHelped: "Weekly inflows are regular, and larger catering orders have not created major volatility.",
    nextMove: "Keep at least 4 strong payment weeks in a row to push this into the excellent band.",
    direction: "steady",
  },
  {
    label: "Business Longevity",
    score: 60,
    weight: "20%",
    desc: "27 months active on Trace. Consistent trading pattern.",
    color: "#ff6b00",
    status: "Fair",
    whatHelped: "Your profile shows enough history for lenders to trust that the business is stable.",
    nextMove: "Stay active through the next quarter. Longevity improves slowly but compounds over time.",
    direction: "steady",
  },
  {
    label: "Employment Record",
    score: 45,
    weight: "10%",
    desc: "6 workers hired via Trace marketplace. Room to grow.",
    color: "#ff6b00",
    status: "Building",
    whatHelped: "Posting and completing jobs on Trace has started to build verifiable operating history.",
    nextMove: "Complete 2 more marketplace jobs to show stronger hiring discipline and lift this score.",
    direction: "watch",
  },
  {
    label: "Lender Trust Score",
    score: 82,
    weight: "10%",
    desc: "2 prior loans fully repaid. No defaults. Strong history.",
    color: "#ff6b00",
    status: "Very Good",
    whatHelped: "Previous restock facilities closed cleanly, with no restructuring or delay flags.",
    nextMove: "Taking the next facility and repaying on schedule will likely move you into top-tier trust.",
    direction: "up",
  },
];

export const lenderOffers: LenderOffer[] = [
  {
    id: "firstbank",
    name: "FirstBank",
    amount: "₦500,000",
    amountValue: 500000,
    rate: "16% p.a.",
    tenor: "6 months",
    monthly: "₦90,833",
    badge: "Best Rate",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
    decisionWindow: "Accept within 72 hours",
    disbursement: "Same day after acceptance",
    purpose: "Short-cycle inventory top-up",
  },
  {
    id: "zenith-capital",
    name: "Zenith Capital",
    amount: "₦1,500,000",
    amountValue: 1500000,
    rate: "18% p.a.",
    tenor: "12 months",
    monthly: "₦137,500",
    badge: "Recommended",
    badgeColor: "#ff6b00",
    badgeBg: "#3b1d09",
    decisionWindow: "Accept within 5 days",
    disbursement: "Within 2 hours",
    purpose: "Restock capital for peak demand",
  },
  {
    id: "access-growth",
    name: "Access Growth Fund",
    amount: "₦2,500,000",
    amountValue: 2500000,
    rate: "20% p.a.",
    tenor: "18 months",
    monthly: "₦180,556",
    badge: "Largest",
    badgeColor: "#f59e0b",
    badgeBg: "#3b1d09",
    decisionWindow: "Accept within 7 days",
    disbursement: "Within 24 hours",
    purpose: "Inventory expansion and staffing",
  },
];

export const scoreFaqs = [
  {
    q: "How is my TraceScore calculated?",
    a: "TraceScore is a composite of 5 weighted factors: Payment History (35%), Revenue Consistency (25%), Business Longevity (20%), Employment Record (10%), and Lender Trust (10%). Each factor is scored from 0–100 and weighted to produce your final score out of 850.",
  },
  {
    q: "How often does my score update?",
    a: "Your score updates in real time as new transactions are recorded. Large changes like new payments or completed jobs reflect within minutes. Monthly summaries are recomputed on the 1st of each month.",
  },
  {
    q: "Can lenders see my score without my permission?",
    a: "No. Lenders can only see your score when you apply for a loan through Trace or when you explicitly switch on lender visibility in settings.",
  },
  {
    q: "What can I do to improve my score fast?",
    a: "The fastest wins are: make all payments on time, complete more jobs through Trace, and keep weekly revenue flowing without long gaps.",
  },
];

export const baseTransactions: DashboardTransaction[] = [
  { id: "TRX001", date: "May 10, 2026", desc: "Market sale — Yaba table 4", type: "Credit", amount: 45000, status: "Success" },
  { id: "TRX002", date: "May 10, 2026", desc: "Supplier payment — Okafor Farms", type: "Debit", amount: 28000, status: "Success" },
  { id: "TRX003", date: "May 09, 2026", desc: "Catering — Okeke Wedding", type: "Credit", amount: 120000, status: "Success" },
  { id: "TRX004", date: "May 09, 2026", desc: "Rent — Market stall", type: "Debit", amount: 15000, status: "Success" },
  { id: "TRX005", date: "May 08, 2026", desc: "Bulk food sale", type: "Credit", amount: 67500, status: "Success" },
  { id: "TRX006", date: "May 08, 2026", desc: "Payment link — Ngozi Adeyemi", type: "Credit", amount: 35000, status: "Pending" },
  { id: "TRX007", date: "May 07, 2026", desc: "Staff wages", type: "Debit", amount: 48000, status: "Success" },
  { id: "TRX008", date: "May 07, 2026", desc: "Event catering — UNILAG dept", type: "Credit", amount: 95000, status: "Success" },
];

export const activeJobs: DashboardJob[] = [
  { title: "Sales Assistant", workers: 2, status: "Active", pay: "₦8,500/day", daysLeft: 3 },
  { title: "Market Supervisor", workers: 1, status: "Active", pay: "₦12,000/day", daysLeft: 1 },
  { title: "Delivery Rider", workers: 3, status: "Completed", pay: "₦6,000/day", daysLeft: 0 },
];

export const liveDashboardEvents: LiveDashboardEvent[] = [
  {
    id: "evt-1",
    label: "Incoming payment",
    title: "New customer payment confirmed",
    description: "A WhatsApp payment link collection of ₦38,000 just settled successfully.",
    revenueDelta: 38000,
    pendingPaymentsDelta: -12000,
    balanceDelta: 38000,
    transaction: {
      id: "TRX009",
      date: "May 10, 2026",
      desc: "Trace Pay — WhatsApp order settled",
      type: "Credit",
      amount: 38000,
      status: "Success",
    },
  },
  {
    id: "evt-2",
    label: "Score change",
    title: "TraceScore moved up by 6 points",
    description: "Your stronger revenue consistency pushed your score from 742 to 748.",
    scoreDelta: 6,
    preQualifiedAmount: 3000000,
  },
  {
    id: "evt-3",
    label: "Lender interest",
    title: "New lender offer unlocked",
    description: "Access Growth Fund increased your visible pre-qualified capacity to ₦3,000,000.",
    preQualifiedAmount: 3000000,
  },
];

export const activeLoan = {
  lender: "Zenith Capital",
  facility: "Restock Working Capital",
  amount: "₦1,500,000",
  amountValue: 1500000,
  disbursedOn: "May 12, 2026",
  nextDueDate: "June 12, 2026",
  rate: "18% p.a.",
  tenor: "12 months",
  monthlyRepayment: "₦137,500",
  repaid: "₦412,500",
  repaidValue: 412500,
  remaining: "₦1,237,500",
  remainingValue: 1237500,
  completionPct: 27.5,
  autopayEnabled: true,
};

export function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

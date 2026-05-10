import { titleCaseStatus } from "@/lib/jobs";

type PaymentStatusCardProps = {
  status: "pending" | "held" | "released";
  amount: string;
  role: "trader" | "lender";
};

export function PaymentStatusCard({ status, amount, role }: PaymentStatusCardProps) {
  return (
    <div className={`info-card ${role}`}>
      <div className="stack" style={{ gap: "10px" }}>
        <span className="badge">Payment Status</span>
        <h3>{titleCaseStatus(status)}</h3>
        <p className="subtitle">
          {amount} is tracked inside the job flow so the creator can release payment after
          completion, proof review, and final confirmation.
        </p>
        <div className="button-cluster">
          <button className="button">Release Payment</button>
          <button className="button-secondary">Download Proof</button>
        </div>
      </div>
    </div>
  );
}

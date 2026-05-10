export function LoanCard({
  loan
}: {
  loan: { title: string; amount: string; rate: string; status: string; note: string };
}) {
  return (
    <div className="card">
      <div className="stack" style={{ gap: "12px" }}>
        <span className="badge">{loan.status}</span>
        <h3>{loan.title}</h3>
        <strong>{loan.amount}</strong>
        <p className="subtitle">{loan.rate}</p>
        <p className="subtitle">{loan.note}</p>
      </div>
    </div>
  );
}

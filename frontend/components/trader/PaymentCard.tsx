export function PaymentCard({
  item
}: {
  item: { title: string; value: string; note: string };
}) {
  return (
    <div className="card">
      <div className="stack" style={{ gap: "10px" }}>
        <h3>{item.title}</h3>
        <div className="stat-value">{item.value}</div>
        <p className="subtitle">{item.note}</p>
      </div>
    </div>
  );
}

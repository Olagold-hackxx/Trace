export function ScoreBreakdown({
  items
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="stack" style={{ gap: "12px" }}>
      {items.map((item) => (
        <div key={item.label} className="progress-item">
          <strong>{item.label}</strong>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

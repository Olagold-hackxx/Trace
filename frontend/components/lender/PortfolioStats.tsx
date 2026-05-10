export function PortfolioStats({
  items
}: {
  items: Array<{ title: string; value: string; note: string }>;
}) {
  return (
    <div className="three-col">
      {items.map((item) => (
        <div key={item.title} className="stat-card">
          <div className="stat-label">{item.title}</div>
          <div className="stat-value">{item.value}</div>
          <div className="stat-foot">{item.note}</div>
        </div>
      ))}
    </div>
  );
}

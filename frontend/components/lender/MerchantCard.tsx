export function MerchantCard({
  merchant
}: {
  merchant: { id: string; name: string; sector: string; location: string; score: number; need: string };
}) {
  return (
    <div className="card">
      <div className="stack" style={{ gap: "10px" }}>
        <span className="badge">Score {merchant.score}</span>
        <h3>{merchant.name}</h3>
        <p className="subtitle">
          {merchant.sector} · {merchant.location}
        </p>
        <p className="subtitle">{merchant.need}</p>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  foot: string;
};

export function StatCard({ label, value, foot }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}

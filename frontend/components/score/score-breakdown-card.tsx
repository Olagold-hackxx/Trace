"use client";

const components = [
  { label: "Revenue Consistency", value: 85 },
  { label: "Repayment History", value: 92 },
  { label: "Transaction Volume", value: 78 },
  { label: "Business History", value: 88 },
  { label: "Job Hiring Activity", value: 81 },
  { label: "Worker Satisfaction", value: 86 },
];

export function ScoreBreakdownCard() {
  return (
    <div className="rounded-3xl p-6" style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}>
      <h3 className="text-lg font-black text-[#F0EFE8] mb-6">Score Breakdown</h3>
      <div className="space-y-5">
        {components.map((c) => {
          const color = c.value >= 85 ? "#F5A623" : c.value >= 75 ? "#22C55E" : "#3B82F6";
          return (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#9B99B5]">{c.label}</p>
                <p className="text-sm font-black text-[#F0EFE8]">{c.value}%</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#2A2A40" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${c.value}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

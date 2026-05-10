"use client";

interface ScoreComponent {
  label: string;
  value: number;
  max?: number;
}

const components: ScoreComponent[] = [
  { label: "Revenue Consistency", value: 85, max: 100 },
  { label: "Repayment History", value: 92, max: 100 },
  { label: "Transaction Volume", value: 78, max: 100 },
  { label: "Business History", value: 88, max: 100 },
  { label: "Job Hiring Activity", value: 81, max: 100 },
  { label: "Worker Satisfaction", value: 86, max: 100 },
];

export function ScoreBreakdownCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-navy mb-6">Score Breakdown</h3>

      <div className="space-y-4">
        {components.map((component) => (
          <div key={component.label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-navy">{component.label}</p>
              <p className="text-sm font-semibold text-navy">{component.value}%</p>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${component.value}%`,
                  backgroundColor: component.value >= 80 ? "#10b981" : component.value >= 70 ? "#3b82f6" : "#f59e0b",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

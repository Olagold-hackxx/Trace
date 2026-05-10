"use client";

interface TraceScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export function TraceScoreGauge({ score, maxScore = 850 }: TraceScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;

  const getScoreColor = () => {
    if (score >= 750) return "#10b981";
    if (score >= 700) return "#3b82f6";
    if (score >= 650) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = () => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Very Good";
    if (score >= 650) return "Good";
    return "Fair";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 mb-6">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * (54 * 2 * Math.PI)} ${54 * 2 * Math.PI}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-navy">{score}</p>
          <p className="text-sm text-gray-500">out of {maxScore}</p>
        </div>
      </div>

      <p className="text-xl font-semibold text-navy mb-2">{getScoreLabel()}</p>
      <p className="text-sm text-gray-600 text-center">
        Your credit readiness is strong. Eligible for up to ₦500,000 capital.
      </p>
    </div>
  );
}

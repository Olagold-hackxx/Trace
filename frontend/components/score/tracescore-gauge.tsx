"use client";

interface TraceScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export function TraceScoreGauge({ score, maxScore = 850 }: TraceScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 54 * 2 * Math.PI;
  const strokeDash = (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 750) return "#F5A623";
    if (score >= 700) return "#22C55E";
    if (score >= 650) return "#3B82F6";
    return "#EF4444";
  };

  const getScoreLabel = () => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Very Good";
    if (score >= 650) return "Good";
    return "Fair";
  };

  const color = getScoreColor();

  return (
    <div
      className="rounded-3xl p-8 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#141420", border: "1px solid #2A2A40" }}
    >
      <div className="relative w-52 h-52 mb-6">
        {/* Glow behind */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ backgroundColor: color }} />
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A40" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-5xl font-black text-[#F0EFE8]">{score}</p>
          <p className="text-xs text-[#5C5A78] mt-1">out of {maxScore}</p>
        </div>
      </div>

      <div
        className="px-5 py-2 rounded-full text-sm font-black mb-3"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {getScoreLabel()}
      </div>
      <p className="text-sm text-[#5C5A78] text-center leading-6 max-w-xs">
        Capital ready. Eligible for up to <span className="text-[#F0EFE8] font-bold">₦500,000</span> restock capital.
      </p>
    </div>
  );
}

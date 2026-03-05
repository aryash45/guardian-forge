"use client";

interface HealthGaugeProps {
  healthFactor: number;
  size?: number;
}

function getHFColor(hf: number): string {
  if (hf >= 2.0) return "#22c55e";
  if (hf >= 1.5) return "#eab308";
  if (hf >= 1.2) return "#f97316";
  return "#ef4444";
}

function getHFLabel(hf: number): string {
  if (hf >= 999) return "No Debt";
  if (hf >= 3.0) return "Very Safe";
  if (hf >= 2.0) return "Safe";
  if (hf >= 1.5) return "Moderate";
  if (hf >= 1.2) return "At Risk";
  if (hf >= 1.0) return "Danger";
  return "Liquidatable";
}

export default function HealthGauge({ healthFactor, size = 200 }: HealthGaugeProps) {
  const color = getHFColor(healthFactor);
  const label = getHFLabel(healthFactor);

  // SVG circle math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Clamp HF to 0–5 range for visual fill
  const clampedHF = Math.min(Math.max(healthFactor, 0), 5);
  const fillPercent = (clampedHF / 5) * 100;
  const dashOffset = circumference - (fillPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }} className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#1e2338"
            strokeWidth="8"
          />
          {/* Animated fill circle */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.5s",
              filter: `drop-shadow(0 0 8px ${color}66)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {healthFactor >= 999 ? "∞" : healthFactor.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--text-secondary)] mt-1">
            Health Factor
          </span>
        </div>
      </div>
      {/* Label badge */}
      <span
        className="badge"
        style={{
          background: `${color}1a`,
          color,
          border: `1px solid ${color}33`,
        }}
      >
        {healthFactor < 1.2 && "⚠ "}
        {label}
      </span>
    </div>
  );
}

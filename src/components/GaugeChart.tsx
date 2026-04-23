import { useEffect, useState } from "react";

interface GaugeChartProps {
  score: number; // 0-100
}

export default function GaugeChart({ score }: GaugeChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1200;
    const step = (end - start) / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setAnimatedScore(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  // SVG gauge parameters
  const cx = 150;
  const cy = 150;
  const r = 110;
  const strokeWidth = 18;

  // Arc from 210° to 330° = 300° sweep (semicircle-like gauge)
  const startAngle = 210;
  const endAngle = 330;
  const totalAngle = 300; // degrees

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(from: number, to: number) {
    const s = polarToCartesian(from);
    const e = polarToCartesian(to);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const filledAngle = startAngle + (animatedScore / 100) * totalAngle;

  // Color based on score
  let color = "#ef4444"; // red
  let label = "Low Faithfulness";
  if (animatedScore >= 70) {
    color = "#22c55e";
    label = "High Faithfulness";
  } else if (animatedScore >= 40) {
    color = "#f59e0b";
    label = "Moderate Faithfulness";
  }

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg viewBox="0 0 300 220" className="w-72 h-56 md:w-80 md:h-64">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored filled arc */}
        {animatedScore > 0 && (
          <path
            d={describeArc(startAngle, filledAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        )}

        {/* Tick labels */}
        {ticks.map((t) => {
          const angle = startAngle + (t / 100) * totalAngle;
          const tickR = r + strokeWidth / 2 + 16;
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = cx + tickR * Math.cos(rad);
          const y = cy + tickR * Math.sin(rad);
          return (
            <text
              key={t}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#64748b"
              fontFamily="monospace"
            >
              {t}
            </text>
          );
        })}

        {/* Center score */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="42"
          fontWeight="bold"
          fill={color}
          fontFamily="system-ui, sans-serif"
        >
          {animatedScore}%
        </text>

        {/* Label below score */}
        <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill={color}
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          {label}
        </text>

        <text
          x={cx}
          y={cy + 48}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9.5"
          fill="#64748b"
          fontFamily="system-ui, sans-serif"
        >
          Faithfulness Score
        </text>
      </svg>
    </div>
  );
}

import { Activity } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { HistoryEntry } from "./HistoryTab";

interface ObserverTabProps {
  entries: HistoryEntry[];
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { score: number };
}

const CustomDot = ({ cx = 0, cy = 0, payload }: CustomDotProps) => {
  const score = payload?.score ?? 0;
  const color =
    score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      fill={color}
      fillOpacity={0.8}
      stroke={color}
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
    />
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { score: number; errors: number; index: number; time: string } }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color =
    d.score >= 70 ? "#22c55e" : d.score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs shadow-xl">
      <div className="text-slate-400 mb-1">Query #{d.index}</div>
      <div className="font-bold" style={{ color }}>
        Score: {d.score}%
      </div>
      <div className="text-red-400">Hallucinations: {d.errors}</div>
      <div className="text-slate-500">{d.time}</div>
    </div>
  );
};

export default function ObserverTab({ entries }: ObserverTabProps) {
  const scatterData = entries.map((e, i) => ({
    index: i + 1,
    score: e.result.faithfulnessScore,
    errors: e.result.hallucinations,
    time: e.timestamp.toLocaleTimeString(),
  }));

  // Compute live accuracy metrics
  const totalEntries = entries.length;
  const avgScore =
    totalEntries > 0
      ? Math.round(
          entries.reduce((sum, e) => sum + e.result.faithfulnessScore, 0) /
            totalEntries
        )
      : 0;
  const totalSentences = entries.reduce((sum, e) => sum + e.result.total, 0);
  const totalFactual = entries.reduce((sum, e) => sum + e.result.factual, 0);
  const totalHallucinations = entries.reduce(
    (sum, e) => sum + e.result.hallucinations,
    0
  );

  // Precision = TP / (TP + FP): factual sentences / total sentences
  const precision =
    totalSentences > 0
      ? Math.round((totalFactual / totalSentences) * 100) / 100
      : 0;

  // Recall = TP / (TP + FN): factual / (factual + hallucinations)
  const denomRecall = totalFactual + totalHallucinations;
  const recall =
    denomRecall > 0
      ? Math.round((totalFactual / denomRecall) * 100) / 100
      : 0;

  // F1 = 2 * (P * R) / (P + R)
  const f1 =
    precision + recall > 0
      ? Math.round(((2 * precision * recall) / (precision + recall)) * 100) /
        100
      : 0;

  const highFaithCount = entries.filter(
    (e) => e.result.faithfulnessScore >= 70
  ).length;
  const lowFaithCount = entries.filter(
    (e) => e.result.faithfulnessScore < 40
  ).length;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600 space-y-3">
        <Activity size={36} className="text-slate-700" />
        <p className="text-base font-medium text-slate-500">Observer is watching…</p>
        <p className="text-sm text-slate-600">
          Run analyses to populate the live scatter plot.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* ── Live Accuracy Metrics ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
            Live Accuracy Metrics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Avg Faithfulness", value: `${avgScore}%`, color: avgScore >= 70 ? "text-green-400" : avgScore >= 40 ? "text-yellow-400" : "text-red-400" },
            { label: "F1 Score", value: f1.toFixed(2), color: "text-violet-400" },
            { label: "Precision", value: precision.toFixed(2), color: "text-blue-400" },
            { label: "Recall", value: recall.toFixed(2), color: "text-cyan-400" },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center gap-1"
            >
              <span className={`text-3xl font-black ${m.color}`}>{m.value}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cluster Summary ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{highFaithCount}</div>
          <div className="text-[10px] text-green-500/70 uppercase tracking-widest">High Faith (≥70%)</div>
        </div>
        <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {entries.length - highFaithCount - lowFaithCount}
          </div>
          <div className="text-[10px] text-yellow-500/70 uppercase tracking-widest">Moderate (40–70%)</div>
        </div>
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{lowFaithCount}</div>
          <div className="text-[10px] text-red-500/70 uppercase tracking-widest">Low Faith (&lt;40%)</div>
        </div>
      </div>

      {/* ── Scatter Plot ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
            Live Session Scatter Plot
          </h2>
          <span className="ml-auto text-[10px] text-slate-600">
            {entries.length} point{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="index"
                type="number"
                name="Query #"
                domain={[0, Math.max(scatterData.length + 1, 5)]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                label={{
                  value: "Query Number",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#475569",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="score"
                type="number"
                name="Faithfulness Score"
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                label={{
                  value: "Faithfulness Score (%)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#475569",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Scatter data={scatterData} shape={<CustomDot />}>
                {scatterData.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-5 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" /> High ≥70%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Moderate 40–70%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Low &lt;40%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

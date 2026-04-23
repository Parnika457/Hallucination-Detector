import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, BarChart2, AlertTriangle } from "lucide-react";
import { AnalysisResult } from "../utils/analyzer";

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  result: AnalysisResult;
  claim: string;
  context: string;
}

interface HistoryTabProps {
  entries: HistoryEntry[];
}

export default function HistoryTab({ entries }: HistoryTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600 space-y-3">
        <Clock size={36} className="text-slate-700" />
        <p className="text-base font-medium text-slate-500">No history yet</p>
        <p className="text-sm text-slate-600">Run an analysis to see it logged here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto">
      <div className="grid grid-cols-12 gap-2 px-3 pb-2 border-b border-slate-700/50 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        <div className="col-span-4">Timestamp</div>
        <div className="col-span-3 text-center">Score</div>
        <div className="col-span-3 text-center">Errors</div>
        <div className="col-span-2 text-center">Time</div>
      </div>

      {[...entries].reverse().map((entry) => {
        const isOpen = expanded === entry.id;
        const scoreColor =
          entry.result.faithfulnessScore >= 70
            ? "text-green-400"
            : entry.result.faithfulnessScore >= 40
            ? "text-yellow-400"
            : "text-red-400";

        return (
          <div
            key={entry.id}
            className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full grid grid-cols-12 gap-2 px-3 py-3 items-center hover:bg-slate-700/30 transition-all text-left"
            >
              <div className="col-span-4 flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
                )}
                <div>
                  <div className="text-xs text-slate-300 font-mono">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {entry.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="col-span-3 text-center">
                <div className={`text-lg font-bold ${scoreColor}`}>
                  {entry.result.faithfulnessScore}%
                </div>
                <div className="text-[9px] text-slate-600">Faithfulness</div>
              </div>

              <div className="col-span-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="text-lg font-bold text-red-400">
                    {entry.result.hallucinations}
                  </span>
                </div>
                <div className="text-[9px] text-slate-600">Hallucinations</div>
              </div>

              <div className="col-span-2 text-center">
                <div className="text-xs font-mono text-slate-400">
                  {entry.result.processingTime}ms
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-700/40 px-4 py-3 space-y-3">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1.5">
                    AI Response Checked
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3 text-sm text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                    {entry.result.sentences.map((s, i) => (
                      <span
                        key={i}
                        className={
                          s.label === "hallucination"
                            ? "bg-red-500/20 text-red-300 line-through decoration-red-400 rounded px-0.5"
                            : s.label === "factual"
                            ? "bg-green-500/10 text-green-300 rounded px-0.5"
                            : "text-yellow-200"
                        }
                      >
                        {s.sentence}{" "}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <BarChart2 size={12} className="text-slate-500" />
                    <span className="text-slate-500">Factual: </span>
                    <span className="text-green-400 font-semibold">{entry.result.factual}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Neutral: </span>
                    <span className="text-yellow-400 font-semibold">{entry.result.neutral}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Total Sentences: </span>
                    <span className="text-slate-300 font-semibold">{entry.result.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

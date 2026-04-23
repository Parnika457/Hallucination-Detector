import { useState } from "react";
import { Activity, Clock, BarChart2 } from "lucide-react";
import AnalyzerTab from "./components/AnalyzerTab";
import HistoryTab, { HistoryEntry } from "./components/HistoryTab";
import ObserverTab from "./components/ObserverTab";
import { AnalysisResult } from "./utils/analyzer";

type Tab = "analyzer" | "history" | "observer";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("analyzer");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastProcessingTime, setLastProcessingTime] = useState<number | null>(null);
  const [observerActive] = useState(true);

  const handleResult = (result: AnalysisResult, context: string, claim: string) => {
    setLastProcessingTime(result.processingTime);
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      result,
      claim,
      context,
    };
    setHistory((prev) => [...prev, entry]);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "analyzer", label: "Analyzer", icon: <BarChart2 size={14} /> },
    { id: "history", label: "History", icon: <Clock size={14} /> },
    { id: "observer", label: "Observer", icon: <Activity size={14} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-100 overflow-hidden">
      {/* ──────────── TOP NAV BAR ──────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-700/60 bg-[#0d1117]/95 backdrop-blur z-50">
        {/* Left: Logo + last time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600">
            <span className="text-white font-black text-xs">HC</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-tight">
              Hallucination Calculator
            </div>
            <div className="text-[10px] text-slate-500">NLI-powered AI fact checker</div>
          </div>
          {lastProcessingTime !== null && (
            <div className="ml-2 flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">
                Last: {lastProcessingTime}ms
              </span>
            </div>
          )}
        </div>

        {/* Right: Backend source placeholder */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs text-slate-500">
          View Backend Source Code
          <span className="text-[9px] bg-slate-700 rounded px-1.5 py-0.5 text-slate-400">
            Coming Soon
          </span>
        </div>
      </header>

      {/* ──────────── TAB BAR ──────────── */}
      <div className="flex-shrink-0 flex items-center gap-1 px-5 py-2 border-b border-slate-700/50 bg-[#0d1117]/80">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "history" && history.length > 0 && (
              <span className="ml-1 bg-violet-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {history.length}
              </span>
            )}
            {tab.id === "observer" && observerActive && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ──────────── MAIN CONTENT ──────────── */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "analyzer" && (
          <div className="h-full flex flex-col">
            <AnalyzerTab onResult={handleResult} />
          </div>
        )}
        {activeTab === "history" && (
          <div className="h-full overflow-y-auto">
            <HistoryTab entries={history} />
          </div>
        )}
        {activeTab === "observer" && (
          <div className="h-full overflow-y-auto">
            <ObserverTab entries={history} />
          </div>
        )}
      </main>
    </div>
  );
}

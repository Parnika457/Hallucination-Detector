import { useState, useRef } from "react";
import { Zap, FlaskConical, Activity } from "lucide-react";
import GaugeChart from "./GaugeChart";
import { AnalysisResult } from "../utils/analyzer";
import { haluEvalSamples, HaluEvalSample } from "../data/halueval";

interface AnalyzerTabProps {
  onResult: (result: AnalysisResult, context: string, claim: string) => void;
}

export default function AnalyzerTab({ onResult }: AnalyzerTabProps) {
  const [context, setContext] = useState("");
  const [claim, setClaim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadDemo = () => {
    const sample = haluEvalSamples[Math.floor(Math.random() * haluEvalSamples.length)];
    setContext(sample.context);
    setClaim(sample.claim);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!context.trim() || !claim.trim()) return;
    setIsLoading(true);

    try {
      // 1. Get the API URL from environment variables or fallback to localhost
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // 2. The API Call
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, claim }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();

      // 3. Mapping: Convert Python response to the format your UI expects
      const mappedResult: AnalysisResult = {
        sentences: [], 
        faithfulnessScore: 100 - data.risk, // Converting 'Risk' to 'Faithfulness'
        hallucinations: data.risk > 50 ? 1 : 0,
        factual: data.risk <= 50 ? 1 : 0,
        neutral: 0,
        total: 1,
        processingTime: data.processing_time || 0.5,
      };

      setResult(mappedResult);
      onResult(mappedResult, context, claim);

      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Connection failed. Is the Python backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUTS */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Source Context..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500/60 outline-none h-40"
            />
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Claim to verify..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500/60 outline-none h-32"
            />
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={loadDemo} className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-600 transition-all">
              <FlaskConical size={14} /> Load Demo
            </button>
            <button onClick={handleAnalyze} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-violet-600 rounded-xl text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all">
              {isLoading ? "Analyzing..." : <><Zap size={14} fill="currentColor" /> Run Neural Audit</>}
            </button>
          </div>
        </div>

        {/* OUTPUTS */}
        <div ref={resultsRef}>
          {result ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
              <GaugeChart score={result.faithfulnessScore} />
              <div className="mt-4 text-slate-400 text-sm italic">
                Processed in {result.processingTime.toFixed(2)}s
              </div>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
              <Activity size={32} className="mb-2 opacity-20" />
              <p>Ready for Audit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
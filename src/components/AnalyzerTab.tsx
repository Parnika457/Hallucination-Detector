import { useState, useRef } from "react";
import { Zap, FlaskConical, Eye, EyeOff, AlertTriangle, CheckCircle, Minus } from "lucide-react";
import GaugeChart from "./GaugeChart";
import { analyzeText, AnalysisResult } from "../utils/analyzer";
import { haluEvalSamples, HaluEvalSample } from "../data/halueval";

interface AnalyzerTabProps {
  onResult: (result: AnalysisResult, context: string, claim: string) => void;
}

export default function AnalyzerTab({ onResult }: AnalyzerTabProps) {
  const [context, setContext] = useState("");
  const [claim, setClaim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [demoSample, setDemoSample] = useState<HaluEvalSample | null>(null);
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadDemo = () => {
    const sample = haluEvalSamples[Math.floor(Math.random() * haluEvalSamples.length)];
    setDemoSample(sample);
    setContext(sample.context);
    setClaim(sample.claim);
    setResult(null);
    setShowGroundTruth(false);
  };

  const handleAnalyze = async () => {
    if (!context.trim() || !claim.trim()) return;
    setIsLoading(true);
    try {
      const res = await analyzeText(context, claim);
      setResult(res);
      onResult(res, context, claim);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentenceStyle = (label: string) => {
    switch (label) {
      case "factual":
        return "bg-green-500/10 text-green-300 border-b border-green-500/30";
      case "hallucination":
        return "bg-red-500/15 text-red-300 border-b border-red-500/30 line-through decoration-red-400";
      case "neutral":
        return "bg-yellow-500/10 text-yellow-200 border-b border-yellow-500/20";
      default:
        return "text-slate-300";
    }
  };

  const getLabelBadge = (label: string) => {
    switch (label) {
      case "factual":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-500/20 rounded px-1.5 py-0.5 ml-1 whitespace-nowrap">
            <CheckCircle size={8} /> Factual
          </span>
        );
      case "hallucination":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/20 rounded px-1.5 py-0.5 ml-1 whitespace-nowrap">
            <AlertTriangle size={8} /> Hallucination
          </span>
        );
      case "neutral":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-yellow-400 bg-yellow-500/20 rounded px-1.5 py-0.5 ml-1 whitespace-nowrap">
            <Minus size={8} /> Neutral
          </span>
        );
    }
  };



  return (
    <div className="flex flex-col h-full">
      {/* ===== RESULTS ZONE (top, only when result exists) ===== */}
      {result && (
        <div ref={resultsRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4">
          {/* === GAUGE — CENTERED === */}
          <div className="flex flex-col items-center justify-center w-full">
            <GaugeChart score={result.faithfulnessScore} />
          </div>

          {/* === STATS ROW === */}
          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {/* Hallucinations badge */}
            <div className="flex-shrink-0 bg-red-950/60 border border-red-500/40 rounded-xl px-5 py-3 flex flex-col items-center gap-1 min-w-[140px]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                <span className="text-3xl font-bold text-red-400">{result.hallucinations}</span>
              </div>
              <span className="text-xs text-red-300/70 text-center">Hallucinated Sentences Detected</span>
            </div>

            {/* Factual */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3 flex flex-col items-center gap-1 min-w-[90px]">
              <span className="text-2xl font-bold text-green-400">{result.factual}</span>
              <span className="text-xs text-slate-400">Factual</span>
            </div>

            {/* Neutral */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3 flex flex-col items-center gap-1 min-w-[90px]">
              <span className="text-2xl font-bold text-yellow-400">{result.neutral}</span>
              <span className="text-xs text-slate-400">Neutral</span>
            </div>

            {/* Total */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3 flex flex-col items-center gap-1 min-w-[90px]">
              <span className="text-2xl font-bold text-slate-200">{result.total}</span>
              <span className="text-xs text-slate-400">Total Sent.</span>
            </div>
          </div>

          {/* Ground truth toggle — only if demo was used */}
          {demoSample && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowGroundTruth((v) => !v)}
                className="flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 rounded-lg px-4 py-2 text-sm font-medium transition-all"
              >
                {showGroundTruth ? <EyeOff size={15} /> : <Eye size={15} />}
                {showGroundTruth ? "Hide Ground Truth" : "Show Ground Truth"}
              </button>
            </div>
          )}

          {/* === DUAL VIEW === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* LEFT: Live AI Analysis heatmap */}
            <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-200">Live AI Analysis</span>
                </div>
                <span className="text-xs text-slate-500">Sentence Heatmap</span>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {result.sentences.map((s, i) => (
                  <div key={i} className="group relative">
                    <p className={`text-sm leading-relaxed rounded px-2 py-1 ${getSentenceStyle(s.label)}`}>
                      {s.label === "hallucination" && (
                        <AlertTriangle size={11} className="inline mr-1 text-red-400" />
                      )}
                      {s.sentence}
                      {getLabelBadge(s.label)}
                    </p>
                    <div className="mt-0.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.label === "factual"
                            ? "bg-green-500"
                            : s.label === "hallucination"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.round(s.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-600">
                      Confidence: {Math.round(s.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Reference context OR Ground Truth */}
            <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    {showGroundTruth && demoSample ? "Ground Truth" : "Reference Context"}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {showGroundTruth && demoSample ? "Official Answer" : "Source Material"}
                </span>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                <p className="text-sm leading-relaxed text-slate-300">
                  {showGroundTruth && demoSample ? demoSample.groundTruth : context}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no result */}
      {!result && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 px-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center">
            <Zap size={28} className="text-slate-600" />
          </div>
          <p className="text-base font-medium text-slate-500">No analysis yet</p>
          <p className="text-sm text-slate-600 max-w-xs">
            Paste your context and AI response below, then click <span className="text-violet-400 font-semibold">Analyze</span> to detect hallucinations.
          </p>
        </div>
      )}

      {/* ===== INPUT ZONE (bottom, fixed) ===== */}
      <div className="border-t border-slate-700/60 bg-slate-900/80 backdrop-blur px-4 py-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Context box */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-1">
              Step 1 · Reference Context (The Facts)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste the factual source material here..."
              rows={4}
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
            />
          </div>

          {/* Claim box */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-1">
              Step 2 · AI Response (The Claim)
            </label>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Paste the AI-generated text to verify here..."
              rows={4}
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-600 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={loadDemo}
            className="flex items-center gap-2 bg-slate-700/80 hover:bg-slate-700 border border-slate-600/60 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          >
            <FlaskConical size={15} />
            Demo: Load HaluEval
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !context.trim() || !claim.trim()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/40 disabled:text-violet-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-violet-900/30"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Zap size={15} />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

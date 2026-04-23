export interface SentenceResult {
  sentence: string;
  label: "factual" | "hallucination" | "neutral";
  score: number;
  confidence: number;
}

export interface AnalysisResult {
  sentences: SentenceResult[];
  faithfulnessScore: number;
  hallucinations: number;
  factual: number;
  neutral: number;
  total: number;
  processingTime: number;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function tokenOverlap(a: string, b: string): number {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "may", "might", "must", "can", "could", "of", "in", "on",
    "at", "to", "for", "with", "by", "from", "and", "or", "but", "not",
    "it", "its", "this", "that", "these", "those", "they", "their", "there",
    "he", "she", "his", "her", "we", "our", "you", "your", "i", "my",
    "which", "who", "what", "when", "where", "how", "than", "more", "most",
    "also", "about", "as", "if", "so", "up", "out", "then", "than", "only",
  ]);

  const tokensA = a
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stopWords.has(t));
  const tokensB = b
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stopWords.has(t));

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const intersection = tokensB.filter((t) => setA.has(t));
  return intersection.length / Math.max(tokensA.length, tokensB.length);
}

function detectContradiction(sentence: string, context: string): number {
  const contradictionPhrases = [
    { claim: /only (\w+)/i, weight: 0.4 },
    { claim: /never/i, weight: 0.3 },
    { claim: /always/i, weight: 0.2 },
    { claim: /exclusively/i, weight: 0.35 },
    { claim: /solely/i, weight: 0.35 },
    { claim: /invented/i, weight: 0.2 },
    { claim: /invented the/i, weight: 0.25 },
  ];

  let contradictionScore = 0;
  for (const phrase of contradictionPhrases) {
    if (phrase.claim.test(sentence)) {
      contradictionScore += phrase.weight;
    }
  }

  const numbers = sentence.match(/\b\d[\d,]*\.?\d*\s*(km|miles|years?|billion|million|%|century|centuries)?\b/gi) || [];
  const contextNumbers = context.match(/\b\d[\d,]*\.?\d*\s*(km|miles|years?|billion|million|%|century|centuries)?\b/gi) || [];

  for (const num of numbers) {
    const normalized = num.toLowerCase().replace(/,/g, "");
    const found = contextNumbers.some((cn) => {
      const cnNorm = cn.toLowerCase().replace(/,/g, "");
      return cnNorm === normalized;
    });
    if (!found && contextNumbers.length > 0) {
      contradictionScore += 0.15;
    }
  }

  return Math.min(contradictionScore, 1);
}

export async function analyzeText(
  context: string,
  claim: string
): Promise<AnalysisResult> {
  const start = performance.now();

  await new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.random() * 600)
  );

  const sentences = splitIntoSentences(claim);
  const results: SentenceResult[] = [];

  for (const sentence of sentences) {
    const overlap = tokenOverlap(sentence, context);
    const contradiction = detectContradiction(sentence, context);

    let label: "factual" | "hallucination" | "neutral";
    let score: number;
    let confidence: number;

    const entailmentScore = overlap * (1 - contradiction * 0.8);

    if (entailmentScore >= 0.32) {
      label = "factual";
      score = entailmentScore;
      confidence = 0.7 + entailmentScore * 0.25;
    } else if (contradiction > 0.3 || entailmentScore < 0.12) {
      label = "hallucination";
      score = 1 - entailmentScore;
      confidence = 0.65 + contradiction * 0.3;
    } else {
      label = "neutral";
      score = entailmentScore;
      confidence = 0.55 + overlap * 0.2;
    }

    confidence = Math.min(Math.max(confidence, 0.5), 0.99);

    results.push({ sentence, label, score, confidence });
  }

  const factualCount = results.filter((r) => r.label === "factual").length;
  const hallucinationCount = results.filter(
    (r) => r.label === "hallucination"
  ).length;
  const neutralCount = results.filter((r) => r.label === "neutral").length;
  const faithfulnessScore =
    results.length > 0
      ? Math.round((factualCount / results.length) * 100)
      : 0;

  const processingTime = Math.round(performance.now() - start);

  return {
    sentences: results,
    faithfulnessScore,
    hallucinations: hallucinationCount,
    factual: factualCount,
    neutral: neutralCount,
    total: results.length,
    processingTime,
  };
}

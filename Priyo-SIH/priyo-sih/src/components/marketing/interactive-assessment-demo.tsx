"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal,
} from "lucide-react";

interface QuestionData {
  track: string;
  badgeName: string;
  question: string;
  codeSnippet?: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

const DEMO_QUESTIONS: Record<string, QuestionData> = {
  frontend: {
    track: "Modern Web & Next.js",
    badgeName: "Full-Stack React Engineer",
    question: "In Next.js App Router, what is the default rendering behavior of React Server Components (RSC)?",
    codeSnippet: `// app/dashboard/page.tsx
export default async function Page() {
  const data = await fetchUserData();
  return <Profile data={data} />;
}`,
    options: [
      {
        text: "They execute strictly on the server, stream HTML, and send zero JS bundle to the client for their implementation.",
        correct: true,
        explanation: "Correct! Server Components execute on the server and do not increase the client-side JavaScript bundle.",
      },
      {
        text: "They re-render on the client on every route transition using localStorage.",
        correct: false,
        explanation: "Incorrect. Server components are rendered on the server, not in browser localStorage.",
      },
      {
        text: "They require the 'use client' directive at the top of every file to fetch data.",
        correct: false,
        explanation: "Incorrect. Server Components are the default in App Router and do not need 'use client'.",
      },
    ],
  },
  cloud: {
    track: "Cloud & Distributed Systems",
    badgeName: "Cloud Solutions Architect",
    question: "Which database indexing strategy is most optimal for querying high-cardinality foreign keys with range timestamps?",
    codeSnippet: `CREATE INDEX idx_student_assessments ON assessments (
  student_id,
  completed_at DESC
);`,
    options: [
      {
        text: "Composite B-Tree index ordering high-selectivity equality columns first, followed by range/ordering columns.",
        correct: true,
        explanation: "Correct! Composite B-Tree with equality columns first enables instantaneous index lookups.",
      },
      {
        text: "Hash Index without timestamp ordering, because hash indexes support range lookups.",
        correct: false,
        explanation: "Incorrect. Hash indexes only support direct equality (=) comparisons, not range queries.",
      },
      {
        text: "Full-text GIN index on all integer and timestamp columns.",
        correct: false,
        explanation: "Incorrect. GIN indexes are designed for arrays/JSONB/text search, not primary relational foreign keys.",
      },
    ],
  },
  ai: {
    track: "AI & Data Engineering",
    badgeName: "Applied Machine Learning Specialist",
    question: "When deploying an LLM-based semantic matching pipeline for candidate resumes and job postings, why are normalized cosine embeddings preferred over Euclidean distance?",
    codeSnippet: `cos_sim = dot(A, B) / (norm(A) * norm(B))`,
    options: [
      {
        text: "Cosine similarity measures vector angular direction independent of document length magnitude.",
        correct: true,
        explanation: "Correct! Normalized cosine similarity evaluates semantic alignment regardless of resume length.",
      },
      {
        text: "Euclidean distance is only mathematically valid for two-dimensional matrices.",
        correct: false,
        explanation: "Incorrect. Euclidean distance is valid across any N-dimensional space, but is sensitive to length.",
      },
      {
        text: "Embeddings cannot be processed with GPU tensor arithmetic unless normalized to integers.",
        correct: false,
        explanation: "Incorrect. GPUs natively process floating point vectors (FP16/FP32).",
      },
    ],
  },
};

export function InteractiveAssessmentDemo() {
  const [selectedTrack, setSelectedTrack] = useState<string>("frontend");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const currentData = DEMO_QUESTIONS[selectedTrack];

  const handleSelectTrack = (trackKey: string) => {
    setSelectedTrack(trackKey);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleSelectOption = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const isCorrect = selectedOption !== null && currentData.options[selectedOption].correct;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="rounded-3xl border border-hairline bg-surface-1/80 backdrop-blur-xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="accent" className="text-micro font-bold uppercase tracking-wider">
                  Live Interactive Benchmark
                </Badge>
                <span className="text-micro text-ink-muted flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> 60s Test Simulation
                </span>
              </div>
              <h3 className="text-display-md text-ink font-bold">
                Experience Verified Skill Testing
              </h3>
              <p className="text-body text-ink-muted mt-1">
                Try a sample question from our proctored assessment engine and generate a verified credential preview.
              </p>
            </div>

            {/* Track Selector Buttons */}
            <div className="flex flex-wrap gap-2 bg-surface-2/80 p-1.5 rounded-2xl border border-hairline/60">
              {[
                { key: "frontend", label: "Web & Next.js" },
                { key: "cloud", label: "Cloud & Systems" },
                { key: "ai", label: "AI & Vectors" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleSelectTrack(t.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-body-sm font-medium transition-all cursor-pointer ${
                    selectedTrack === t.key
                      ? "bg-canvas text-ink shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-2xl bg-canvas border border-hairline space-y-4">
            <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
              <span className="text-body-sm font-bold text-ink flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-blue" />
                Track: {currentData.track}
              </span>
              <span className="text-micro text-ink-muted font-mono">ID: #SKILL-Q482</span>
            </div>

            <p className="text-body-lg text-ink font-medium leading-relaxed">
              {currentData.question}
            </p>

            {currentData.codeSnippet && (
              <pre className="p-4 rounded-xl bg-surface-1 border border-hairline font-mono text-body-sm text-ink-muted overflow-x-auto">
                <code>{currentData.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentData.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = "bg-surface-1 border-hairline hover:bg-surface-2 text-ink";

                if (isSelected && !isSubmitted) {
                  optionStyle = "bg-accent-blue/10 border-accent-blue text-ink ring-1 ring-accent-blue/50";
                } else if (isSubmitted) {
                  if (option.correct) {
                    optionStyle = "bg-semantic-success/10 border-semantic-success text-semantic-success font-medium";
                  } else if (isSelected && !option.correct) {
                    optionStyle = "bg-semantic-error/10 border-semantic-error text-semantic-error";
                  } else {
                    optionStyle = "bg-surface-1/40 border-hairline/40 text-ink-muted opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-xl border text-left text-body-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-hairline flex items-center justify-center shrink-0 font-mono text-micro mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit / Reset Actions */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-hairline/60">
              {!isSubmitted ? (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="rounded-pill px-6 bg-primary text-on-primary font-medium"
                  >
                    Submit & Evaluate Answer
                  </Button>
                  {selectedOption === null && (
                    <span className="text-micro text-ink-muted">Select an option above to test</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="rounded-pill px-4 text-body-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try Another
                  </Button>
                  <span className="text-body-sm text-ink-muted">
                    {isCorrect ? "🎉 Exceptional analysis!" : "💡 Good attempt! Real assessments provide full diagnostic insights."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Generated Verified Badge Result Card */}
          {isSubmitted && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-blue/15 via-gradient-violet/10 to-surface-1 border border-accent-blue/40 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-gradient-violet flex items-center justify-center text-white shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-caption uppercase tracking-wider text-accent-blue font-bold">
                        Skill Credential Preview Generated
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                    </div>
                    <h4 className="text-headline text-ink font-bold mt-0.5">
                      {currentData.badgeName}
                    </h4>
                    <p className="text-micro text-ink-muted font-mono mt-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-blue" />
                      SHA-256: 0x9f8b72...e41d · Validated by SkillBridge Engine
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/register?role=student">
                    <Button className="rounded-pill px-6 bg-white text-black font-semibold hover:bg-gray-100 shadow-md">
                      Take Full Assessment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

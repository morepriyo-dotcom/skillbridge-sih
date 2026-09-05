"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitAssessment } from "@/actions/skills";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  options: Array<{ id: string; text: string }>;
  marks: number;
}

interface AssessmentRunnerProps {
  assessmentId: string;
  assessmentTitle: string;
  durationMinutes: number;
  passingScore: number;
  questions: Question[];
}

export function AssessmentRunner({
  assessmentId,
  assessmentTitle,
  durationMinutes,
  passingScore,
  questions,
}: AssessmentRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isPassed, setIsPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const startTimeRef = React.useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const formattedAnswers = Object.entries(selectedAnswers).map(
      ([qid, oid]) => ({
        question_id: qid,
        selected_option_ids: [oid],
      })
    );

    const elapsedSecs = startTimeRef.current > 0
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      : 1;

    try {
      const res = await submitAssessment(
        assessmentId,
        formattedAnswers,
        elapsedSecs
      );

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.data) {
        setScore(res.data.score);
        setIsPassed(res.data.passed);
      }
    } catch (_err) {
      setErrorMsg("Failed to submit assessment. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  }, [
    assessmentId,
    isSubmitted,
    isSubmitting,
    selectedAnswers,
  ]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, handleSubmitTest]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  if (isSubmitted && score !== null) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center p-8 border-hairline">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <div className="w-16 h-16 rounded-full bg-semantic-success/20 flex items-center justify-center text-semantic-success">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-semantic-error/20 flex items-center justify-center text-semantic-error">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>
          <h1 className="text-display-md text-ink font-medium">
            {isPassed ? "Assessment Passed!" : "Assessment Completed"}
          </h1>
          <p className="text-body text-ink-muted mt-2">
            {isPassed
              ? "Congratulations! Your score has qualified you for an automated skill verification badge."
              : "You did not achieve the required threshold this time. Review the recommended learning modules and try again."}
          </p>

          <div className="my-8 p-6 bg-surface-2 rounded-xl inline-block min-w-[200px]">
            <span className="text-micro text-ink-muted uppercase tracking-wider">
              Your Score
            </span>
            <div className="text-display-lg text-ink font-bold mt-1">
              {Math.round(score)}%
            </div>
            <span className="text-micro text-ink-muted">
              Passing threshold: {passingScore}%
            </span>
          </div>

          {isPassed && (
            <div className="mb-6 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-md text-accent-blue flex items-center justify-center gap-2 text-body-sm">
              <ShieldCheck className="w-5 h-5" /> Skill Verified &amp; Added to
              Digital Portfolio
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Link href="/skills">
              <Button variant="secondary" className="rounded-pill">
                Back to Skills
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button className="rounded-pill">
                View Matching Opportunities
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assessment Title */}
      <div>
        <h1 className="text-headline text-ink font-medium">
          {assessmentTitle}
        </h1>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-body-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Top Bar: Progress and Timer */}
      <div className="flex justify-between items-center p-4 bg-surface-1 rounded-xl border border-hairline">
        <div className="flex items-center gap-3">
          <Badge variant="accent">
            Question {currentIdx + 1} of {questions.length}
          </Badge>
          <span className="text-body-sm text-ink-muted">
            {Object.keys(selectedAnswers).length} answered
          </span>
        </div>
        <div className="flex items-center gap-2 text-ink font-mono text-body font-medium bg-surface-2 px-3 py-1.5 rounded-md border border-hairline">
          <Clock className="w-4 h-4 text-accent-blue" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            Points: {currentQ.marks} Marks
          </span>
          <CardTitle className="text-subhead font-normal text-ink leading-relaxed mt-2">
            {currentQ.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-3 mt-4">
          {currentQ.options.map((option) => {
            const isSelected = selectedAnswers[currentQ.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(currentQ.id, option.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "border-accent-blue bg-accent-blue/10 text-ink"
                    : "border-hairline bg-surface-2 text-ink-muted hover:text-ink hover:border-hairline-soft"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 text-micro font-medium ${
                    isSelected
                      ? "border-accent-blue bg-accent-blue text-white"
                      : "border-hairline"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span className="text-body text-ink flex-1">{option.text}</span>
              </button>
            );
          })}
        </CardContent>
        <CardFooter className="px-0 pb-0 pt-6 flex justify-between border-t border-hairline">
          <Button
            variant="secondary"
            className="rounded-pill"
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              className="rounded-pill bg-semantic-success text-white hover:bg-semantic-success/90"
              onClick={handleSubmitTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              className="rounded-pill"
              onClick={() =>
                setCurrentIdx((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

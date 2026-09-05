import React from "react";
import { getAssessmentWithQuestions } from "@/queries/skills";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClipboardCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AssessmentRunner } from "./assessment-runner";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const assessment = await getAssessmentWithQuestions(id);

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <ClipboardCheck className="w-12 h-12 text-ink-muted mx-auto" />
        <h1 className="text-display-md text-ink font-medium">
          Assessment Not Found
        </h1>
        <p className="text-body text-ink-muted">
          This assessment may not be published or the link is invalid.
        </p>
        <Link href="/skills/assessments">
          <Button variant="secondary" className="rounded-pill mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assessments
          </Button>
        </Link>
      </div>
    );
  }

  const questions = (assessment.assessment_questions || []).map(
    (q: any) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options || [],
      marks: q.marks,
    })
  );

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <ClipboardCheck className="w-12 h-12 text-ink-muted mx-auto" />
        <h1 className="text-display-md text-ink font-medium">
          No Questions Available
        </h1>
        <p className="text-body text-ink-muted">
          This assessment doesn&apos;t have any questions yet.
        </p>
        <Link href="/skills/assessments">
          <Button variant="secondary" className="rounded-pill mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assessments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AssessmentRunner
      assessmentId={id}
      assessmentTitle={assessment.title}
      durationMinutes={assessment.duration_minutes}
      passingScore={assessment.passing_score}
      questions={questions}
    />
  );
}

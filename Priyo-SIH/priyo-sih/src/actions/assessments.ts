"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { GeneratedQuestion } from "./ai-assessment";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

export interface PublishAssignmentInput {
  title: string;
  description: string;
  category: string;
  sector: string;
  durationMinutes: number;
  passingScore: number;
  questions: GeneratedQuestion[];
}

/**
 * Publish a new assignment with AI-generated questions so students and faculty can attempt it.
 */
export async function publishAssignment(
  input: PublishAssignmentInput
): Promise<ActionResult<{ id: string; title: string; questionCount: number }>> {
  const title = input.title?.trim();
  if (!title || title.length < 3) {
    return { error: "Please provide a valid assignment title (at least 3 characters)." };
  }

  if (!input.questions || input.questions.length === 0) {
    return { error: "An assignment must contain at least one question." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to publish an assignment." };
  }

  const admin = await createAdminClient();

  const totalMarks = input.questions.reduce((acc, q) => acc + (q.marks || 1), 0);
  const duration = Math.min(Math.max(input.durationMinutes || 30, 5), 180);
  const passing = Math.min(Math.max(input.passingScore || 60, 10), 100);

  // 1. Insert assessment header
  const { data: assessment, error: assessError } = await admin
    .from("assessments")
    .insert({
      title,
      description: input.description?.trim() || "Skill assessment and coursework assignment.",
      category: input.category?.trim() || "Technical",
      sector: input.sector?.trim() || "Ayush",
      duration_minutes: duration,
      passing_score: passing,
      total_marks: totalMarks,
      is_published: true,
      created_by: user.id,
    })
    .select("id, title")
    .single();

  if (assessError || !assessment) {
    return { error: assessError?.message || "Failed to publish assignment." };
  }

  // 2. Insert questions
  const questionRows = input.questions.map((q, idx) => ({
    assessment_id: assessment.id,
    question_text: q.question_text,
    question_type: q.question_type || "mcq",
    options: q.options,
    marks: q.marks || 1,
    difficulty: q.difficulty || "medium",
    sort_order: idx + 1,
  }));

  const { error: questionsError } = await admin
    .from("assessment_questions")
    .insert(questionRows);

  if (questionsError) {
    // Clean up orphan assessment
    await admin.from("assessments").delete().eq("id", assessment.id);
    return { error: questionsError.message || "Failed to save assignment questions." };
  }

  revalidatePath("/skills/assessments");
  revalidatePath("/dashboard");

  return {
    data: {
      id: assessment.id,
      title: assessment.title,
      questionCount: input.questions.length,
    },
  };
}

/**
 * Review a student's assignment submission, record feedback, and select or shortlist the student.
 */
export async function reviewSubmission(
  submissionId: string,
  status: "shortlisted" | "selected" | "rejected" | "reviewed",
  feedback?: string
): Promise<ActionResult<{ id: string; status: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // Get current submission
  const { data: submission, error: fetchErr } = await admin
    .from("assessment_submissions")
    .select("id, answers, skill_breakdown, assessment:assessments(created_by)")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchErr || !submission) {
    return { error: "Submission not found." };
  }

  const { data: reviewerProfile } = await admin
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Store review evaluation metadata inside skill_breakdown / answers
  const existingBreakdown = Array.isArray(submission.skill_breakdown)
    ? submission.skill_breakdown
    : [];

  // Filter out any previous evaluation entry
  const filteredBreakdown = existingBreakdown.filter(
    (item: any) => !item.is_evaluation_meta
  );

  const evaluationEntry = {
    is_evaluation_meta: true,
    selection_status: status,
    feedback: feedback?.trim() || null,
    reviewer_id: user.id,
    reviewer_name: reviewerProfile?.full_name || "Reviewer",
    reviewed_at: new Date().toISOString(),
  };

  filteredBreakdown.push(evaluationEntry);

  const { error: updateErr } = await admin
    .from("assessment_submissions")
    .update({
      skill_breakdown: filteredBreakdown,
    })
    .eq("id", submissionId);

  if (updateErr) {
    return { error: updateErr.message || "Failed to update review status." };
  }

  revalidatePath("/skills/assessments");
  revalidatePath("/recruiter/applicants");
  revalidatePath("/dashboard");

  return { data: { id: submissionId, status } };
}

/**
 * Fetch complete submission details including full question texts, options, and candidate choices.
 */
export async function getSubmissionDetails(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();
  const { data: sub, error: subErr } = await admin
    .from("assessment_submissions")
    .select(`
      id, score, total_marks, passed, time_taken_secs, completed_at, answers, skill_breakdown,
      applicant:profiles!user_id(id, full_name, email, role, avatar_url),
      assessment:assessments!inner(id, title, category, sector, passing_score, total_marks, created_by)
    `)
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr || !sub) {
    return { error: "Submission not found." };
  }

  // Fetch assessment questions to match with answers
  const { data: questions } = await admin
    .from("assessment_questions")
    .select("id, question_text, options, marks, difficulty, sort_order")
    .eq("assessment_id", (sub as any).assessment.id)
    .order("sort_order", { ascending: true });

  const answersList = Array.isArray(sub.answers) ? sub.answers : [];
  const detailedQuestions = (questions || []).map((q: any) => {
    const studentAns = answersList.find((a: any) => a.question_id === q.id);
    return {
      id: q.id,
      question_text: q.question_text,
      marks: q.marks,
      difficulty: q.difficulty,
      options: q.options || [],
      selected_option_ids: studentAns?.selected_option_ids || [],
      is_correct: Boolean(studentAns?.is_correct),
    };
  });

  const breakdown = Array.isArray(sub.skill_breakdown) ? sub.skill_breakdown : [];
  const evaluation = breakdown.find((item: any) => item.is_evaluation_meta) || null;

  return {
    data: {
      ...sub,
      evaluation,
      detailedQuestions,
    },
  };
}


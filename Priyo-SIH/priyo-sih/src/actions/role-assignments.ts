"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { generateAssignmentQuestionsWithAI } from "./ai-assessment";
import { publishAssignment } from "./assessments";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

export interface AssignTaskInput {
  opportunityId: string;
  assessmentId: string;
  isMandatory?: boolean;
}

export interface CreateAndAssignAIInput {
  opportunityId: string;
  customTopic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  questionCount?: number;
  apiKey?: string;
}

/**
 * Assign a screening assessment/task to a specific role / opportunity.
 */
export async function assignTaskToOpportunity(
  input: AssignTaskInput
): Promise<ActionResult<{ opportunityId: string; assessmentId: string }>> {
  if (!input.opportunityId || !input.assessmentId) {
    return { error: "Opportunity ID and Assessment ID are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // 1. Fetch opportunity to verify existence
  const { data: opportunity, error: oppErr } = await admin
    .from("opportunities")
    .select("id, title, type, location")
    .eq("id", input.opportunityId)
    .maybeSingle();

  if (oppErr || !opportunity) {
    return { error: "Opportunity not found." };
  }

  // 2. Fetch assessment details
  const { data: assessment, error: assessErr } = await admin
    .from("assessments")
    .select("id, title, sector, category, duration_minutes, passing_score, total_marks")
    .eq("id", input.assessmentId)
    .maybeSingle();

  if (assessErr || !assessment) {
    return { error: "Assessment not found or not published." };
  }

  // 3. Persist assignment linkage in audit_log
  const isMandatory = input.isMandatory !== undefined ? input.isMandatory : true;
  const payload = {
    opportunity_id: input.opportunityId,
    opportunity_title: opportunity.title,
    assessment_id: assessment.id,
    assessment_title: assessment.title,
    sector: assessment.sector || "General",
    category: assessment.category || "Technical",
    duration_minutes: assessment.duration_minutes || 25,
    passing_score: assessment.passing_score || 60,
    total_marks: assessment.total_marks || 25,
    is_mandatory: isMandatory,
    assigned_at: new Date().toISOString(),
    assigned_by: user.id,
  };

  // Upsert pattern: delete old assignment if any, then insert
  await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "role_assignments")
    .eq("record_id", input.opportunityId);

  const { error: insErr } = await admin.from("audit_log").insert({
    table_name: "role_assignments",
    record_id: input.opportunityId,
    action: "ASSIGN_TASK",
    new_data: payload,
    performed_by: user.id,
  });

  if (insErr) {
    return { error: insErr.message || "Failed to link assessment to role." };
  }

  revalidatePath(`/opportunities/${input.opportunityId}`);
  revalidatePath("/recruiter/assignments");
  revalidatePath("/recruiter/applicants");
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");

  return {
    data: {
      opportunityId: input.opportunityId,
      assessmentId: input.assessmentId,
    },
  };
}

/**
 * Remove an assigned assessment from an opportunity.
 */
export async function unassignTaskFromOpportunity(
  opportunityId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  const { error } = await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "role_assignments")
    .eq("record_id", opportunityId);

  if (error) {
    return { error: error.message || "Failed to unassign task." };
  }

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/recruiter/assignments");
  revalidatePath("/recruiter/applicants");
  revalidatePath("/opportunities");

  return {};
}

/**
 * Generate a role-specific screening task using Google AI and link it to the opportunity in one step.
 */
export async function createAndAssignRoleTaskWithGoogleAI(
  input: CreateAndAssignAIInput
): Promise<ActionResult<{ assessmentId: string; title: string; questionCount: number }>> {
  if (!input.opportunityId) {
    return { error: "Opportunity ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // 1. Fetch opportunity to extract role requirements
  const { data: opp, error: oppErr } = await admin
    .from("opportunities")
    .select("id, title, description, type, target_departments")
    .eq("id", input.opportunityId)
    .maybeSingle();

  if (oppErr || !opp) {
    return { error: "Opportunity not found." };
  }

  const roleTopic =
    input.customTopic?.trim() ||
    `${opp.title} Pre-Interview Screening Competencies`;

  const difficulty = input.difficulty || "intermediate";
  const questionCount = Math.min(Math.max(input.questionCount || 5, 3), 10);

  // 2. Generate questions with Google AI
  const aiResult = await generateAssignmentQuestionsWithAI({
    topic: roleTopic,
    sector: opp.type?.includes("research") || opp.title?.toLowerCase().includes("ayush")
      ? "Ayush"
      : "Information Technology",
    difficulty,
    count: questionCount,
    apiKey: input.apiKey,
  });

  if (aiResult.error || !aiResult.data || aiResult.data.questions.length === 0) {
    return { error: aiResult.error || "Google AI question generation failed." };
  }

  // 3. Publish the assessment
  const publishResult = await publishAssignment({
    title: `${opp.title} - Candidate Screening Task`,
    description: `Pre-requisite screening assessment for applicants of ${opp.title}. Evaluates applied technical proficiency and domain problem-solving.`,
    category: "Recruiter Role Screening",
    sector: "Industry Pre-Screening",
    durationMinutes: 25,
    passingScore: 65,
    questions: aiResult.data.questions,
  });

  if (publishResult.error || !publishResult.data) {
    return { error: publishResult.error || "Failed to publish generated screening task." };
  }

  const createdAssessmentId = publishResult.data.id;

  // 4. Link directly to opportunity
  const assignResult = await assignTaskToOpportunity({
    opportunityId: input.opportunityId,
    assessmentId: createdAssessmentId,
    isMandatory: true,
  });

  if (assignResult.error) {
    return { error: assignResult.error };
  }

  return {
    data: {
      assessmentId: createdAssessmentId,
      title: publishResult.data.title,
      questionCount: publishResult.data.questionCount,
    },
  };
}

/**
 * Server action to fetch candidates with screening task results for an opportunity
 */
export async function fetchRoleCandidatesWithTaskResultsAction(opportunityId: string) {
  const { getRoleCandidatesWithTaskResults } = await import("@/queries/role-assignments");
  return await getRoleCandidatesWithTaskResults(opportunityId);
}

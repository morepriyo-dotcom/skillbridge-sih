"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ProficiencyLevel } from "@/types";

type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Add a skill to the current user's profile.
 * Prevents duplicate skill additions.
 */
export async function addUserSkill(
  skillId: string,
  proficiency: ProficiencyLevel = "beginner"
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Pre-check for duplicate skill
  const { data: existingSkill } = await supabase
    .from("user_skills")
    .select("id, proficiency")
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .maybeSingle();

  if (existingSkill) {
    return {
      error: "This skill has already been added to your profile. You can update its proficiency level instead.",
    };
  }

  const { data, error } = await supabase
    .from("user_skills")
    .insert({
      user_id: user.id,
      skill_id: skillId,
      proficiency,
      verification_source: "self_declared",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "This skill has already been added to your profile." };
    }
    return { error: error.message };
  }

  revalidatePath("/skills");
  return { data };
}

/**
 * Update proficiency level for an existing skill.
 */
export async function updateSkillProficiency(
  userSkillId: string,
  proficiency: ProficiencyLevel
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_skills")
    .update({ proficiency })
    .eq("id", userSkillId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/skills");
  return {};
}

/**
 * Remove a skill from the user's profile.
 */
export async function removeUserSkill(userSkillId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_skills")
    .delete()
    .eq("id", userSkillId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/skills");
  return {};
}

/**
 * Submit an assessment and auto-verify skills that pass threshold.
 * Prevents redundant submissions when assessment is already passed.
 */
export async function submitAssessment(
  assessmentId: string,
  answers: Array<{ question_id: string; selected_option_ids: string[] }>,
  timeTakenSecs: number
): Promise<ActionResult<{ score: number; passed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // RLS deliberately blocks direct submission reads/writes so clients cannot
  // forge credentials. This server action authenticates the caller first and
  // then grades and persists the result with the service role.
  const admin = await createAdminClient();

  // Pre-check if already passed
  const { data: existingSubmission } = await admin
    .from("assessment_submissions")
    .select("id, passed, score")
    .eq("assessment_id", assessmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingSubmission && existingSubmission.passed) {
    return {
      error: `You have already passed this assessment with a score of ${Math.round(
        existingSubmission.score || 0
      )}%. Verified credentials are already assigned to your portfolio.`,
    };
  }

  // Fetch assessment with questions
  const { data: assessment } = await admin
    .from("assessments")
    .select("*, assessment_questions(*)")
    .eq("id", assessmentId)
    .maybeSingle();

  if (!assessment) return { error: "Assessment not found" };

  // Grade the answers
  const questions = assessment.assessment_questions || [];
  let totalScore = 0;
  const totalMarks = assessment.total_marks || 100;
  const skillScores: Record<string, { score: number; maxScore: number }> = {};
  const gradedAnswers = [];

  for (const answer of answers) {
    const question = questions.find(
      (q: { id: string }) => q.id === answer.question_id
    );
    if (!question) continue;

    const correctOptionIds = (
      (question.options as Array<{ id: string; is_correct: boolean }>) || []
    )
      .filter((o) => o.is_correct)
      .map((o) => o.id);

    const isCorrect =
      correctOptionIds.length === answer.selected_option_ids.length &&
      correctOptionIds.every((id) => answer.selected_option_ids.includes(id));

    if (isCorrect) totalScore += question.marks;

    // Track skill-level breakdown
    if (question.related_skill_id) {
      if (!skillScores[question.related_skill_id]) {
        skillScores[question.related_skill_id] = { score: 0, maxScore: 0 };
      }
      skillScores[question.related_skill_id].maxScore += question.marks;
      if (isCorrect)
        skillScores[question.related_skill_id].score += question.marks;
    }

    gradedAnswers.push({
      question_id: answer.question_id,
      selected_option_ids: answer.selected_option_ids,
      is_correct: isCorrect,
    });
  }

  const scorePercentage = (totalScore / totalMarks) * 100;
  const passed = scorePercentage >= assessment.passing_score;

  // Save submission (upsert in case of re-attempt)
  const { error: submitErr } = await admin
    .from("assessment_submissions")
    .upsert(
      {
        assessment_id: assessmentId,
        user_id: user.id,
        score: scorePercentage,
        total_marks: totalMarks,
        passed,
        time_taken_secs: timeTakenSecs,
        answers: gradedAnswers,
        skill_breakdown: Object.entries(skillScores).map(([skillId, s]) => ({
          skill_id: skillId,
          score: s.score,
          max_score: s.maxScore,
        })),
        completed_at: new Date().toISOString(),
      },
      { onConflict: "assessment_id,user_id" }
    );

  if (submitErr) {
    return { error: submitErr.message };
  }

  // Auto-verify skills where score >= 70%
  if (passed) {
    for (const [skillId, scores] of Object.entries(skillScores)) {
      const skillPercent = (scores.score / scores.maxScore) * 100;
      if (skillPercent >= 70) {
        await admin
          .from("user_skills")
          .upsert(
            {
              user_id: user.id,
              skill_id: skillId,
              verified: true,
              verification_source: "assessment",
              proficiency:
                skillPercent >= 90
                  ? "expert"
                  : skillPercent >= 75
                  ? "advanced"
                  : "intermediate",
            },
            { onConflict: "user_id,skill_id" }
          );
      }
    }
  }

  revalidatePath("/skills");
  revalidatePath("/skills/assessments");
  revalidatePath("/portfolio");
  return { data: { score: scorePercentage, passed } };
}

/**
 * Bulk add or upload multiple skills to the current student profile.
 * Resolves skill names against skills_master or creates new entries.
 */
export async function bulkAddUserSkills(
  skills: Array<{ name: string; proficiency?: ProficiencyLevel }>
): Promise<ActionResult<{ count: number }>> {
  if (!skills || skills.length === 0) {
    return { error: "No skills provided." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();

  // 1. Fetch existing skills in skills_master for matching
  const { data: existingTaxonomy } = await admin
    .from("skills_master")
    .select("id, name");

  const taxMap = new Map<string, string>();
  for (const s of existingTaxonomy || []) {
    taxMap.set(s.name.trim().toLowerCase(), s.id);
  }

  let addedCount = 0;

  for (const item of skills) {
    const rawName = item.name.trim();
    if (!rawName) continue;

    const lowerName = rawName.toLowerCase();
    let skillId = taxMap.get(lowerName);

    // If not found in taxonomy, insert it
    if (!skillId) {
      const { data: newSkill, error: newSkillErr } = await admin
        .from("skills_master")
        .insert({
          name: rawName,
          category: "Technical",
          sector: "Industry General",
        })
        .select("id")
        .maybeSingle();

      if (!newSkillErr && newSkill?.id) {
        const createdId: string = newSkill.id;
        skillId = createdId;
        taxMap.set(lowerName, createdId);
      }
    }

    if (skillId) {
      const proficiency = item.proficiency || "intermediate";
      const { error: upsertErr } = await admin.from("user_skills").upsert(
        {
          user_id: user.id,
          skill_id: skillId,
          proficiency,
          verification_source: "self_declared",
        },
        { onConflict: "user_id,skill_id" }
      );

      if (!upsertErr) {
        addedCount++;
      }
    }
  }

  revalidatePath("/skills");
  revalidatePath("/portfolio");
  revalidatePath("/profile");
  return { data: { count: addedCount } };
}

/**
 * Save student's desired role and target industry sector.
 */
export async function saveStudentDesiredRole(
  desiredRole: string,
  desiredSector?: string
): Promise<ActionResult<{ desiredRole: string; desiredSector: string }>> {
  if (!desiredRole.trim()) {
    return { error: "Desired role title is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();
  const cleanRole = desiredRole.trim();
  const cleanSector = desiredSector?.trim() || "Information Technology";

  await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "student_career_goals")
    .eq("record_id", user.id);

  const { error } = await admin.from("audit_log").insert({
    table_name: "student_career_goals",
    record_id: user.id,
    action: "UPDATE_CAREER_GOALS",
    performed_by: user.id,
    new_data: {
      user_id: user.id,
      desired_role: cleanRole,
      desired_sector: cleanSector,
      updated_at: new Date().toISOString(),
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/skills");
  revalidatePath("/profile");
  revalidatePath("/portfolio");

  return { data: { desiredRole: cleanRole, desiredSector: cleanSector } };
}


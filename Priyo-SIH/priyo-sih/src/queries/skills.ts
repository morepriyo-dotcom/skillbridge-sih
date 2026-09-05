import { createAdminClient, createClient } from "@/lib/supabase/server";

/**
 * Get the full skill taxonomy, optionally filtered by category or sector.
 */
export async function getSkillTaxonomy(filters?: {
  category?: string;
  sector?: string;
  search?: string;
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("skills_master")
      .select("id, name, category, sector")
      .order("category")
      .order("name");

    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.sector) query = query.eq("sector", filters.sector);
    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

    const { data, error } = await query;
    if (error) {
      console.error("Error in getSkillTaxonomy:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getSkillTaxonomy:", err);
    return [];
  }
}

/**
 * Get skills for a specific user with skill details joined.
 */
export async function getUserSkills(userId?: string) {
  try {
    const supabase = await createClient();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from("user_skills")
      .select(
        `
        id, proficiency, verified, verification_source, evidence_url, created_at,
        skill:skills_master(id, name, category, sector)
      `
      )
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getUserSkills:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getUserSkills:", err);
    return [];
  }
}

/**
 * Get available assessments (published ones the user hasn't taken yet).
 */
export async function getAvailableAssessments() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Get completed assessment IDs
    const { data: completed } = await supabase
      .from("assessment_submissions")
      .select("assessment_id")
      .eq("user_id", user.id);

    const completedIds = (completed || []).map((c) => c.assessment_id);

    let query = supabase
      .from("assessments")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (completedIds.length > 0) {
      query = query.not("id", "in", `(${completedIds.join(",")})`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error in getAvailableAssessments:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getAvailableAssessments:", err);
    return [];
  }
}

/**
 * Get a single assessment with all its questions (for taking the assessment).
 */
export async function getAssessmentWithQuestions(assessmentId: string) {
  try {
    // Questions include answer keys. Only this server-side function may read
    // them; it removes keys before returning data to the client.
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("assessments")
      .select(
        `
        *,
        assessment_questions(
          id, question_text, question_type, options, marks,
          difficulty, sort_order
        )
      `
      )
      .eq("id", assessmentId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("Error in getAssessmentWithQuestions:", error.message);
      return null;
    }

    // Strip is_correct from options for client-side display
    if (data?.assessment_questions) {
      data.assessment_questions = data.assessment_questions
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((q: { options: Array<{ id: string; text: string; is_correct: boolean }> }) => ({
          ...q,
          options: (q.options || []).map(
            (o: { id: string; text: string; is_correct: boolean }) => ({
              id: o.id,
              text: o.text,
            })
          ),
        }));
    }

    return data;
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getAssessmentWithQuestions:", err);
    return null;
  }
}

/**
 * Get assessment results for the current user.
 */
export async function getMyAssessmentResults() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("assessment_submissions")
      .select(
        `
        id, score, passed, time_taken_secs, completed_at, skill_breakdown,
        assessment:assessments(id, title, category, total_marks, passing_score)
      `
      )
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error in getMyAssessmentResults:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getMyAssessmentResults:", err);
    return [];
  }
}

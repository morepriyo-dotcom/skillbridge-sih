"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { opportunitySchema } from "@/lib/validators/opportunity";
import type { OpportunityInput } from "@/lib/validators/opportunity";
import type { OpportunityStatus } from "@/types";

type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

async function resolveSkillsToUUIDs(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  skillNames: string[]
): Promise<string[]> {
  if (!skillNames || skillNames.length === 0) return [];
  const { data: allSkills } = await admin
    .from("skills_master")
    .select("id, name");

  const skillMap = new Map(
    (allSkills || []).map((s) => [s.name.toLowerCase().trim(), s.id])
  );

  const resolved: string[] = [];
  for (const name of skillNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    if (isUUID(trimmed)) {
      resolved.push(trimmed);
    } else if (skillMap.has(trimmed.toLowerCase())) {
      resolved.push(skillMap.get(trimmed.toLowerCase())!);
    } else {
      // Auto-register in skills_master taxonomy
      const { data: newSkill } = await admin
        .from("skills_master")
        .insert({ name: trimmed })
        .select("id")
        .single();
      if (newSkill?.id) {
        resolved.push(newSkill.id);
        skillMap.set(trimmed.toLowerCase(), newSkill.id);
      }
    }
  }
  return resolved;
}

/**
 * Create a new opportunity (internship, job, FDP, training program, etc.).
 * Allows industry_partner, academician, institution_admin, and super_admin to create.
 * Prevents duplicate active listings by title for the same creator.
 */
export async function createOpportunity(
  input: OpportunityInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in to publish opportunities." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const userRole = profile?.role;

  if (
    !userRole ||
    !["industry_partner", "academician", "institution_admin", "super_admin"].includes(userRole)
  ) {
    return {
      error: "Only verified industry partners, faculty, and institutions can post opportunities.",
    };
  }

  // Redundancy check: avoid duplicate active postings with identical title by the same creator
  const { data: duplicateOpp } = await supabase
    .from("opportunities")
    .select("id")
    .eq("created_by", user.id)
    .eq("title", parsed.data.title)
    .eq("status", "active")
    .maybeSingle();

  if (duplicateOpp) {
    return {
      error:
        "An active opportunity with this exact title already exists in your listings. Please use a distinct title or update the existing posting.",
    };
  }

  const admin = await createAdminClient();

  // Resolve skills to UUIDs in skills_master
  const [resolvedRequired, resolvedPreferred] = await Promise.all([
    resolveSkillsToUUIDs(admin, parsed.data.requiredSkills),
    resolveSkillsToUUIDs(admin, parsed.data.preferredSkills),
  ]);

  // Best-effort lookup for linked industry partner or institution ID
  let industryId: string | null = null;
  let institutionId: string | null = null;
  try {
    if (userRole === "academician" || userRole === "institution_admin") {
      const { data: academician } = await admin
        .from("academician_details")
        .select("institution_id")
        .eq("user_id", user.id)
        .maybeSingle();
      institutionId = academician?.institution_id || null;
    }
  } catch {
    // Non-blocking fallback
  }

  const { data, error } = await admin
    .from("opportunities")
    .insert({
      created_by: user.id,
      industry_id: industryId,
      institution_id: institutionId,
      title: parsed.data.title,
      type: parsed.data.type,
      description: parsed.data.description,
      location: parsed.data.location,
      is_remote: parsed.data.isRemote,
      stipend_min: parsed.data.stipendMin,
      stipend_max: parsed.data.stipendMax,
      duration_months: parsed.data.durationMonths,
      required_skills: resolvedRequired,
      preferred_skills: resolvedPreferred,
      min_cgpa: parsed.data.minCgpa,
      target_degrees: parsed.data.targetDegrees,
      target_departments: parsed.data.targetDepartments,
      openings_count: parsed.data.openingsCount,
      deadline: parsed.data.deadline,
      status: "active" as OpportunityStatus,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  revalidatePath("/recruiter/post-opportunity");
  revalidatePath("/recruiter/applicants");
  return { data };
}

/**
 * Update opportunity status (publish, close, archive).
 */
export async function updateOpportunityStatus(
  opportunityId: string,
  status: OpportunityStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .eq("created_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  return {};
}

/**
 * Increment view count for an opportunity (safe fire-and-forget).
 */
export async function incrementOpportunityViews(
  opportunityId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_views", { opp_id: opportunityId });
  } catch {
    // Fire-and-forget fallback
  }
}

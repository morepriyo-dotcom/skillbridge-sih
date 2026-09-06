"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/validators/opportunity";
import type { ApplicationInput } from "@/lib/validators/opportunity";
import type { ApplicationStatus } from "@/types";
import { z } from "zod";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Apply to an opportunity.
 * Enforces zero-redundancy:
 * 1. Checks if already applied
 * 2. Checks if opportunity is active
 * 3. Checks if deadline has passed
 * 4. Ensures only eligible roles (students/academicians) apply
 */
export async function applyToOpportunity(
  input: ApplicationInput
): Promise<ActionResult<{ id: string; match_score: number }>> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in to submit an application." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !["student", "academician"].includes(profile.role)) {
    return { error: "Only students and academicians can submit applications." };
  }

  // 1. Check if user already applied (pre-check)
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id, status")
    .eq("opportunity_id", parsed.data.opportunityId)
    .eq("applicant_id", user.id)
    .maybeSingle();

  if (existingApp) {
    return {
      error: `You have already applied to this opportunity (Current Status: ${existingApp.status.replace("_", " ")}). Duplicate submissions are not permitted.`,
    };
  }

  // 2. Validate opportunity status and deadline
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id, title, status, deadline")
    .eq("id", parsed.data.opportunityId)
    .maybeSingle();

  if (!opportunity) {
    return { error: "The requested opportunity could not be found." };
  }

  if (opportunity.status !== "active") {
    return { error: "This opportunity is no longer active or accepting new applicants." };
  }

  if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
    return { error: "The deadline for this opportunity has already passed." };
  }

  // 3. Insert application
  const { data, error } = await supabase
    .from("applications")
    .insert({
      opportunity_id: parsed.data.opportunityId,
      applicant_id: user.id,
      cover_letter: parsed.data.coverLetter?.trim() || null,
      resume_url: parsed.data.resumeUrl?.trim() || null,
    })
    .select("id, match_score")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already applied to this opportunity." };
    }
    return { error: error.message };
  }

  revalidatePath("/applications");
  revalidatePath(`/opportunities/${parsed.data.opportunityId}`);
  return { data };
}

/**
 * Update application status (for recruiters/admins).
 * Records the status change in status_history and assigns reviewer_id.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  feedback?: string
): Promise<ActionResult> {
  const statusResult = z.enum([
    "applied", "under_review", "shortlisted", "assessment",
    "interview_scheduled", "offered", "rejected", "hired", "completed",
  ]).safeParse(newStatus);
  if (!statusResult.success) return { error: "Invalid application status." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized. Please sign in." };

  const admin = await createAdminClient();

  // Get current application and its opportunity to verify recruiter authorization
  const { data: current, error: fetchErr } = await admin
    .from("applications")
    .select(`
      id, status_history, opportunity_id,
      opportunity:opportunities(id, created_by, industry_id)
    `)
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchErr || !current) {
    return { error: fetchErr?.message || "Application not found" };
  }

  // Verify that the user has permission to manage applicants for this opportunity
  const { data: userProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const opp = Array.isArray(current.opportunity) ? current.opportunity[0] : current.opportunity;
  const isCreator = opp?.created_by === user.id;
  const isPrivilegedRole = ["industry_partner", "institution_admin", "super_admin"].includes(userProfile?.role || "");

  if (!isCreator && !isPrivilegedRole) {
    return { error: "You are not authorized to update applications for this opportunity." };
  }

  const history = Array.isArray(current.status_history)
    ? current.status_history
    : [];

  history.push({
    status: statusResult.data,
    changed_at: new Date().toISOString(),
    changed_by: user.id,
  });

  const updateData: Record<string, unknown> = {
    status: newStatus,
    status_history: history,
    reviewer_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (feedback) updateData.feedback = feedback.trim();

  const { error } = await admin
    .from("applications")
    .update(updateData)
    .eq("id", applicationId);

  if (error) return { error: error.message };

  revalidatePath("/applications");
  revalidatePath(`/opportunities/${current.opportunity_id}`);
  revalidatePath("/recruiter/applicants");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Withdraw an application (for applicants).
 */
export async function withdrawApplication(
  applicationId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/applications");
  return {};
}

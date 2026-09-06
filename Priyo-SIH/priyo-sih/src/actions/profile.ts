"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Update the current user's core profile.
 */
export async function updateProfile(input: {
  fullName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.fullName) updateData.full_name = input.fullName;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.avatarUrl) updateData.avatar_url = input.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Update student-specific details and career goals (desired role & sector).
 */
export async function updateStudentDetails(input: {
  department?: string;
  degree?: string;
  graduationYear?: number;
  cgpa?: number;
  rollNumber?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  institutionId?: string;
  desiredRole?: string;
  desiredSector?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();

  // 1. Upsert into student_details
  const { error: studentErr } = await admin.from("student_details").upsert(
    {
      user_id: user.id,
      department: input.department || "",
      degree: input.degree || "",
      graduation_year: input.graduationYear || new Date().getFullYear(),
      cgpa: input.cgpa || null,
      roll_number: input.rollNumber || null,
      resume_url: input.resumeUrl || null,
      linkedin_url: input.linkedinUrl || null,
      github_url: input.githubUrl || null,
      institution_id: input.institutionId || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (studentErr) return { error: studentErr.message };

  // 2. Persist career goals (desired role & sector) in career goals registry
  if (input.desiredRole !== undefined || input.desiredSector !== undefined) {
    const goalsPayload = {
      user_id: user.id,
      desired_role: input.desiredRole?.trim() || "Full Stack Software Developer",
      desired_sector: input.desiredSector?.trim() || "Information Technology",
      updated_at: new Date().toISOString(),
    };

    // Remove existing and insert fresh
    await admin
      .from("audit_log")
      .delete()
      .eq("table_name", "student_career_goals")
      .eq("record_id", user.id);

    await admin.from("audit_log").insert({
      table_name: "student_career_goals",
      record_id: user.id,
      action: "UPDATE_CAREER_GOALS",
      performed_by: user.id,
      new_data: goalsPayload,
    });
  }

  revalidatePath("/profile");
  revalidatePath("/skills");
  revalidatePath("/portfolio");
  return {};
}

/**
 * Update academician-specific details.
 */
export async function updateAcademicianDetails(input: {
  department?: string;
  designation?: string;
  areasOfExpertise?: string[];
  researchInterests?: string[];
  googleScholarUrl?: string;
  openForConsultancy?: boolean;
  institutionId?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();

  const { error } = await admin.from("academician_details").upsert(
    {
      user_id: user.id,
      department: input.department || "",
      designation: input.designation || "",
      areas_of_expertise: input.areasOfExpertise || [],
      research_interests: input.researchInterests || [],
      google_scholar_url: input.googleScholarUrl || null,
      open_for_consultancy: input.openForConsultancy ?? true,
      institution_id: input.institutionId || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Update Industry Partner (Recruiter) company profile details.
 */
export async function updateIndustryPartnerDetails(input: {
  companyName: string;
  industrySector?: string;
  registrationNo?: string;
  website?: string;
  headquarters?: string;
  description?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();

  const partnerPayload = {
    user_id: user.id,
    company_name: input.companyName.trim(),
    industry_sector: input.industrySector?.trim() || "Technology",
    registration_no: input.registrationNo?.trim() || "",
    website: input.website?.trim() || "",
    headquarters: input.headquarters?.trim() || "",
    description: input.description?.trim() || "",
    updated_at: new Date().toISOString(),
  };

  await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "industry_partner_details")
    .eq("record_id", user.id);

  const { error } = await admin.from("audit_log").insert({
    table_name: "industry_partner_details",
    record_id: user.id,
    action: "UPDATE_PARTNER_PROFILE",
    performed_by: user.id,
    new_data: partnerPayload,
  });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Update Institution Admin organization details.
 */
export async function updateInstitutionAdminDetails(input: {
  institutionName: string;
  code?: string;
  type?: string;
  state?: string;
  city?: string;
  website?: string;
  accreditationStatus?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const admin = await createAdminClient();

  const institutionPayload = {
    user_id: user.id,
    institution_name: input.institutionName.trim(),
    code: input.code?.trim() || "",
    type: input.type?.trim() || "Autonomous University",
    state: input.state?.trim() || "",
    city: input.city?.trim() || "",
    website: input.website?.trim() || "",
    accreditation_status: input.accreditationStatus?.trim() || "NAAC A++",
    updated_at: new Date().toISOString(),
  };

  await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "institution_admin_details")
    .eq("record_id", user.id);

  const { error } = await admin.from("audit_log").insert({
    table_name: "institution_admin_details",
    record_id: user.id,
    action: "UPDATE_INSTITUTION_PROFILE",
    performed_by: user.id,
    new_data: institutionPayload,
  });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {};
}

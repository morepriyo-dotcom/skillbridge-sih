"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Update the current user's profile.
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
  return {};
}

/**
 * Update student-specific details.
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
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("student_details").upsert(
    {
      user_id: user.id,
      department: input.department || "",
      degree: input.degree || "",
      graduation_year: input.graduationYear || new Date().getFullYear(),
      cgpa: input.cgpa,
      roll_number: input.rollNumber,
      resume_url: input.resumeUrl,
      linkedin_url: input.linkedinUrl,
      github_url: input.githubUrl,
      institution_id: input.institutionId,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/profile");
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

  const { error } = await supabase.from("academician_details").upsert(
    {
      user_id: user.id,
      department: input.department || "",
      designation: input.designation || "",
      areas_of_expertise: input.areasOfExpertise || [],
      research_interests: input.researchInterests || [],
      google_scholar_url: input.googleScholarUrl,
      open_for_consultancy: input.openForConsultancy ?? true,
      institution_id: input.institutionId,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return {};
}

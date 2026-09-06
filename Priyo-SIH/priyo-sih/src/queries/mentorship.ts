import { createAdminClient, getCachedUser, getCachedProfile } from "@/lib/supabase/server";

/**
 * Get mentorship sessions for the current user (as mentor or mentee).
 */
export async function getMyMentorshipSessions() {
  const user = await getCachedUser();
  if (!user) return [];

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("mentorship_sessions")
    .select(
      `
      id, mentor_id, mentee_id, topic, scheduled_at, duration_minutes, status,
      meeting_link, notes, rating, created_at,
      mentor:profiles!mentor_id(id, full_name, email, avatar_url, role),
      mentee:profiles!mentee_id(id, full_name, email, avatar_url, role)
    `
    )
    .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
    .order("scheduled_at", { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * Get available mentors — academicians who are open for consultancy.
 */
export async function getAvailableMentors() {
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("academician_details")
    .select(
      `
      id, user_id, department, designation, areas_of_expertise,
      research_interests, open_for_consultancy,
      user:profiles!user_id(id, full_name, email, avatar_url, role),
      institution:institutions(name)
    `
    )
    .eq("open_for_consultancy", true);

  if (error) return [];
  return data || [];
}

/**
 * Get registered students list for guidance scheduling.
 */
export async function getStudentsList() {
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("role", "student")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) return [];
  return data || [];
}

/**
 * Get current user profile and academician consultancy status.
 */
export async function getCurrentMentorshipProfile() {
  const profile = await getCachedProfile();
  if (!profile) return null;

  const admin = await createAdminClient();
  const { data: academicianDetails } = await admin
    .from("academician_details")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  return {
    user: profile,
    academicianDetails: academicianDetails || null,
  };
}

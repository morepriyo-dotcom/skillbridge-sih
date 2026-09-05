import { createClient } from "@/lib/supabase/server";

/**
 * Get mentorship sessions for the current user (as mentor or mentee).
 * Also returns available mentors (academicians open for consultancy).
 */
export async function getMyMentorshipSessions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("mentorship_sessions")
    .select(
      `
      id, topic, scheduled_at, duration_minutes, status,
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("academician_details")
    .select(
      `
      id, department, designation, areas_of_expertise,
      research_interests, open_for_consultancy,
      user:profiles!user_id(id, full_name, email, avatar_url),
      institution:institutions(name)
    `
    )
    .eq("open_for_consultancy", true);

  if (error) return [];
  return data || [];
}

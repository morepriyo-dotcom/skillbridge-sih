import { createClient } from "@/lib/supabase/server";

/**
 * Get collaborations visible to the current user.
 */
export async function getMyCollaborations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("collaborations")
    .select(
      `
      id, title, description, category, domain, status,
      start_date, end_date, created_at,
      proposer:profiles!proposed_by(full_name, role),
      industry:industry_partners(company_name),
      institution:institutions(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * Get collaboration statistics for the current user.
 */
export async function getCollaborationStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { active: 0, proposed: 0, completed: 0, total: 0 };

  const { data } = await supabase
    .from("collaborations")
    .select("status");

  const all = data || [];
  return {
    active: all.filter((c) => c.status === "in_progress" || c.status === "approved").length,
    proposed: all.filter((c) => c.status === "proposed").length,
    completed: all.filter((c) => c.status === "completed").length,
    total: all.length,
  };
}

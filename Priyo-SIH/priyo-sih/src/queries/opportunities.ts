import { createClient, getCachedUser } from "@/lib/supabase/server";
import type { OpportunityFilters } from "@/types";

async function resolveSkillUUIDsToNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opps: any[]
) {
  if (!opps || opps.length === 0) return opps;
  const allSkillIds = new Set<string>();
  for (const opp of opps) {
    (opp.required_skills || []).forEach((s: string) => allSkillIds.add(s));
    (opp.preferred_skills || []).forEach((s: string) => allSkillIds.add(s));
  }
  if (allSkillIds.size === 0) return opps;

  const { data: skills } = await supabase
    .from("skills_master")
    .select("id, name")
    .in("id", Array.from(allSkillIds));

  const nameMap = new Map((skills || []).map((s) => [s.id, s.name]));

  return opps.map((opp) => ({
    ...opp,
    required_skills: (opp.required_skills || []).map(
      (s: string) => nameMap.get(s) || s
    ),
    preferred_skills: (opp.preferred_skills || []).map(
      (s: string) => nameMap.get(s) || s
    ),
  }));
}

/**
 * Get active opportunities with filtering and pagination.
 * Returns empty array gracefully on errors.
 */
export async function getActiveOpportunities(filters: OpportunityFilters) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("opportunities")
      .select(
        `
        id, title, type, description, location, is_remote,
        stipend_min, stipend_max, currency, duration_months,
        deadline, openings_count, views_count, created_at,
        required_skills, preferred_skills, min_cgpa,
        target_degrees, target_departments,
        industry:industry_partners(
          company_name, logo_url, industry_sector
        )
      `,
        { count: "exact" }
      )
      .eq("status", "active")
      .gte("deadline", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.type) query = query.eq("type", filters.type);
    if (filters.isRemote) query = query.eq("is_remote", true);
    if (filters.location) query = query.ilike("location", `%${filters.location}%`);
    if (filters.search) query = query.ilike("title", `%${filters.search}%`);
    if (filters.minStipend) query = query.gte("stipend_min", filters.minStipend);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching opportunities:", error.message);
      return { opportunities: [], total: 0 };
    }

    const resolved = await resolveSkillUUIDsToNames(supabase, data || []);
    return { opportunities: resolved || [], total: count || 0 };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getActiveOpportunities:", err);
    return { opportunities: [], total: 0 };
  }
}

/**
 * Get a single opportunity by ID with full details.
 */
export async function getOpportunityById(id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("opportunities")
      .select(
        `
        *,
        industry:industry_partners(
          company_name, logo_url, industry_sector, website, description
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching opportunity by ID:", error.message);
      return null;
    }
    if (!data) return null;

    const [resolved] = await resolveSkillUUIDsToNames(supabase, [data]);
    return resolved || data;
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getOpportunityById:", err);
    return null;
  }
}

/**
 * Get opportunities created by the current user (for recruiters).
 */
export async function getMyOpportunities() {
  try {
    const user = await getCachedUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select(
        `
        id, title, type, status, deadline, openings_count,
        views_count, created_at,
        applications(count)
      `
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching my opportunities:", error.message);
      return [];
    }

    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getMyOpportunities:", err);
    return [];
  }
}

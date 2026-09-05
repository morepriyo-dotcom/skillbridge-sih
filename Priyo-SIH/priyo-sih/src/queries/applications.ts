import { createClient } from "@/lib/supabase/server";

/**
 * Get applications for the current user (student view).
 */
export async function getMyApplications() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id, match_score, status, feedback, status_history,
        created_at, updated_at,
        opportunity:opportunities(
          id, title, type, location, is_remote, deadline,
          stipend_min, stipend_max, currency,
          industry:industry_partners(company_name, logo_url)
        )
      `
      )
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getMyApplications:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getMyApplications:", err);
    return [];
  }
}

/**
 * Get applicants for an opportunity (recruiter view).
 */
export async function getApplicantsForOpportunity(opportunityId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id, match_score, status, feedback, created_at,
        applicant:profiles!applicant_id(
          id, full_name, email, avatar_url, bio
        )
      `
      )
      .eq("opportunity_id", opportunityId)
      .order("match_score", { ascending: false });

    if (error) {
      console.error("Error in getApplicantsForOpportunity:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getApplicantsForOpportunity:", err);
    return [];
  }
}

/**
 * Get all applicants across all opportunities (recruiter dashboard).
 */
export async function getAllMyApplicants() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Get this user's opportunity IDs
    const { data: myOpps, error: oppsError } = await supabase
      .from("opportunities")
      .select("id")
      .eq("created_by", user.id);

    if (oppsError || !myOpps || myOpps.length === 0) return [];

    const oppIds = myOpps.map((o) => o.id);

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id, match_score, status, created_at,
        applicant:profiles!applicant_id(id, full_name, email, avatar_url),
        opportunity:opportunities(id, title, type)
      `
      )
      .in("opportunity_id", oppIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getAllMyApplicants:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Unexpected error in getAllMyApplicants:", err);
    return [];
  }
}

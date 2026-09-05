import { createClient } from "@/lib/supabase/server";

/**
 * Get the current user's profile with role-specific details.
 * Falls back gracefully to user_metadata if profile row is pending.
 */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      if (
        profile.role === "student" &&
        user.user_metadata?.role &&
        user.user_metadata.role !== "student"
      ) {
        profile.role = user.user_metadata.role;
      }
      let details = null;
      try {
        if (profile.role === "student") {
          const { data } = await supabase
            .from("student_details")
            .select("*, institution:institutions(name, code)")
            .eq("user_id", user.id)
            .maybeSingle();
          details = data;
        } else if (profile.role === "academician") {
          const { data } = await supabase
            .from("academician_details")
            .select("*, institution:institutions(name, code)")
            .eq("user_id", user.id)
            .maybeSingle();
          details = data;
        }
      } catch {
        // Table or row not available yet
      }

      return { ...profile, details };
    }
  } catch {
    // Database query failed
  }

  // Graceful fallback from auth metadata
  return {
    id: user.id,
    full_name:
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    role: user.user_metadata?.role || "student",
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || null,
    details: null,
  };
}

/**
 * Get dashboard statistics based on user role.
 * Returns typed stats for each role with zero-value fallbacks.
 */
export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let role = user.user_metadata?.role || "student";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role) {
      if (
        profile.role === "student" &&
        user.user_metadata?.role &&
        user.user_metadata.role !== "student"
      ) {
        role = user.user_metadata.role;
      } else {
        role = profile.role;
      }
    } else if (user.user_metadata?.role) {
      role = user.user_metadata.role;
    }
  } catch {
    if (user.user_metadata?.role) {
      role = user.user_metadata.role;
    }
  }

  switch (role) {
    case "student":
      return getStudentDashboard(supabase, user.id);
    case "academician":
      return getAcademicianDashboard(supabase, user.id);
    case "industry_partner":
      return getIndustryDashboard(supabase, user.id);
    case "institution_admin":
      return getInstitutionDashboard(supabase, user.id);
    case "super_admin":
      return getAdminDashboard(supabase);
    default:
      return getStudentDashboard(supabase, user.id);
  }
}

async function getStudentDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const [applications, skills, assessments] = await Promise.all([
      supabase
        .from("applications")
        .select(
          `id, match_score, status, created_at,
           opportunity:opportunities(id, title, type, industry:industry_partners(company_name))`,
          { count: "exact" }
        )
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("user_skills")
        .select("id, verified", { count: "exact" })
        .eq("user_id", userId),
      supabase
        .from("assessment_submissions")
        .select("id", { count: "exact" })
        .eq("user_id", userId),
    ]);

    const matchScores = (applications.data || [])
      .map((a: any) => a.match_score)
      .filter((s): s is number => s !== null && s !== undefined);

    return {
      role: "student" as const,
      totalApplications: applications.count || 0,
      skillsVerified: (skills.data || []).filter((s: any) => s.verified).length,
      totalSkills: skills.count || 0,
      assessmentsCompleted: assessments.count || 0,
      matchScoreAvg:
        matchScores.length > 0
          ? Math.round(
              matchScores.reduce((a, b) => a + b, 0) / matchScores.length
            )
          : 0,
      recentApplications: applications.data || [],
    };
  } catch {
    return {
      role: "student" as const,
      totalApplications: 0,
      skillsVerified: 0,
      totalSkills: 0,
      assessmentsCompleted: 0,
      matchScoreAvg: 0,
      recentApplications: [],
    };
  }
}

async function getAcademicianDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const [collaborations, mentorships, fdpApplications] = await Promise.all([
      supabase
        .from("collaborations")
        .select("id, title, status, category", { count: "exact" })
        .eq("proposed_by", userId),
      supabase
        .from("mentorship_sessions")
        .select("id", { count: "exact" })
        .eq("mentor_id", userId),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", userId),
    ]);

    return {
      role: "academician" as const,
      totalCollaborations: collaborations.count || 0,
      mentorshipSessions: mentorships.count || 0,
      fdpApplications: fdpApplications.count || 0,
      recentCollaborations: collaborations.data || [],
    };
  } catch {
    return {
      role: "academician" as const,
      totalCollaborations: 0,
      mentorshipSessions: 0,
      fdpApplications: 0,
      recentCollaborations: [],
    };
  }
}

async function getIndustryDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const { data: myOpps } = await supabase
      .from("opportunities")
      .select("id, status")
      .eq("created_by", userId);

    const oppIds = (myOpps || []).map((o: any) => o.id);
    const activePostings = (myOpps || []).filter(
      (o: any) => o.status === "active"
    ).length;

    let applicationsData: any[] = [];
    let applicationsCount = 0;
    let hiredCount = 0;

    if (oppIds.length > 0) {
      const { data, count } = await supabase
        .from("applications")
        .select(
          `id, match_score, status, created_at,
           applicant:profiles!applicant_id(full_name, avatar_url),
           opportunity:opportunities!inner(id, title)`,
          { count: "exact" }
        )
        .in("opportunity_id", oppIds)
        .order("created_at", { ascending: false })
        .limit(10);

      applicationsData = data || [];
      applicationsCount = count || 0;
      hiredCount = applicationsData.filter((a: any) => a.status === "hired").length;
    }

    return {
      role: "industry_partner" as const,
      activePostings,
      totalPostings: (myOpps || []).length,
      totalApplicants: applicationsCount,
      positionsFilled: hiredCount,
      recentApplications: applicationsData,
    };
  } catch {
    return {
      role: "industry_partner" as const,
      activePostings: 0,
      totalPostings: 0,
      totalApplicants: 0,
      positionsFilled: 0,
      recentApplications: [],
    };
  }
}

async function getInstitutionDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const { count: studentCount } = await supabase
      .from("student_details")
      .select("id", { count: "exact", head: true });

    const { count: placedCount } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "hired");

    const { count: activeDriveCount } = await supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    return {
      role: "institution_admin" as const,
      totalStudents: studentCount || 0,
      placedStudents: placedCount || 0,
      activeDrives: activeDriveCount || 0,
      placementRate:
        studentCount && studentCount > 0
          ? Math.round(((placedCount || 0) / studentCount) * 100)
          : 0,
    };
  } catch {
    return {
      role: "institution_admin" as const,
      totalStudents: 0,
      placedStudents: 0,
      activeDrives: 0,
      placementRate: 0,
    };
  }
}

async function getAdminDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const [users, institutions, partners, opportunities] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("institutions").select("id", { count: "exact", head: true }),
      supabase
        .from("industry_partners")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    return {
      role: "super_admin" as const,
      totalUsers: users.count || 0,
      totalInstitutions: institutions.count || 0,
      totalPartners: partners.count || 0,
      activeOpportunities: opportunities.count || 0,
    };
  } catch {
    return {
      role: "super_admin" as const,
      totalUsers: 0,
      totalInstitutions: 0,
      totalPartners: 0,
      activeOpportunities: 0,
    };
  }
}

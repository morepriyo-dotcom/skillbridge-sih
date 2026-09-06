import { createClient, createAdminClient, getCachedProfile, getCachedUser } from "@/lib/supabase/server";
import { getStudentCareerGoals } from "@/queries/profile";

/**
 * Get the current user's profile with role-specific details.
 * Uses request-cached profile to eliminate duplicate queries.
 */
export async function getProfile() {
  const profile = await getCachedProfile();
  if (!profile) return null;

  try {
    const admin = await createAdminClient();
    let details = null;
    if (profile.role === "student") {
      const { data } = await admin
        .from("student_details")
        .select("*, institution:institutions(name, code)")
        .eq("user_id", profile.id)
        .maybeSingle();
      details = data;
    } else if (profile.role === "academician") {
      const { data } = await admin
        .from("academician_details")
        .select("*, institution:institutions(name, code)")
        .eq("user_id", profile.id)
        .maybeSingle();
      details = data;
    }
    return { ...profile, details };
  } catch {
    return { ...profile, details: null };
  }
}

/**
 * Get dashboard statistics based on user role.
 * Returns typed stats for each role with zero-value fallbacks.
 * Uses cached profile to avoid redundant auth/profile network round-trips.
 */
export async function getDashboardStats() {
  const profile = await getCachedProfile();
  if (!profile) return null;

  const supabase = await createClient();

  switch (profile.role) {
    case "student":
      return getStudentDashboard(supabase, profile.id);
    case "academician":
      return getAcademicianDashboard(supabase, profile.id);
    case "industry_partner":
      return getIndustryDashboard(supabase, profile.id);
    case "institution_admin":
      return getInstitutionDashboard(supabase, profile.id);
    case "super_admin":
      return getAdminDashboard(supabase);
    default:
      return getStudentDashboard(supabase, profile.id);
  }
}

async function getStudentDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const [applications, skills, assessments, studentDetails, careerGoals] = await Promise.all([
      supabase
        .from("applications")
        .select(
          `id, match_score, status, created_at,
           opportunity:opportunities(id, title, type, industry:industry_partners(company_name))`,
          { count: "exact" }
        )
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("user_skills")
        .select("id, skill_name, proficiency_level, verified", { count: "exact" })
        .eq("user_id", userId),
      supabase
        .from("assessment_submissions")
        .select(
          `id, score_percentage, passed, created_at,
           assessment:skill_assessments(title, category)`,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("student_details")
        .select("degree, department, cgpa, graduation_year, institution:institutions(name, code)")
        .eq("user_id", userId)
        .maybeSingle(),
      getStudentCareerGoals(userId),
    ]);

    const matchScores = (applications.data || [])
      .map((a: any) => a.match_score)
      .filter((s): s is number => s !== null && s !== undefined);

    const verifiedSkillsList = (skills.data || []).filter((s: any) => s.verified);

    return {
      role: "student" as const,
      totalApplications: applications.count || 0,
      skillsVerified: verifiedSkillsList.length,
      totalSkills: skills.count || 0,
      assessmentsCompleted: assessments.count || 0,
      matchScoreAvg:
        matchScores.length > 0
          ? Math.round(
              matchScores.reduce((a, b) => a + b, 0) / matchScores.length
            )
          : 0,
      recentApplications: applications.data || [],
      skillsList: skills.data || [],
      recentAssessments: assessments.data || [],
      studentDetails: studentDetails?.data || null,
      careerGoals: careerGoals || {
        desired_role: "Full Stack Software Developer",
        desired_sector: "Information Technology",
      },
    };
  } catch (err) {
    console.error("Error in getStudentDashboard:", err);
    return {
      role: "student" as const,
      totalApplications: 0,
      skillsVerified: 0,
      totalSkills: 0,
      assessmentsCompleted: 0,
      matchScoreAvg: 0,
      recentApplications: [],
      skillsList: [],
      recentAssessments: [],
      studentDetails: null,
      careerGoals: {
        desired_role: "Full Stack Software Developer",
        desired_sector: "Information Technology",
      },
    };
  }
}

async function getAcademicianDashboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const [collaborations, mentorships, fdpApplications, opportunities] = await Promise.all([
      supabase
        .from("collaborations")
        .select("id, title, status, category, created_at", { count: "exact" })
        .eq("proposed_by", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("mentorship_sessions")
        .select("id, status, scheduled_at, topic, mentee_id", { count: "exact" })
        .eq("mentor_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("applications")
        .select("id, status, created_at, opportunity:opportunities(id, title, type)", { count: "exact" })
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("opportunities")
        .select("id, title, type, location, stipend, deadline", { count: "exact" })
        .in("type", ["fdp", "research_consultancy", "faculty_internship"])
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    return {
      role: "academician" as const,
      totalCollaborations: collaborations.count || 0,
      mentorshipSessions: mentorships.count || 0,
      fdpApplications: fdpApplications.count || 0,
      facultyOpportunitiesCount: opportunities.count || 0,
      recentCollaborations: collaborations.data || [],
      recentMentorships: mentorships.data || [],
      recentApplications: fdpApplications.data || [],
      facultyOpportunities: opportunities.data || [],
    };
  } catch {
    return {
      role: "academician" as const,
      totalCollaborations: 0,
      mentorshipSessions: 0,
      fdpApplications: 0,
      facultyOpportunitiesCount: 0,
      recentCollaborations: [],
      recentMentorships: [],
      recentApplications: [],
      facultyOpportunities: [],
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
           applicant:profiles!applicant_id(id, full_name, email, avatar_url),
           opportunity:opportunities!inner(id, title, type)`,
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
  _userId: string
) {
  try {
    const [studentsRes, placedRes, drivesRes] = await Promise.all([
      supabase.from("student_details").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "hired"),
      supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

    const studentCount = studentsRes.count;
    const placedCount = placedRes.count;
    const activeDriveCount = drivesRes.count;

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

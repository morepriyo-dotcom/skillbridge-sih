import { createClient } from "@/lib/supabase/server";

/**
 * Get institution-level analytics data.
 */
export async function getInstitutionAnalytics() {
  const supabase = await createClient();

  const [students, placed, activeOpps, skills] = await Promise.all([
    supabase
      .from("student_details")
      .select("id, department, degree, cgpa", { count: "exact" }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "hired"),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("user_skills")
      .select("id, verified", { count: "exact" }),
  ]);

  const totalStudents = students.count || 0;
  const placedStudents = placed.count || 0;
  const activeOpportunities = activeOpps.count || 0;
  const allSkills = skills.data || [];
  const verifiedSkillCount = allSkills.filter((s) => s.verified).length;

  // Department breakdown
  const studentData = students.data || [];
  const deptMap = new Map<string, { total: number; cgpaSum: number }>();
  for (const s of studentData) {
    const dept = s.department || "Other";
    const existing = deptMap.get(dept) || { total: 0, cgpaSum: 0 };
    existing.total += 1;
    existing.cgpaSum += Number(s.cgpa) || 0;
    deptMap.set(dept, existing);
  }

  const departments = Array.from(deptMap.entries()).map(([dept, stats]) => ({
    department: dept,
    totalStudents: stats.total,
    avgCgpa: stats.total > 0 ? stats.cgpaSum / stats.total : 0,
  }));

  return {
    totalStudents,
    placedStudents,
    activeOpportunities,
    placementRate:
      totalStudents > 0
        ? Math.round((placedStudents / totalStudents) * 100)
        : 0,
    skillAssessmentRate:
      allSkills.length > 0
        ? Math.round((verifiedSkillCount / allSkills.length) * 100)
        : 0,
    departments,
  };
}

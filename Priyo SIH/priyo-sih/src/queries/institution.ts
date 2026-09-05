import { createClient } from "@/lib/supabase/server";

export type TrackedStudent = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  rollNumber: string | null;
  department: string;
  degree: string;
  graduationYear: number | null;
  cgpa: number | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  verifiedSkillsCount: number;
  totalApplications: number;
  placementStatus: "placed" | "offered" | "interviewing" | "applied" | "seeking";
  placedCompany?: string;
  createdAt: string;
};

export async function getInstitutionStudents(): Promise<TrackedStudent[]> {
  const supabase = await createClient();

  // 1. Fetch all student profiles
  const { data: studentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, phone, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (!studentProfiles || studentProfiles.length === 0) {
    return [];
  }

  const studentIds = studentProfiles.map((p) => p.id);

  // 2. Fetch student details for these students
  const { data: detailsList } = await supabase
    .from("student_details")
    .select("*")
    .in("user_id", studentIds);

  const detailsMap = new Map((detailsList || []).map((d) => [d.user_id, d]));

  // 3. Fetch verified skills counts
  const { data: skillsList } = await supabase
    .from("user_skills")
    .select("user_id, verified")
    .in("user_id", studentIds);

  const verifiedSkillsMap = new Map<string, number>();
  for (const s of skillsList || []) {
    if (s.verified) {
      verifiedSkillsMap.set(s.user_id, (verifiedSkillsMap.get(s.user_id) || 0) + 1);
    }
  }

  // 4. Fetch applications to compute placement status
  const { data: appsList } = await supabase
    .from("applications")
    .select("id, applicant_id, status, opportunity:opportunities(title, company_name:industry_partners(company_name))")
    .in("applicant_id", studentIds);

  const appsMap = new Map<string, any[]>();
  for (const app of appsList || []) {
    const list = appsMap.get(app.applicant_id) || [];
    list.push(app);
    appsMap.set(app.applicant_id, list);
  }

  return studentProfiles.map((sp) => {
    const d = detailsMap.get(sp.id);
    const userApps = appsMap.get(sp.id) || [];
    const verifiedCount = verifiedSkillsMap.get(sp.id) || 0;

    let placementStatus: TrackedStudent["placementStatus"] = "seeking";
    let placedCompany: string | undefined;

    const hiredApp = userApps.find((a: any) => a.status === "hired");
    const offeredApp = userApps.find((a: any) => a.status === "offered");
    const interviewingApp = userApps.find((a: any) =>
      ["interview_scheduled", "assessment", "shortlisted"].includes(a.status)
    );

    if (hiredApp) {
      placementStatus = "placed";
      placedCompany = hiredApp.opportunity?.company_name?.company_name || hiredApp.opportunity?.title;
    } else if (offeredApp) {
      placementStatus = "offered";
      placedCompany = offeredApp.opportunity?.company_name?.company_name || offeredApp.opportunity?.title;
    } else if (interviewingApp) {
      placementStatus = "interviewing";
    } else if (userApps.length > 0) {
      placementStatus = "applied";
    }

    return {
      id: sp.id,
      fullName: sp.full_name || "Student",
      email: sp.email,
      avatarUrl: sp.avatar_url,
      phone: sp.phone,
      rollNumber: d?.roll_number || null,
      department: d?.department || "Computer Science",
      degree: d?.degree || "B.Tech",
      graduationYear: d?.graduation_year || new Date().getFullYear(),
      cgpa: d?.cgpa !== undefined && d?.cgpa !== null ? Number(d.cgpa) : null,
      resumeUrl: d?.resume_url || null,
      linkedinUrl: d?.linkedin_url || null,
      githubUrl: d?.github_url || null,
      verifiedSkillsCount: verifiedCount,
      totalApplications: userApps.length,
      placementStatus,
      placedCompany,
      createdAt: sp.created_at,
    };
  });
}

export type PlacementDrive = {
  id: string;
  title: string;
  type: string;
  status: string;
  deadline: string | null;
  stipendMin: number | null;
  stipendMax: number | null;
  location: string | null;
  isRemote: boolean;
  openingsCount: number;
  targetDepartments: string[] | null;
  targetDegrees: string[] | null;
  minCgpa: number | null;
  createdAt: string;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  totalApplicants: number;
  placedCount: number;
};

export async function getPlacementDrives(): Promise<PlacementDrive[]> {
  const supabase = await createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      type,
      status,
      deadline,
      stipend_min,
      stipend_max,
      location,
      is_remote,
      openings_count,
      target_departments,
      target_degrees,
      min_cgpa,
      created_at,
      partner:industry_partners(company_name, logo_url, website)
    `)
    .order("created_at", { ascending: false });

  if (error || !opportunities) return [];

  const oppIds = opportunities.map((o) => o.id);
  const { data: apps } = await supabase
    .from("applications")
    .select("opportunity_id, status")
    .in("opportunity_id", oppIds);

  const statsMap = new Map<string, { total: number; placed: number }>();
  for (const app of apps || []) {
    const cur = statsMap.get(app.opportunity_id) || { total: 0, placed: 0 };
    cur.total += 1;
    if (app.status === "hired") cur.placed += 1;
    statsMap.set(app.opportunity_id, cur);
  }

  return opportunities.map((opp: any) => ({
    id: opp.id,
    title: opp.title,
    type: opp.type,
    status: opp.status,
    deadline: opp.deadline,
    stipendMin: opp.stipend_min,
    stipendMax: opp.stipend_max,
    location: opp.location,
    isRemote: Boolean(opp.is_remote),
    openingsCount: opp.openings_count || 1,
    targetDepartments: opp.target_departments,
    targetDegrees: opp.target_degrees,
    minCgpa: opp.min_cgpa,
    createdAt: opp.created_at,
    companyName: opp.partner?.company_name || "Industry Partner",
    companyLogo: opp.partner?.logo_url || null,
    companyWebsite: opp.partner?.website || null,
    totalApplicants: statsMap.get(opp.id)?.total || 0,
    placedCount: statsMap.get(opp.id)?.placed || 0,
  }));
}

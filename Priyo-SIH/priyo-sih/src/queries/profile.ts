import { createAdminClient, getCachedProfile, getCachedUser } from "@/lib/supabase/server";

export interface StudentCareerGoals {
  desired_role: string;
  desired_sector: string;
}

export interface IndustryPartnerProfile {
  company_name: string;
  industry_sector: string;
  registration_no: string;
  website: string;
  headquarters: string;
  description: string;
}

export interface InstitutionAdminProfile {
  institution_name: string;
  code: string;
  type: string;
  state: string;
  city: string;
  website: string;
  accreditation_status: string;
}

export interface UserFullProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at?: string;
  studentDetails?: any | null;
  careerGoals?: StudentCareerGoals | null;
  academicianDetails?: any | null;
  partnerProfile?: IndustryPartnerProfile | null;
  institutionProfile?: InstitutionAdminProfile | null;
}

/**
 * Fetch full profile for the currently logged-in user, including
 * role-specific data for student, academician, industry partner, or institution admin.
 */
export async function getUserFullProfile(): Promise<UserFullProfile | null> {
  const profile = await getCachedProfile();
  if (!profile) return null;

  try {
    const admin = await createAdminClient();

    let studentDetails = null;
    let careerGoals: StudentCareerGoals | null = null;
    let academicianDetails = null;
    let partnerProfile: IndustryPartnerProfile | null = null;
    let institutionProfile: InstitutionAdminProfile | null = null;

    if (profile.role === "student") {
      const [stdRes, goalsRes] = await Promise.all([
        admin
          .from("student_details")
          .select("*, institution:institutions(id, name, code)")
          .eq("user_id", profile.id)
          .maybeSingle(),
        admin
          .from("audit_log")
          .select("new_data")
          .eq("table_name", "student_career_goals")
          .eq("record_id", profile.id)
          .maybeSingle(),
      ]);

      studentDetails = stdRes.data || null;
      if (goalsRes.data?.new_data) {
        careerGoals = goalsRes.data.new_data as StudentCareerGoals;
      } else {
        careerGoals = {
          desired_role: "Full Stack Software Developer",
          desired_sector: "Information Technology",
        };
      }
    } else if (profile.role === "academician") {
      const { data } = await admin
        .from("academician_details")
        .select("*, institution:institutions(id, name, code)")
        .eq("user_id", profile.id)
        .maybeSingle();
      academicianDetails = data || null;
    } else if (profile.role === "industry_partner") {
      const { data } = await admin
        .from("audit_log")
        .select("new_data")
        .eq("table_name", "industry_partner_details")
        .eq("record_id", profile.id)
        .maybeSingle();

      if (data?.new_data) {
        partnerProfile = data.new_data as IndustryPartnerProfile;
      } else {
        partnerProfile = {
          company_name: profile.full_name || "Enterprise Partner",
          industry_sector: "Information Technology & Healthcare",
          registration_no: "",
          website: "",
          headquarters: "Bengaluru, India",
          description: "",
        };
      }
    } else if (profile.role === "institution_admin") {
      const { data } = await admin
        .from("audit_log")
        .select("new_data")
        .eq("table_name", "institution_admin_details")
        .eq("record_id", profile.id)
        .maybeSingle();

      if (data?.new_data) {
        institutionProfile = data.new_data as InstitutionAdminProfile;
      } else {
        institutionProfile = {
          institution_name: "Indian Institute of Technology / Ayurvedic University",
          code: "AISHE-U-0123",
          type: "Autonomous Institution",
          state: "Maharashtra",
          city: "Mumbai",
          website: "https://institution.edu.in",
          accreditation_status: "NAAC A++ (CGPA 3.82)",
        };
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      bio: profile.bio,
      created_at: (profile as any).created_at || null,
      studentDetails,
      careerGoals,
      academicianDetails,
      partnerProfile,
      institutionProfile,
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Error in getUserFullProfile:", err);
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      bio: profile.bio,
      created_at: (profile as any).created_at || null,
    };
  }
}

/**
 * Get student career goals (desired role & sector)
 */
export async function getStudentCareerGoals(userId?: string): Promise<StudentCareerGoals> {
  try {
    const user = userId ? { id: userId } : await getCachedUser();
    if (!user) {
      return { desired_role: "Full Stack Software Developer", desired_sector: "Information Technology" };
    }

    const admin = await createAdminClient();
    const { data } = await admin
      .from("audit_log")
      .select("new_data")
      .eq("table_name", "student_career_goals")
      .eq("record_id", user.id)
      .maybeSingle();

    if (data?.new_data) {
      return data.new_data as StudentCareerGoals;
    }
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("Error in getStudentCareerGoals:", err);
  }

  return {
    desired_role: "Full Stack Software Developer",
    desired_sector: "Information Technology",
  };
}

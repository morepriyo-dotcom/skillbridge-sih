import { createAdminClient, getCachedUser } from "@/lib/supabase/server";

export interface RoleAssignment {
  opportunity_id: string;
  opportunity_title: string;
  assessment_id: string;
  assessment_title: string;
  sector: string;
  category: string;
  duration_minutes: number;
  passing_score: number;
  total_marks: number;
  is_mandatory: boolean;
  assigned_at: string;
  assigned_by: string;
}

export interface OpportunityWithTask {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string | null;
  isRemote: boolean;
  deadline: string | null;
  applicantCount: number;
  assignedTask: RoleAssignment | null;
}

export interface RoleCandidateTaskResult {
  applicationId: string;
  candidateId: string;
  fullName: string;
  email: string;
  applicationStatus: string;
  matchScore: number;
  hasAttemptedTask: boolean;
  taskScore: number | null;
  taskPassed: boolean | null;
  timeTakenSecs: number | null;
  completedAt: string | null;
}

/**
 * Get assigned task for a specific opportunity.
 */
export async function getRoleAssignmentForOpportunity(
  opportunityId: string
): Promise<RoleAssignment | null> {
  try {
    const admin = await createAdminClient();

    const { data, error } = await admin
      .from("audit_log")
      .select("new_data")
      .eq("table_name", "role_assignments")
      .eq("record_id", opportunityId)
      .maybeSingle();

    if (error || !data) return null;
    return (data.new_data as RoleAssignment) || null;
  } catch (err) {
    console.error("Error in getRoleAssignmentForOpportunity:", err);
    return null;
  }
}

/**
 * Get all opportunities for the current partner with their assigned screening tasks and stats.
 */
export async function getMyOpportunitiesWithAssignments(): Promise<OpportunityWithTask[]> {
  try {
    const user = await getCachedUser();
    if (!user) return [];

    const admin = await createAdminClient();

    // 1. Fetch opportunities created by this user (or all if privileged)
    const { data: opportunities, error: oppErr } = await admin
      .from("opportunities")
      .select(`
        id, title, type, status, location, is_remote, deadline, created_at,
        partner:industry_partners(company_name)
      `)
      .order("created_at", { ascending: false });

    if (oppErr || !opportunities) return [];

    const oppIds = opportunities.map((o) => o.id);

    // 2. Fetch assigned tasks
    const { data: assignmentsData } = await admin
      .from("audit_log")
      .select("record_id, new_data")
      .eq("table_name", "role_assignments")
      .in("record_id", oppIds);

    const assignmentMap = new Map<string, RoleAssignment>();
    for (const row of assignmentsData || []) {
      if (row.new_data) {
        assignmentMap.set(row.record_id, row.new_data as RoleAssignment);
      }
    }

    // 3. Fetch applicants count
    const { data: appsData } = await admin
      .from("applications")
      .select("opportunity_id, applicant_id")
      .in("opportunity_id", oppIds);

    const countMap = new Map<string, number>();
    for (const app of appsData || []) {
      countMap.set(app.opportunity_id, (countMap.get(app.opportunity_id) || 0) + 1);
    }

    return opportunities.map((opp) => ({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      status: opp.status || "active",
      location: opp.location,
      isRemote: Boolean(opp.is_remote),
      deadline: opp.deadline,
      applicantCount: countMap.get(opp.id) || 0,
      assignedTask: assignmentMap.get(opp.id) || null,
    }));
  } catch (err) {
    console.error("Error in getMyOpportunitiesWithAssignments:", err);
    return [];
  }
}

/**
 * Get candidates for an opportunity with their screening task performance scores.
 */
export async function getRoleCandidatesWithTaskResults(
  opportunityId: string
): Promise<{
  opportunityTitle: string;
  assignedTask: RoleAssignment | null;
  candidates: RoleCandidateTaskResult[];
}> {
  try {
    const admin = await createAdminClient();

    // 1. Fetch opportunity & assigned task
    const { data: opp } = await admin
      .from("opportunities")
      .select("id, title")
      .eq("id", opportunityId)
      .maybeSingle();

    const assignedTask = await getRoleAssignmentForOpportunity(opportunityId);

    // 2. Fetch applicants for this opportunity
    const { data: applications } = await admin
      .from("applications")
      .select(`
        id, applicant_id, status, match_score, created_at,
        applicant:profiles!applicant_id(id, full_name, email)
      `)
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });

    if (!applications || applications.length === 0) {
      return {
        opportunityTitle: opp?.title || "Role",
        assignedTask,
        candidates: [],
      };
    }

    const applicantIds = applications.map((a) => a.applicant_id);

    // 3. If there is an assigned assessment, query submissions
    const submissionsMap = new Map<string, any>();
    if (assignedTask?.assessment_id) {
      const { data: submissions } = await admin
        .from("assessment_submissions")
        .select("user_id, score, passed, time_taken_secs, completed_at")
        .eq("assessment_id", assignedTask.assessment_id)
        .in("user_id", applicantIds);

      for (const s of submissions || []) {
        submissionsMap.set(s.user_id, s);
      }
    }

    const candidateResults: RoleCandidateTaskResult[] = applications.map((app: any) => {
      const applicantUser = app.applicant;
      const sub = submissionsMap.get(app.applicant_id);

      return {
        applicationId: app.id,
        candidateId: app.applicant_id,
        fullName: applicantUser?.full_name || "Applicant",
        email: applicantUser?.email || "",
        applicationStatus: app.status || "applied",
        matchScore: app.match_score || 0,
        hasAttemptedTask: Boolean(sub),
        taskScore: sub ? Math.round(sub.score) : null,
        taskPassed: sub ? Boolean(sub.passed) : null,
        timeTakenSecs: sub ? sub.time_taken_secs : null,
        completedAt: sub ? sub.completed_at : null,
      };
    });

    return {
      opportunityTitle: opp?.title || "Role",
      assignedTask,
      candidates: candidateResults,
    };
  } catch (err) {
    console.error("Error in getRoleCandidatesWithTaskResults:", err);
    return {
      opportunityTitle: "Role",
      assignedTask: null,
      candidates: [],
    };
  }
}

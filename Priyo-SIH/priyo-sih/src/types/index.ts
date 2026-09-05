// ============================================================
// TypeScript types for the application.
// These are manually maintained to match the Supabase schema.
// For auto-generated types, run: npx supabase gen types typescript
// ============================================================

export type UserRole =
  | "student"
  | "academician"
  | "industry_partner"
  | "institution_admin"
  | "super_admin";

export type OpportunityType =
  | "student_internship"
  | "faculty_internship"
  | "full_time_job"
  | "apprenticeship"
  | "fdp"
  | "research_consultancy";

export type OpportunityStatus = "draft" | "active" | "closed" | "archived";

export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "assessment"
  | "interview_scheduled"
  | "offered"
  | "rejected"
  | "hired"
  | "completed";

export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type VerificationSource = "assessment" | "faculty" | "certificate" | "self_declared";

export type CollabStatus = "proposed" | "approved" | "in_progress" | "completed" | "cancelled";

// ============================================================
// Row types (matching database tables)
// ============================================================

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Institution {
  id: string;
  name: string;
  code: string | null;
  type: string;
  state: string;
  city: string;
  website: string | null;
  verified: boolean;
  created_at: string;
}

export interface IndustryPartner {
  id: string;
  company_name: string;
  industry_sector: string;
  registration_no: string | null;
  website: string | null;
  headquarters: string | null;
  description: string | null;
  logo_url: string | null;
  verified: boolean;
  created_at: string;
}

export interface StudentDetails {
  id: string;
  user_id: string;
  institution_id: string | null;
  roll_number: string | null;
  department: string;
  degree: string;
  graduation_year: number;
  cgpa: number | null;
  resume_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
}

export interface AcademicianDetails {
  id: string;
  user_id: string;
  institution_id: string | null;
  department: string;
  designation: string;
  areas_of_expertise: string[];
  research_interests: string[];
  google_scholar_url: string | null;
  open_for_consultancy: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  sector: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: ProficiencyLevel;
  verified: boolean;
  verification_source: VerificationSource;
  verified_by: string | null;
  evidence_url: string | null;
  created_at: string;
  // Joined
  skill?: Skill;
}

export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  category: string;
  sector: string | null;
  duration_minutes: number;
  passing_score: number;
  total_marks: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: "mcq" | "multi_select" | "true_false";
  options: Array<{ id: string; text: string; is_correct: boolean }>;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  related_skill_id: string | null;
  sort_order: number;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  user_id: string;
  score: number;
  total_marks: number;
  passed: boolean;
  time_taken_secs: number | null;
  answers: Array<{
    question_id: string;
    selected_option_ids: string[];
    is_correct: boolean;
  }> | null;
  skill_breakdown: Array<{
    skill_id: string;
    score: number;
    max_score: number;
  }> | null;
  completed_at: string;
}

export interface Opportunity {
  id: string;
  industry_id: string | null;
  institution_id: string | null;
  created_by: string;
  title: string;
  type: OpportunityType;
  description: string;
  location: string;
  is_remote: boolean;
  stipend_min: number | null;
  stipend_max: number | null;
  currency: string;
  duration_months: number | null;
  required_skills: string[];
  preferred_skills: string[];
  min_cgpa: number;
  target_degrees: string[];
  target_departments: string[];
  openings_count: number;
  deadline: string;
  status: OpportunityStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  industry?: IndustryPartner;
}

export interface Application {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  resume_url: string | null;
  cover_letter: string | null;
  match_score: number | null;
  status: ApplicationStatus;
  reviewer_id: string | null;
  feedback: string | null;
  status_history: Array<{
    status: ApplicationStatus;
    changed_at: string;
    changed_by: string | null;
  }>;
  created_at: string;
  updated_at: string;
  // Joined
  opportunity?: Opportunity;
  applicant?: Profile;
}

export interface Collaboration {
  id: string;
  title: string;
  description: string;
  proposed_by: string;
  industry_id: string | null;
  institution_id: string | null;
  category: string;
  domain: string | null;
  status: CollabStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface MentorshipSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meeting_link: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
  // Joined
  mentor?: Profile;
  mentee?: Profile;
}

export interface InternshipLog {
  id: string;
  application_id: string;
  week_number: number;
  log_date: string;
  activities: string;
  learnings: string | null;
  mentor_feedback: string | null;
  mentor_rating: number | null;
  created_at: string;
}

// ============================================================
// Composite / View types
// ============================================================

export interface DashboardStats {
  totalApplications: number;
  activeOpportunities: number;
  skillsVerified: number;
  assessmentsCompleted: number;
  matchScoreAvg: number;
  recentApplications: Application[];
}

export interface SkillGapData {
  skillName: string;
  current: number;  // 0-4 (beginner=1, expert=4)
  benchmark: number; // Industry benchmark
}

export interface OpportunityFilters {
  type?: OpportunityType;
  sector?: string;
  isRemote?: boolean;
  location?: string;
  minStipend?: number;
  search?: string;
  offset: number;
  limit: number;
}

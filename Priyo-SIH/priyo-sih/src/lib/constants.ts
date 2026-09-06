// ============================================================
// Constants: Roles, Sectors, Departments, Status Maps
// Single source of truth for all static enum-like values.
// ============================================================

export const USER_ROLES = {
  STUDENT: "student",
  ACADEMICIAN: "academician",
  INDUSTRY_PARTNER: "industry_partner",
  INSTITUTION_ADMIN: "institution_admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  academician: "Academician / Faculty",
  industry_partner: "Industry Partner",
  institution_admin: "Institution Admin",
  super_admin: "Platform Admin",
};

export const INDUSTRY_SECTORS = [
  "Ayush",
  "Ayurveda",
  "Pharma",
  "BioTech",
  "IT & Software",
  "Healthcare",
  "Manufacturing",
  "Research & Development",
  "Education & Training",
  "Consulting",
  "Finance",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Kayachikitsa",
  "Shalya Tantra",
  "Shalakya Tantra",
  "Prasuti & Stree Roga",
  "Kaumarbhritya",
  "Agada Tantra",
  "Dravyaguna",
  "Rasa Shastra & Bhaishajya Kalpana",
  "Swasthavritta",
  "Kriya Sharir",
  "Rachana Sharir",
  "Samhita & Siddhanta",
  "Computer Science",
  "Information Technology",
  "Mechanical Engineering",
  "Electronics & Communication",
  "Electrical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Pharmacy",
  "Life Sciences",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Management",
  "Other",
] as const;

export const DEGREES = [
  "BAMS",
  "MD (Ayurveda)",
  "B.Tech",
  "M.Tech",
  "B.Sc",
  "M.Sc",
  "B.Pharm",
  "M.Pharm",
  "Ph.D",
  "MBA",
  "BCA",
  "MCA",
  "Other",
] as const;

export const OPPORTUNITY_TYPES = {
  student_internship: "Student Internship",
  faculty_internship: "Faculty Internship",
  full_time_job: "Full-Time Job",
  apprenticeship: "Apprenticeship",
  fdp: "Faculty Development Program",
  research_consultancy: "Research Consultancy",
} as const;

export const APPLICATION_STATUSES = {
  applied: { label: "Applied", color: "bg-accent-blue/20 text-accent-blue" },
  under_review: { label: "Under Review", color: "bg-semantic-warning/20 text-semantic-warning" },
  shortlisted: { label: "Shortlisted", color: "bg-gradient-violet/20 text-gradient-violet" },
  assessment: { label: "Assessment", color: "bg-gradient-orange/20 text-gradient-orange" },
  interview_scheduled: { label: "Interview", color: "bg-gradient-magenta/20 text-gradient-magenta" },
  offered: { label: "Offered", color: "bg-semantic-success/20 text-semantic-success" },
  rejected: { label: "Rejected", color: "bg-semantic-error/20 text-semantic-error" },
  hired: { label: "Hired", color: "bg-semantic-success/20 text-semantic-success" },
  completed: { label: "Completed", color: "bg-ink-muted/20 text-ink-muted" },
} as const;

export const PROFICIENCY_LEVELS = {
  beginner: { label: "Beginner", value: 1 },
  intermediate: { label: "Intermediate", value: 2 },
  advanced: { label: "Advanced", value: 3 },
  expert: { label: "Expert", value: 4 },
} as const;

export const SKILL_CATEGORIES = [
  "Technical",
  "Clinical",
  "Soft Skill",
  "Domain",
  "Research",
] as const;

/** Navigation items per role */
export const ROLE_NAV_ITEMS: Record<UserRole, Array<{ label: string; href: string; icon: string }>> = {
  student: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "My Skills", href: "/skills", icon: "Zap" },
    { label: "Assessments", href: "/skills/assessments", icon: "ClipboardCheck" },
    { label: "Opportunities", href: "/opportunities", icon: "Briefcase" },
    { label: "Applications", href: "/applications", icon: "FileText" },
    { label: "Portfolio", href: "/portfolio", icon: "Award" },
    { label: "Mentorship", href: "/mentorship", icon: "Users" },
  ],
  academician: [
    { label: "Faculty Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Industry Collaborations", href: "/collaborations", icon: "Handshake" },
    { label: "Student Mentorship", href: "/mentorship", icon: "Users" },
    { label: "FDPs & Research Openings", href: "/opportunities", icon: "Briefcase" },
    { label: "FDP Applications", href: "/applications", icon: "FileText" },
    { label: "Research & Skills Matrix", href: "/skills", icon: "Zap" },
  ],
  industry_partner: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Post Opportunity", href: "/recruiter/post-opportunity", icon: "PlusCircle" },
    { label: "Applicants", href: "/recruiter/applicants", icon: "Users" },
    { label: "Training Programs", href: "/recruiter/training-programs", icon: "GraduationCap" },
    { label: "Collaborations", href: "/collaborations", icon: "Handshake" },
  ],
  institution_admin: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Student Tracking", href: "/institution/student-tracking", icon: "UserSearch" },
    { label: "Placement Drives", href: "/institution/placement-drives", icon: "Target" },
    { label: "Analytics", href: "/institution/analytics", icon: "BarChart3" },
    { label: "Collaborations", href: "/collaborations", icon: "Handshake" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Verify Partners", href: "/admin/verify-partners", icon: "ShieldCheck" },
    { label: "Skill Taxonomy", href: "/admin/skill-taxonomy", icon: "Network" },
    { label: "National Analytics", href: "/admin/national-analytics", icon: "Globe" },
  ],
};

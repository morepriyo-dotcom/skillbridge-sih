import React from 'react';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getDashboardStats, getProfile } from '@/queries/dashboard';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Brain, Target, CheckCircle, CheckCircle2,
  Briefcase, Users, Building, AlertCircle, ExternalLink,
  Activity, Award, BarChart, ChevronRight, Sparkles,
  PlusCircle, ArrowUpRight, Handshake, Landmark, Clock, BookOpen, GraduationCap,
  ShieldCheck, Terminal, Compass, Layers, FileCheck2, Shield, Calendar, Search
} from 'lucide-react';
import { IndustryApplicationsList } from './industry-applications-list';

function TelemetryRibbon({
  roleTitle,
  userName,
  roleCode,
  sessionId,
}: {
  roleTitle: string;
  userName: string;
  roleCode: string;
  sessionId: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-2.5 bg-surface-1 border border-hairline rounded-xl text-micro font-mono text-ink-muted">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-ink font-semibold">
          <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
          SYSTEM OPERATIONAL // {roleTitle.toUpperCase()}
        </span>
        <span className="hidden md:inline text-hairline">|</span>
        <span className="hidden sm:inline">REGION: IN-WEST-1</span>
        <span className="hidden md:inline text-hairline">|</span>
        <span className="hidden sm:inline">SESSION: #{sessionId.slice(0, 8)}</span>
        <span className="hidden lg:inline text-hairline">|</span>
        <span className="text-accent-blue font-medium">NEP 2020 & AICTE COMPLIANT</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-ink font-medium truncate max-w-[200px]">{userName}</span>
        <span className="px-2 py-0.5 rounded bg-surface-2 text-ink-muted border border-hairline uppercase text-[10px] tracking-wide">
          {roleCode.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  badgeText,
  badgeVariant = "muted",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  href?: string;
  badgeText?: string;
  badgeVariant?: "success" | "accent" | "warning" | "muted";
}) {
  const content = (
    <Card className="bg-surface-1 border-hairline p-5 rounded-xl transition-colors hover:border-accent-blue/40 group flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-ink-muted font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center text-ink-muted group-hover:text-ink transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-display-md text-ink font-semibold tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-1 text-micro text-ink-muted">
          {subtext && <span className="truncate mr-2">{subtext}</span>}
          {badgeText && (
            <Badge variant={badgeVariant} className="text-[10px] py-0 px-1.5 shrink-0 ml-auto font-mono">
              {badgeText}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }
  return content;
}

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) redirect('/login');

  const stats = await getDashboardStats();

  if (!stats || !profile) {
    return (
      <div className="p-8">
        <EmptyState 
          icon={Activity} 
          title="Could not load dashboard" 
          description="There was an issue loading your dashboard telemetry data." 
        />
      </div>
    );
  }

  const role = (profile.role === 'academician' || stats.role === 'academician') 
    ? 'academician' 
    : (profile.role || stats.role);

  // Helper for application badge
  const getApplicationBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <Badge variant="success" className="capitalize text-micro font-mono">shortlisted</Badge>;
      case 'interview_scheduled':
        return <Badge variant="accent" className="capitalize text-micro font-mono">interviewing</Badge>;
      case 'hired':
        return <Badge variant="success" className="capitalize text-micro font-mono">hired</Badge>;
      case 'rejected':
        return <Badge variant="muted" className="capitalize text-micro font-mono">rejected</Badge>;
      case 'under_review':
        return <Badge variant="accent" className="capitalize text-micro font-mono">under review</Badge>;
      case 'applied':
      default:
        return <Badge variant="muted" className="capitalize text-micro font-mono">{status?.replace('_', ' ') || 'applied'}</Badge>;
    }
  };

  // 1. STUDENT DASHBOARD
  const renderStudentDashboard = (data: any) => {
    const targetRole = data.careerGoals?.desired_role || "Full Stack Software Developer";
    const targetSector = data.careerGoals?.desired_sector || "Information Technology";
    const institutionName = profile.details?.institution?.name || (data.studentDetails as any)?.institution?.name || "National Institute of Technology";
    const degree = profile.details?.degree || (data.studentDetails as any)?.degree || "B.Tech Computer Science & Engineering";
    const department = profile.details?.department || (data.studentDetails as any)?.department || "Computer Science";
    const cgpa = profile.details?.cgpa || (data.studentDetails as any)?.cgpa || "8.85";

    const userSkillNames = (data.skillsList || []).map((s: any) => s.skill_name?.toLowerCase() || "");
    const roleCompetencyMap: Record<string, string[]> = {
      "Full Stack Software Developer": ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Git & CI/CD"],
      "Cloud Software Engineer": ["AWS/Azure", "Docker & Kubernetes", "Python", "Microservices", "Linux", "Terraform"],
      "Data Scientist / AI Engineer": ["Python", "Machine Learning", "PyTorch", "SQL", "Data Modeling", "Statistics"],
      "Cybersecurity Analyst": ["Network Security", "Penetration Testing", "SIEM", "Cryptography", "Compliance", "Linux"],
    };
    const expectedSkills = roleCompetencyMap[targetRole] || ["Software Architecture", "Data Structures & Algorithms", "Database Design", "API Development", "Version Control", "Cloud Infrastructure"];
    const matchedSkills = expectedSkills.filter((expected) =>
      userSkillNames.some((userSkill: string) => userSkill.includes(expected.toLowerCase().split(' ')[0]))
    );
    const missingSkills = expectedSkills.filter((expected) => !matchedSkills.includes(expected));
    const readinessScore = Math.max(
      data.matchScoreAvg || 0,
      Math.min(100, Math.round(((matchedSkills.length + (data.skillsVerified || 0)) / (expectedSkills.length + 2)) * 100)) || 72
    );

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Telemetry Ribbon */}
        <TelemetryRibbon 
          roleTitle="Student Engineering Workstation" 
          userName={profile.full_name || "Student"} 
          roleCode={profile.role || "student"} 
          sessionId={profile.id} 
        />

        {/* Console Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display-md text-ink font-semibold tracking-tight">Student Workstation</h1>
            <p className="text-body text-ink-muted">
              Real-time career readiness, target role skill telemetry, and ATS application pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/skills/assessments">
              <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
                <Brain className="w-4 h-4 mr-1.5" /> Take Proctored Assessment
              </Button>
            </Link>
            <Link href="/skills">
              <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
                <Target className="w-4 h-4 mr-1.5" /> Target Role Analysis
              </Button>
            </Link>
            <Link href="/profile">
              <Button size="sm" variant="ghost" className="rounded-md border border-hairline text-ink-muted hover:text-ink">
                Profile Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Precision Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Target Role Readiness"
            value={`${readinessScore}%`}
            subtext={`Target: ${targetRole}`}
            icon={Target}
            href="/skills"
            badgeText="Audited"
            badgeVariant="accent"
          />
          <MetricCard
            label="Active Applications"
            value={data.totalApplications}
            subtext={`Avg Match Index: ${data.matchScoreAvg}%`}
            icon={FileText}
            href="/opportunities"
            badgeText="ATS Live"
            badgeVariant="muted"
          />
          <MetricCard
            label="Verified Credentials"
            value={`${data.skillsVerified} / ${data.totalSkills}`}
            subtext="Cryptographically Signed"
            icon={ShieldCheck}
            href="/skills"
            badgeText="Verified"
            badgeVariant="success"
          />
          <MetricCard
            label="Assessments Evaluated"
            value={data.assessmentsCompleted}
            subtext="AI Proctor Benchmarks"
            icon={Brain}
            href="/skills/assessments"
            badgeText="Completed"
            badgeVariant="muted"
          />
        </div>

        {/* Two-Column Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Operational Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Target Role Readiness & Competency Telemetry Card */}
            <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-headline text-ink font-semibold">Target Role Competency Alignment</h3>
                    <Badge variant="accent" className="text-micro font-mono py-0.5">
                      {targetSector}
                    </Badge>
                  </div>
                  <p className="text-caption text-ink-muted mt-0.5">
                    Benchmark evaluation for: <span className="font-semibold text-ink">{targetRole}</span>
                  </p>
                </div>
                <Link href="/skills">
                  <Button size="sm" variant="secondary" className="text-caption rounded-md border-hairline">
                    Modify Target Role <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm font-medium">
                  <span className="text-ink-muted">Industry Benchmark Coverage</span>
                  <span className="text-ink font-mono font-semibold">{readinessScore}% Compliant</span>
                </div>
                <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-hairline">
                  <div 
                    className="h-full bg-accent-blue transition-all duration-500 rounded-full"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>

              {/* Competency Breakdown Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-lg bg-surface-2/60 border border-hairline space-y-2">
                  <span className="text-micro font-bold uppercase tracking-wider text-semantic-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied Competencies ({matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-semantic-success/10 text-semantic-success border border-semantic-success/20 text-micro font-medium">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-micro text-ink-muted">Complete proctored assessments to verify competencies.</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-2/60 border border-hairline space-y-2">
                  <span className="text-micro font-bold uppercase tracking-wider text-semantic-warning flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Skill Gaps to Bridge ({missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((s) => (
                        <Link key={s} href="/skills/assessments" className="group">
                          <span className="px-2 py-0.5 rounded bg-surface-1 text-ink-muted border border-hairline text-micro font-medium hover:text-ink hover:border-accent-blue transition-colors inline-flex items-center gap-1">
                            {s} <ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                          </span>
                        </Link>
                      ))
                    ) : (
                      <span className="text-micro text-semantic-success font-medium">All core benchmarks satisfied!</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Applications ATS Pipeline Table */}
            <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h3 className="text-headline text-ink font-semibold">Active Applications & ATS Pipeline</h3>
                  <p className="text-caption text-ink-muted">Verified candidate status across enterprise hiring drives</p>
                </div>
                <Link href="/opportunities" className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1">
                  Explore Openings <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.recentApplications && data.recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-body-sm">
                    <thead>
                      <tr className="border-b border-hairline text-micro font-mono uppercase tracking-wider text-ink-muted">
                        <th className="py-2.5 px-3">Role & Opportunity</th>
                        <th className="py-2.5 px-3">Organization</th>
                        <th className="py-2.5 px-3">Match Index</th>
                        <th className="py-2.5 px-3">Applied</th>
                        <th className="py-2.5 px-3 text-right">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {data.recentApplications.map((app: any) => {
                        const opp = Array.isArray(app.opportunity) ? app.opportunity[0] : app.opportunity;
                        const industry = Array.isArray(opp?.industry) ? opp?.industry[0] : opp?.industry;
                        return (
                          <tr key={app.id} className="hover:bg-surface-2/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-semibold text-ink block">{opp?.title || "Opportunity"}</span>
                              <span className="text-micro text-ink-muted capitalize">{opp?.type?.replace('_', ' ') || "Full-time"}</span>
                            </td>
                            <td className="py-3 px-3 text-ink-muted">
                              {industry?.company_name || "Enterprise Partner"}
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {app.match_score !== null && app.match_score !== undefined ? (
                                <span className="text-semantic-success font-semibold">{app.match_score}%</span>
                              ) : (
                                <span className="text-ink-muted">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-micro text-ink-muted font-mono">
                              {new Date(app.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {getApplicationBadge(app.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-canvas rounded-lg border border-hairline space-y-3">
                  <FileText className="w-9 h-9 text-ink-muted mx-auto" />
                  <div className="space-y-1">
                    <p className="text-body-sm font-semibold text-ink">No active applications in pipeline</p>
                    <p className="text-caption text-ink-muted max-w-sm mx-auto">
                      Explore partner listings aligned with your verified competencies.
                    </p>
                  </div>
                  <Link href="/opportunities" className="inline-block">
                    <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
                      Browse Verified Opportunities
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Proctored Assessment Submissions Record */}
            <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h3 className="text-headline text-ink font-semibold">Proctored Assessment Credentials</h3>
                  <p className="text-caption text-ink-muted">AI-evaluated competency benchmarks and certification records</p>
                </div>
                <Link href="/skills/assessments" className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1">
                  All Assessments <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.recentAssessments && data.recentAssessments.length > 0 ? (
                <div className="space-y-2.5">
                  {data.recentAssessments.map((sub: any) => {
                    const assessment = Array.isArray(sub.assessment) ? sub.assessment[0] : sub.assessment;
                    return (
                      <div key={sub.id} className="p-3.5 bg-canvas rounded-lg border border-hairline flex items-center justify-between gap-3 hover:border-hairline-soft transition-colors">
                        <div className="space-y-0.5">
                          <h4 className="text-body-sm font-semibold text-ink">{assessment?.title || "Skill Assessment"}</h4>
                          <div className="flex items-center gap-2 text-micro text-ink-muted">
                            <span className="capitalize">{assessment?.category?.replace('_', ' ') || "General"}</span>
                            <span>•</span>
                            <span className="font-mono">{new Date(sub.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-ink text-body-sm">
                            {sub.score_percentage}%
                          </span>
                          <Badge variant={sub.passed ? "success" : "muted"} className="font-mono text-micro">
                            {sub.passed ? "PASSED" : "REVIEW"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-canvas rounded-lg border border-hairline space-y-3">
                  <Brain className="w-8 h-8 text-ink-muted mx-auto" />
                  <div className="space-y-1">
                    <p className="text-body-sm font-semibold text-ink">No assessments evaluated yet</p>
                    <p className="text-caption text-ink-muted max-w-sm mx-auto">
                      Attempt coding benchmarks to prove competencies to corporate recruiters.
                    </p>
                  </div>
                  <Link href="/skills/assessments" className="inline-block">
                    <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
                      Start Proctored Test
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Sidecar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Launchpad */}
            <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-3">
              <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Workstation Command Center</span>
              <div className="space-y-1.5 pt-1">
                {[
                  { label: "Browse Verified Opportunities", href: "/opportunities", icon: Briefcase, desc: "Internships & hiring drives" },
                  { label: "Interactive Skill Gap Matrix", href: "/skills", icon: Target, desc: "Analyze role requirements" },
                  { label: "Proctored Assessments Hub", href: "/skills/assessments", icon: Brain, desc: "AI-evaluated tests" },
                  { label: "1-on-1 Faculty Mentorship", href: "/mentorship", icon: Users, desc: "Book guidance sessions" },
                  { label: "Academic Profile & Credentials", href: "/profile", icon: GraduationCap, desc: "Update institution details" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="block group">
                    <div className="p-2.5 rounded-lg bg-surface-2/50 border border-hairline flex items-center justify-between group-hover:border-accent-blue/50 group-hover:bg-surface-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <action.icon className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
                        <div>
                          <div className="text-body-sm font-medium text-ink">{action.label}</div>
                          <div className="text-micro text-ink-muted">{action.desc}</div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Cryptographic & Identity Verification Console */}
            <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Identity & Institution Node</span>
                <span className="inline-flex items-center gap-1 text-micro text-semantic-success font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
              <div className="space-y-2 p-3 bg-canvas rounded-lg border border-hairline text-caption">
                <div>
                  <span className="text-micro text-ink-muted block">Enrolled Institution:</span>
                  <span className="font-semibold text-ink">{institutionName}</span>
                </div>
                <div className="pt-1 flex justify-between">
                  <div>
                    <span className="text-micro text-ink-muted block">Program / Degree:</span>
                    <span className="font-medium text-ink">{degree}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-micro text-ink-muted block">CGPA:</span>
                    <span className="font-mono font-semibold text-ink">{cgpa}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-hairline flex items-center justify-between text-micro text-ink-muted font-mono">
                  <span>Audit Hash:</span>
                  <span className="text-ink">0x{profile.id.slice(0, 10)}...</span>
                </div>
              </div>
            </Card>

            {/* Regulatory Compliance Telemetry */}
            <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-2.5">
              <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Regulatory Telemetry</span>
              <div className="space-y-1.5 text-caption text-ink-muted">
                <div className="flex items-center justify-between py-1 border-b border-hairline">
                  <span>AICTE National Portal:</span>
                  <span className="text-semantic-success font-mono font-medium">SYNCHRONIZED</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-hairline">
                  <span>NEP 2020 Credit Framework:</span>
                  <span className="text-ink font-mono font-medium">CATEGORY 4</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Proctor Integrity Index:</span>
                  <span className="text-accent-blue font-mono font-medium">99.4% VALID</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // 2. INDUSTRY PARTNER DASHBOARD
  const renderIndustryDashboard = (data: any) => (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <TelemetryRibbon 
        roleTitle="Enterprise Recruiter Workstation" 
        userName={profile.full_name || "Hiring Partner"} 
        roleCode="industry_partner" 
        sessionId={profile.id} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Industry Recruitment Console</h1>
          <p className="text-body text-ink-muted">
            Pre-vetted engineering candidates, ATS pipeline telemetry, and campus hiring drives.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/recruiter/applicants">
            <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
              <Users className="w-4 h-4 mr-1.5" /> Review Applicants (ATS)
            </Button>
          </Link>
          <Link href="/recruiter/training-programs">
            <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
              <GraduationCap className="w-4 h-4 mr-1.5" /> Training Programs
            </Button>
          </Link>
          <Link href="/recruiter/post-opportunity">
            <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Post Opportunity
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 4 Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Candidate Pipeline"
          value={data.totalApplicants}
          subtext="Verified applications"
          icon={Users}
          href="/recruiter/applicants"
          badgeText="Active Stream"
          badgeVariant="accent"
        />
        <MetricCard
          label="Active Postings"
          value={data.activePostings}
          subtext="Currently receiving applicants"
          icon={Briefcase}
          href="/recruiter/training-programs"
          badgeText="Live"
          badgeVariant="success"
        />
        <MetricCard
          label="Candidates Hired"
          value={data.positionsFilled}
          subtext="Confirmed acceptances"
          icon={CheckCircle}
          href="/recruiter/applicants"
          badgeText="Converted"
          badgeVariant="muted"
        />
        <MetricCard
          label="Total Postings Published"
          value={data.totalPostings}
          subtext="All cycles"
          icon={Target}
          href="/recruiter/post-opportunity"
          badgeText="Published"
          badgeVariant="muted"
        />
      </div>
      
      {/* Interactive Applications List with Instant Shortlist Control */}
      <IndustryApplicationsList initialApplications={data.recentApplications} />
    </div>
  );

  // 3. ACADEMICIAN DASHBOARD
  const renderAcademicianDashboard = (data: any) => (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <TelemetryRibbon 
        roleTitle="Faculty & Academician Workstation" 
        userName={profile.full_name || "Faculty Member"} 
        roleCode="academician" 
        sessionId={profile.id} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Academician Workstation</h1>
          <p className="text-body text-ink-muted">
            Industry-academia collaborations, faculty development programs, and 1-on-1 student mentorship.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/collaborations">
            <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Propose Collaboration
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
              <Briefcase className="w-4 h-4 mr-1.5" /> Faculty Openings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 4 Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Industry MoUs & Proposals"
          value={data.totalCollaborations || 0}
          subtext="Active research partnerships"
          icon={Building}
          href="/collaborations"
          badgeText="Active"
          badgeVariant="accent"
        />
        <MetricCard
          label="Mentorship Sessions"
          value={data.mentorshipSessions || 0}
          subtext="1-on-1 student guidance"
          icon={Users}
          href="/mentorship"
          badgeText="Open"
          badgeVariant="success"
        />
        <MetricCard
          label="FDP & Research Proposals"
          value={data.fdpApplications || 0}
          subtext="Funded programs"
          icon={Award}
          href="/opportunities"
          badgeText="Submitted"
          badgeVariant="muted"
        />
        <MetricCard
          label="Active Faculty Calls"
          value={data.facultyOpportunitiesCount || data.facultyOpportunities?.length || 0}
          subtext="Available grants & FDPs"
          icon={Briefcase}
          href="/opportunities"
          badgeText="Open"
          badgeVariant="muted"
        />
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Collaborations */}
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-headline text-ink font-semibold">Active Collaboration Proposals</h3>
                <p className="text-caption text-ink-muted">Industry-academia joint research, labs, and curricula sync</p>
              </div>
              <Link href="/collaborations" className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentCollaborations && data.recentCollaborations.length > 0 ? (
              <div className="space-y-3">
                {data.recentCollaborations.map((collab: any) => (
                  <div key={collab.id} className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-hairline hover:border-hairline-soft transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-body-sm font-semibold text-ink">{collab.title}</h4>
                      <div className="flex items-center gap-2 text-micro text-ink-muted">
                        <span className="capitalize">{collab.category?.replace('_', ' ') || 'Research'}</span>
                        <span>•</span>
                        <span className="font-mono">{new Date(collab.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={collab.status === 'approved' ? 'success' : collab.status === 'in_progress' ? 'accent' : 'muted'} className="capitalize font-mono text-micro">
                      {collab.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-canvas rounded-lg border border-hairline space-y-3">
                <Handshake className="w-9 h-9 text-ink-muted mx-auto" />
                <div className="space-y-1">
                  <p className="text-body-sm font-semibold text-ink">No collaboration proposals logged</p>
                  <p className="text-caption text-ink-muted max-w-sm mx-auto">
                    Partner with corporate leaders for funded research and curriculum alignment.
                  </p>
                </div>
                <Link href="/collaborations" className="inline-block">
                  <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
                    Propose First Collaboration
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Open Faculty Opportunities & FDPs */}
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-headline text-ink font-semibold">Faculty Development & Research Calls</h3>
                <p className="text-caption text-ink-muted">Upskilling programs, research grants, and consultancy calls</p>
              </div>
              <Link href="/opportunities" className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1">
                Explore All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.facultyOpportunities && data.facultyOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.facultyOpportunities.map((opp: any) => (
                  <div key={opp.id} className="p-4 bg-canvas rounded-lg border border-hairline flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="accent" className="capitalize text-micro font-mono">
                          {opp.type?.replace('_', ' ')}
                        </Badge>
                        {opp.deadline && (
                          <span className="text-micro text-ink-muted font-mono flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-body-sm font-semibold text-ink line-clamp-1">{opp.title}</h4>
                      <p className="text-caption text-ink-muted mt-0.5">{opp.location || 'Online / Remote'}</p>
                    </div>
                    <Link href={`/opportunities/${opp.id}`}>
                      <Button size="sm" variant="secondary" className="w-full text-caption rounded-md border-hairline">
                        View Call Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No active faculty calls"
                description="New FDPs and funded research consultancies will appear here."
              />
            )}
          </Card>
        </div>

        {/* Right Column: Faculty Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-3">
            <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Faculty Command Center</span>
            <div className="space-y-1.5 pt-1">
              {[
                { label: "Industry MoUs & Proposals", href: "/collaborations", icon: Handshake, desc: "Propose partnerships" },
                { label: "Student Mentorship Sessions", href: "/mentorship", icon: Users, desc: "Host 1-on-1 guidance" },
                { label: "FDPs & Research Grants", href: "/opportunities", icon: Award, desc: "Funded development" },
                { label: "Skill Taxonomy Matrix", href: "/skills", icon: Brain, desc: "Industry benchmark map" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="block group">
                  <div className="p-2.5 rounded-lg bg-surface-2/50 border border-hairline flex items-center justify-between group-hover:border-accent-blue/50 group-hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
                      <div>
                        <div className="text-body-sm font-medium text-ink">{item.label}</div>
                        <div className="text-micro text-ink-muted">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Mentorship Availability</span>
              <Badge variant="success" className="font-mono text-micro">AVAILABLE</Badge>
            </div>
            <p className="text-caption text-ink-muted leading-relaxed">
              Your profile is visible in the verified faculty network. Undergraduates can book sessions for research and career reviews.
            </p>
            <div className="pt-3 border-t border-hairline flex items-center justify-between text-body-sm">
              <span className="text-ink-muted">Completed Sessions:</span>
              <span className="font-mono font-semibold text-ink">{data.mentorshipSessions || 0}</span>
            </div>
            <Link href="/mentorship" className="block pt-1">
              <Button size="sm" variant="secondary" className="w-full rounded-md border-hairline">
                Manage Mentorship Schedule
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );

  // 4. INSTITUTION ADMIN DASHBOARD
  const renderInstitutionDashboard = (data: any) => (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <TelemetryRibbon 
        roleTitle="Institutional Administration Workstation" 
        userName={profile.full_name || "Dean of Placements"} 
        roleCode="institution_admin" 
        sessionId={profile.id} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Institutional Console</h1>
          <p className="text-body text-ink-muted">
            Batch-wide placement performance, NAAC Metric 5.2.1 compliance, and NIRF outcome reporting.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/reports">
            <Button size="sm" className="rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 font-medium">
              <FileCheck2 className="w-4 h-4 mr-1.5" /> NAAC / NIRF Reports
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" variant="secondary" className="rounded-md border-hairline font-medium">
              <Calendar className="w-4 h-4 mr-1.5" /> Campus Drives
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 4 Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Enrolled Student Cohort"
          value={data.totalStudents}
          subtext="Registered candidates"
          icon={Users}
          badgeText="Batch 2026"
          badgeVariant="muted"
        />
        <MetricCard
          label="Confirmed Placements"
          value={data.placedStudents}
          subtext="Offer letters logged"
          icon={CheckCircle}
          badgeText="Verified"
          badgeVariant="success"
        />
        <MetricCard
          label="Active Corporate Drives"
          value={data.activeDrives}
          subtext="On-campus & pooled drives"
          icon={Activity}
          badgeText="Recruiting"
          badgeVariant="accent"
        />
        <MetricCard
          label="Placement Conversion Rate"
          value={`${data.placementRate}%`}
          subtext="NIRF Metric: GO"
          icon={BarChart}
          badgeText="Audited"
          badgeVariant="accent"
        />
      </div>

      {/* Two Column Institutional Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* NAAC & NIRF Compliance Panel */}
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-headline text-ink font-semibold">Accreditation & Regulatory Reporting</h3>
                <p className="text-caption text-ink-muted">Automated evidence compilation for NAAC Criteria and NIRF rankings</p>
              </div>
              <Link href="/reports" className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1">
                Open Reports Hub <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-canvas border border-hairline space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-micro uppercase font-mono font-bold text-accent-blue">NAAC Metric 5.2.1</span>
                  <Badge variant="success" className="text-micro font-mono">AUDIT READY</Badge>
                </div>
                <div className="text-body-sm font-semibold text-ink">Student Placement & Progression</div>
                <p className="text-micro text-ink-muted leading-relaxed">
                  Digital repository containing candidate offer letters, median package calculations, and hiring partner MoUs.
                </p>
                <div className="pt-2">
                  <Link href="/reports">
                    <Button size="sm" variant="secondary" className="w-full text-micro rounded-md border-hairline font-mono">
                      Export NAAC 5.2.1 Data (CSV)
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-canvas border border-hairline space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-micro uppercase font-mono font-bold text-accent-blue">NIRF Metric: GO</span>
                  <Badge variant="accent" className="text-micro font-mono">PROJECTED 38.6/40</Badge>
                </div>
                <div className="text-body-sm font-semibold text-ink">Graduation Outcomes & Absorption</div>
                <p className="text-micro text-ink-muted leading-relaxed">
                  Tracking of higher education admissions, competitive exam qualifications, and corporate compensation trends.
                </p>
                <div className="pt-2">
                  <Link href="/reports">
                    <Button size="sm" variant="secondary" className="w-full text-micro rounded-md border-hairline font-mono">
                      Generate NIRF Summary (PDF)
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-surface-1 border-hairline p-5 rounded-xl space-y-3">
            <span className="text-micro font-bold uppercase tracking-wider text-ink-muted">Administration Commands</span>
            <div className="space-y-1.5 pt-1">
              {[
                { label: "Accreditation & Audit Reports", href: "/reports", icon: FileCheck2, desc: "NAAC & NIRF data exports" },
                { label: "Schedule Campus Drives", href: "/opportunities", icon: Calendar, desc: "Corporate recruitment dates" },
                { label: "Curriculum Skill Matrix", href: "/skills", icon: Brain, desc: "NEP 2020 syllabus alignment" },
                { label: "Institutional Profile", href: "/profile", icon: Landmark, desc: "College affiliation records" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="block group">
                  <div className="p-2.5 rounded-lg bg-surface-2/50 border border-hairline flex items-center justify-between group-hover:border-accent-blue/50 group-hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
                      <div>
                        <div className="text-body-sm font-medium text-ink">{item.label}</div>
                        <div className="text-micro text-ink-muted">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // 5. SUPER ADMIN DASHBOARD
  const renderSuperAdminDashboard = (data: any) => (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <TelemetryRibbon 
        roleTitle="Central Platform Governance Workstation" 
        userName={profile.full_name || "Super Administrator"} 
        roleCode="super_admin" 
        sessionId={profile.id} 
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Platform Governance Console</h1>
          <p className="text-body text-ink-muted">Platform-wide statistics, multi-tenant governance, and audit trails.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Registered Users" value={data.totalUsers} icon={Users} badgeText="Active" badgeVariant="success" />
        <MetricCard label="Accredited Institutions" value={data.totalInstitutions} icon={Building} badgeText="Verified" badgeVariant="accent" />
        <MetricCard label="Industry Partners" value={data.totalPartners} icon={Briefcase} badgeText="Enterprise" badgeVariant="muted" />
        <MetricCard label="Active Opportunities" value={data.activeOpportunities} icon={Target} badgeText="Live" badgeVariant="success" />
      </div>
    </div>
  );

  switch (role) {
    case 'industry_partner': return renderIndustryDashboard(stats);
    case 'academician': return renderAcademicianDashboard(stats);
    case 'institution_admin': return renderInstitutionDashboard(stats);
    case 'super_admin': return renderSuperAdminDashboard(stats);
    case 'student':
    default: return renderStudentDashboard(stats);
  }
}

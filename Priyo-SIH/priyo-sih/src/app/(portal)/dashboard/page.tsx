import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getDashboardStats, getProfile } from '@/queries/dashboard';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Brain, Target, CheckCircle, 
  Briefcase, Users, Building,
  Activity, Award, BarChart,
  PlusCircle, ArrowUpRight, Handshake, Landmark, Clock, BookOpen, GraduationCap
} from 'lucide-react';
import { IndustryApplicationsList } from './industry-applications-list';

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
          description="There was an issue loading your dashboard data." 
        />
      </div>
    );
  }

  const role = (profile.role === 'academician' || stats.role === 'academician') 
    ? 'academician' 
    : (profile.role || stats.role);

  // Dashboard content by role
  const renderStudentDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Student Dashboard</h1>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Track your career readiness and opportunities.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: data.totalApplications, icon: FileText },
          { label: 'Skills Verified', value: data.skillsVerified, icon: CheckCircle },
          { label: 'Match Score Avg', value: `${data.matchScoreAvg}%`, icon: Target },
          { label: 'Assessments', value: data.assessmentsCompleted, icon: Brain },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface-1 border-hairline p-6 rounded-xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-ink" />
            </div>
            <div>
              <div className="text-display-md text-ink leading-none">{stat.value}</div>
              <div className="text-caption text-ink-muted mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-surface-1 border-hairline p-6 rounded-xl col-span-2">
          <h3 className="text-headline text-ink mb-4">Recent Applications</h3>
          {data.recentApplications && data.recentApplications.length > 0 ? (
            <div className="space-y-4">
              {data.recentApplications.map((app: any) => {
                const industry = Array.isArray(app.opportunity?.industry) ? app.opportunity?.industry[0] : app.opportunity?.industry;
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-canvas rounded-md border border-hairline">
                    <div>
                      <h4 className="text-body-sm font-medium text-ink">{app.opportunity?.title}</h4>
                      <p className="text-caption text-ink-muted">{industry?.company_name || 'Industry Partner'}</p>
                    </div>
                    <div className="text-caption text-accent-blue bg-accent-blue/10 px-2 py-1 rounded-sm capitalize">
                      {app.status?.replace('_', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Start applying to opportunities to see them here."
            />
          )}
        </Card>
        
        <Card className="bg-surface-1 border-hairline p-6 rounded-xl">
          <h3 className="text-headline text-ink mb-4">Skill Gap Analysis</h3>
          <div className="h-48 flex items-center justify-center bg-canvas rounded-md border border-hairline p-4 text-center">
            <span className="text-caption text-ink-muted">Complete more assessments to generate your skill gap analysis.</span>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderIndustryDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-display-md text-ink">Industry Dashboard</h1>
            <Badge variant="accent" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Briefcase className="w-3 h-3 mr-1" />
              Recruiter & Training Portal
            </Badge>
          </div>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Review candidates, shortlist applicants, and manage programs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/recruiter/applicants">
            <Button size="sm" className="rounded-pill bg-accent-blue text-white hover:opacity-90">
              <Users className="w-4 h-4 mr-1.5" />
              Review Applicants (ATS)
            </Button>
          </Link>
          <Link href="/recruiter/training-programs">
            <Button size="sm" variant="secondary" className="rounded-pill">
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Training Programs
            </Button>
          </Link>
          <Link href="/recruiter/post-opportunity">
            <Button size="sm" variant="secondary" className="rounded-pill">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Post Opportunity
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applicants', value: data.totalApplicants, icon: Users, href: '/recruiter/applicants' },
          { label: 'Active Postings', value: data.activePostings, icon: Briefcase, href: '/recruiter/training-programs' },
          { label: 'Positions Filled', value: data.positionsFilled, icon: CheckCircle, href: '/recruiter/applicants' },
          { label: 'Total Postings', value: data.totalPostings, icon: Target, href: '/recruiter/post-opportunity' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="group">
            <Card className="bg-surface-1 border-hairline p-5 rounded-xl flex items-center space-x-4 transition-all hover:border-accent-blue/40 hover:shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-ink group-hover:text-accent-blue group-hover:bg-accent-blue/10 transition-colors">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-display-md text-ink leading-none">{stat.value}</div>
                <div className="text-caption text-ink-muted mt-1 truncate">{stat.label}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Interactive Applications List with Instant Shortlist Control */}
      <IndustryApplicationsList initialApplications={data.recentApplications} />
    </div>
  );

  const renderAcademicianDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-display-md text-ink">Academician Dashboard</h1>
            <Badge variant="accent" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Landmark className="w-3 h-3 mr-1" />
              Faculty Portal
            </Badge>
          </div>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Track faculty development, industry collaborations, and student mentorship.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/collaborations">
            <Button size="sm" className="rounded-pill">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Propose Collaboration
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" variant="secondary" className="rounded-pill">
              <Briefcase className="w-4 h-4 mr-1.5" />
              Faculty Openings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Industry Collaborations', value: data.totalCollaborations || 0, icon: Building, href: '/collaborations' },
          { label: 'Mentorship Sessions', value: data.mentorshipSessions || 0, icon: Users, href: '/mentorship' },
          { label: 'FDP & Training Applications', value: data.fdpApplications || 0, icon: Award, href: '/opportunities' },
          { label: 'Active Faculty Openings', value: data.facultyOpportunitiesCount || data.facultyOpportunities?.length || 0, icon: Briefcase, href: '/opportunities' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="group">
            <Card className="bg-surface-1 border-hairline p-5 rounded-xl flex items-center space-x-4 transition-all hover:border-accent-blue/40 hover:shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-ink group-hover:text-accent-blue group-hover:bg-accent-blue/10 transition-colors">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-display-md text-ink leading-none">{stat.value}</div>
                <div className="text-caption text-ink-muted mt-1 truncate">{stat.label}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Collaborations */}
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-headline text-ink">Recent Collaboration Proposals</h3>
                <p className="text-caption text-ink-muted">Industry-academia research, lab setups, and curricula sync</p>
              </div>
              <Link href="/collaborations" className="text-caption text-accent-blue hover:underline flex items-center">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {data.recentCollaborations && data.recentCollaborations.length > 0 ? (
              <div className="space-y-3">
                {data.recentCollaborations.map((collab: any) => (
                  <div key={collab.id} className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-hairline hover:border-hairline-soft transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-body-sm font-semibold text-ink">{collab.title}</h4>
                      <div className="flex items-center space-x-2 text-caption text-ink-muted">
                        <span className="capitalize">{collab.category?.replace('_', ' ') || 'Research'}</span>
                        <span>•</span>
                        <span>{new Date(collab.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={collab.status === 'approved' ? 'success' : collab.status === 'in_progress' ? 'accent' : 'muted'} className="capitalize">
                      {collab.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-canvas rounded-lg border border-hairline space-y-3">
                <Handshake className="w-10 h-10 text-ink-muted mx-auto" />
                <div className="space-y-1">
                  <p className="text-body-sm font-medium text-ink">No collaboration proposals yet</p>
                  <p className="text-caption text-ink-muted max-w-sm mx-auto">
                    Partner with industry leaders for joint research, curriculum co-creation, and student internships.
                  </p>
                </div>
                <Link href="/collaborations" className="inline-block">
                  <Button size="sm" className="rounded-pill">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Propose First Collaboration
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Open Faculty Opportunities & FDPs */}
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-headline text-ink">Faculty Development & Research Calls</h3>
                <p className="text-caption text-ink-muted">Upskilling programs, research grants, and consultancy positions</p>
              </div>
              <Link href="/opportunities" className="text-caption text-accent-blue hover:underline flex items-center">
                Explore All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {data.facultyOpportunities && data.facultyOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.facultyOpportunities.map((opp: any) => (
                  <div key={opp.id} className="p-4 bg-canvas rounded-lg border border-hairline flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="accent" className="capitalize text-micro">
                          {opp.type?.replace('_', ' ')}
                        </Badge>
                        {opp.deadline && (
                          <span className="text-micro text-ink-muted flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-body-sm font-semibold text-ink line-clamp-1">{opp.title}</h4>
                      <p className="text-caption text-ink-muted mt-0.5">{opp.location || 'Online / Remote'}</p>
                    </div>
                    <Link href={`/opportunities/${opp.id}`}>
                      <Button size="sm" variant="secondary" className="w-full text-caption rounded-pill">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No active faculty postings"
                description="New FDPs and research consultancies from partner institutions and industry will appear here."
              />
            )}
          </Card>
        </div>

        {/* Right Column: Quick Links & Mentorship */}
        <div className="space-y-6">
          <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
            <h3 className="text-headline text-ink">Faculty Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/collaborations" className="block">
                <div className="p-3 bg-canvas hover:bg-surface-2 rounded-lg border border-hairline flex items-center justify-between transition-colors">
                  <div className="flex items-center space-x-3">
                    <Handshake className="w-5 h-5 text-accent-blue" />
                    <div>
                      <div className="text-body-sm font-medium text-ink">Industry MoUs</div>
                      <div className="text-micro text-ink-muted">Propose & manage partnerships</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-muted" />
                </div>
              </Link>
              <Link href="/mentorship" className="block">
                <div className="p-3 bg-canvas hover:bg-surface-2 rounded-lg border border-hairline flex items-center justify-between transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className="text-body-sm font-medium text-ink">Student Mentorship</div>
                      <div className="text-micro text-ink-muted">Host 1-on-1 guidance sessions</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-muted" />
                </div>
              </Link>
              <Link href="/opportunities" className="block">
                <div className="p-3 bg-canvas hover:bg-surface-2 rounded-lg border border-hairline flex items-center justify-between transition-colors">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-body-sm font-medium text-ink">FDPs & Grants</div>
                      <div className="text-micro text-ink-muted">Apply for funded development</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-muted" />
                </div>
              </Link>
              <Link href="/skills" className="block">
                <div className="p-3 bg-canvas hover:bg-surface-2 rounded-lg border border-hairline flex items-center justify-between transition-colors">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-body-sm font-medium text-ink">Skill Taxonomy</div>
                      <div className="text-micro text-ink-muted">View industry alignment matrix</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-muted" />
                </div>
              </Link>
            </div>
          </Card>

          <Card className="bg-surface-1 border-hairline p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-headline text-ink">Mentorship Status</h3>
              <Badge variant="success">Open</Badge>
            </div>
            <p className="text-caption text-ink-muted leading-relaxed">
              Your profile is visible in the faculty mentorship network. Students can discover you for project feedback and career advice.
            </p>
            <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between text-body-sm">
              <span className="text-ink-muted">Total Sessions:</span>
              <span className="font-semibold text-ink">{data.mentorshipSessions || 0}</span>
            </div>
            <Link href="/mentorship" className="mt-4 block">
              <Button size="sm" variant="secondary" className="w-full rounded-pill">
                Manage Mentorship Schedule
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderInstitutionDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Institution Dashboard</h1>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Overview of student placements and industry drives.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: data.totalStudents, icon: Users },
          { label: 'Placed Students', value: data.placedStudents, icon: CheckCircle },
          { label: 'Active Drives', value: data.activeDrives, icon: Activity },
          { label: 'Placement Rate', value: `${data.placementRate}%`, icon: BarChart },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface-1 border-hairline p-6 rounded-xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-ink" />
            </div>
            <div>
              <div className="text-display-md text-ink leading-none">{stat.value}</div>
              <div className="text-caption text-ink-muted mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSuperAdminDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Platform Dashboard</h1>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Platform-wide statistics and management.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.totalUsers, icon: Users },
          { label: 'Institutions', value: data.totalInstitutions, icon: Building },
          { label: 'Industry Partners', value: data.totalPartners, icon: Briefcase },
          { label: 'Active Opportunities', value: data.activeOpportunities, icon: Target },
        ].map((stat, i) => (
          <Card key={i} className="bg-surface-1 border-hairline p-6 rounded-xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-ink" />
            </div>
            <div>
              <div className="text-display-md text-ink leading-none">{stat.value}</div>
              <div className="text-caption text-ink-muted mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
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

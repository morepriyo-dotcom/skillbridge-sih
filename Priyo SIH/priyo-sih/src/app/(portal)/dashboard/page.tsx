import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getDashboardStats, getProfile } from '@/queries/dashboard';
import { EmptyState } from '@/components/empty-state';
import { 
  FileText, Brain, Target, CheckCircle, 
  Briefcase, Users, Building,
  Activity, Award, BarChart
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profile, stats] = await Promise.all([
    getProfile(),
    getDashboardStats()
  ]);

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

  const role = stats.role;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Industry Dashboard</h1>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Manage your opportunities and find top talent.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Postings', value: data.activePostings, icon: Briefcase },
          { label: 'Total Applicants', value: data.totalApplicants, icon: Users },
          { label: 'Positions Filled', value: data.positionsFilled, icon: CheckCircle },
          { label: 'Total Postings', value: data.totalPostings, icon: Target },
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
      
      <Card className="bg-surface-1 border-hairline p-6 rounded-xl">
        <h3 className="text-headline text-ink mb-4">Recent Applications Received</h3>
        {data.recentApplications && data.recentApplications.length > 0 ? (
          <div className="space-y-4">
            {data.recentApplications.map((app: any) => {
              const applicantName = Array.isArray(app.applicant) ? app.applicant[0]?.full_name : app.applicant?.full_name;
              return (
                <div key={app.id} className="flex items-center justify-between p-4 bg-canvas rounded-md border border-hairline">
                  <div>
                    <h4 className="text-body-sm font-medium text-ink">{app.opportunity?.title}</h4>
                    <p className="text-caption text-ink-muted">Applicant: {applicantName || 'Anonymous'}</p>
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
            title="No applications received"
            description="You haven't received any new applications yet."
          />
        )}
      </Card>
    </div>
  );

  const renderAcademicianDashboard = (data: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Academician Dashboard</h1>
          <p className="text-body text-ink-muted">Welcome back, {profile.full_name}! Track collaborations and faculty development programs.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Collaborations', value: data.totalCollaborations, icon: Building },
          { label: 'Mentorship Sessions', value: data.mentorshipSessions, icon: Users },
          { label: 'FDP Applications', value: data.fdpApplications, icon: Award },
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

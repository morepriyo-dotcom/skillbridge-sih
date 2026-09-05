import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { getProfile } from '@/queries/dashboard';

export default async function StudentPortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await getProfile();
  if (!profile) redirect('/login');

  const studentDetails = profile.details;

  // Fetch verified user skills
  const { data: userSkillsRaw } = await supabase
    .from('user_skills')
    .select('id, proficiency, verified, verification_source, created_at, skill:skills_master(name, category, sector)')
    .eq('user_id', user.id)
    .eq('verified', true);
  const userSkills = userSkillsRaw || [];

  // Fetch assessment submissions
  const { data: submissionsRaw } = await supabase
    .from('assessment_submissions')
    .select('id, score, passed, completed_at, assessment:assessments(title, category)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });
  const submissions = submissionsRaw || [];

  // Fetch hired/completed applications for experience
  const { data: appsRaw } = await supabase
    .from('applications')
    .select('id, status, created_at, opportunity:opportunities(title, type, industry:industry_partners(company_name))')
    .eq('applicant_id', user.id)
    .in('status', ['hired', 'completed']);
  const experiences = appsRaw || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Portfolio Header */}
      <Card className="p-8 bg-surface-1 border-hairline">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full bg-surface-2 border-2 border-accent-blue/30 flex items-center justify-center text-display-md text-ink font-bold">
              {getInitials(profile.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-display-md text-ink font-medium">{profile.full_name}</h1>
                <Badge variant="success" className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </Badge>
              </div>
              {studentDetails ? (
                <>
                  <p className="text-body text-ink-muted mt-0.5">
                    {studentDetails.degree} &bull; {studentDetails.department}
                  </p>
                  <p className="text-caption text-ink-muted">
                    {(() => {
                      const inst = Array.isArray(studentDetails.institution)
                        ? studentDetails.institution[0]
                        : studentDetails.institution;
                      return inst?.name || 'Institution';
                    })()}
                    {studentDetails.cgpa && <> &bull; CGPA: {studentDetails.cgpa}</>}
                  </p>
                </>
              ) : (
                <p className="text-body text-ink-muted mt-0.5 capitalize">
                  {profile.role?.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="rounded-pill">
              <Share2 className="w-4 h-4 mr-2" /> Share Profile
            </Button>
            <Button className="rounded-pill bg-ink text-canvas hover:opacity-90">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Verified Skills */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-headline flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-blue" /> Verified Skills
              </CardTitle>
              <CardDescription>
                Skills endorsed by assessments or verified by faculty
              </CardDescription>
            </div>
            <Badge variant="accent">{userSkills.length} Verified</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {userSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userSkills.map((us: any) => {
                const skill = Array.isArray(us.skill) ? us.skill[0] : us.skill;
                return (
                  <div key={us.id} className="p-4 rounded-xl border border-semantic-success/40 bg-semantic-success/5">
                    <div className="flex justify-between items-start">
                      <CheckCircle2 className="w-5 h-5 text-semantic-success" />
                      <span className="text-[10px] text-ink-muted">{formatDate(us.created_at)}</span>
                    </div>
                    <h4 className="text-body-sm font-semibold text-ink mt-2">{skill?.name}</h4>
                    <p className="text-micro text-ink-muted mt-1">{skill?.category}</p>
                    <p className="text-micro text-ink-muted capitalize">{us.proficiency} &bull; {us.verification_source?.replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-body-sm text-ink-muted">No verified skills yet. Complete an assessment to earn verified badges.</p>
          )}
        </CardContent>
      </Card>

      {/* Assessment Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-headline flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-blue" /> Assessment Credentials
          </CardTitle>
          <CardDescription>Records of completed evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {submissions.map((sub: any) => {
                const assessment = Array.isArray(sub.assessment) ? sub.assessment[0] : sub.assessment;
                return (
                  <div key={sub.id} className="p-4 rounded-xl border border-accent-blue/40 bg-accent-blue/5">
                    <div className="flex justify-between items-start">
                      <Award className="w-5 h-5 text-accent-blue" />
                      <span className="text-[10px] text-ink-muted">
                        {sub.completed_at ? formatDate(sub.completed_at) : 'Pending'}
                      </span>
                    </div>
                    <h4 className="text-body-sm font-semibold text-ink mt-2">{assessment?.title || 'Assessment'}</h4>
                    <p className="text-micro text-ink-muted mt-1">{assessment?.category}</p>
                    <div className="mt-3 pt-2 border-t border-hairline flex justify-between items-center text-micro">
                      <span className="font-bold text-accent-blue">{Math.round(sub.score)}%</span>
                      {sub.passed ? (
                        <Badge variant="success" className="text-[10px]">Passed</Badge>
                      ) : (
                        <Badge variant="error" className="text-[10px]">Not Passed</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-body-sm text-ink-muted">No assessment credentials yet. Take an assessment to earn badges.</p>
          )}
        </CardContent>
      </Card>

      {/* Industry Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-headline flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-blue" /> Industry Experience
          </CardTitle>
          <CardDescription>Verified internships and accepted positions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.length > 0 ? (
            experiences.map((app: any) => {
              const opp = Array.isArray(app.opportunity) ? app.opportunity[0] : app.opportunity;
              const ind = Array.isArray(opp?.industry) ? opp?.industry[0] : opp?.industry;
              return (
                <div key={app.id} className="p-5 bg-surface-2 rounded-xl border border-hairline">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h4 className="text-body font-semibold text-ink">{opp?.title}</h4>
                      <p className="text-body-sm text-accent-blue">
                        {ind?.company_name || 'Company'} &bull; {opp?.type?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-micro text-ink-muted">{formatDate(app.created_at)}</span>
                      <Badge variant="success" className="ml-2 capitalize">{app.status}</Badge>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-body-sm text-ink-muted">No internship or work experience recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

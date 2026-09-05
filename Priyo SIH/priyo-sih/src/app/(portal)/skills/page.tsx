import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserSkills, getSkillTaxonomy, getAvailableAssessments } from '@/queries/skills';
import { SkillRadarChart } from '@/components/skills/skill-radar-chart';
import { CheckCircle2, AlertCircle, Plus, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function SkillsPage() {
  const userSkills = await getUserSkills();
  const taxonomy = await getSkillTaxonomy();
  const availableAssessments = await getAvailableAssessments();

  // Prepare radar chart data
  const radarData = userSkills.slice(0, 6).map((item: any) => {
    const weights: Record<string, number> = {
      beginner: 40,
      intermediate: 65,
      advanced: 85,
      expert: 98,
    };
    const skillName = Array.isArray(item.skill) ? item.skill[0]?.name : item.skill?.name;
    return {
      skill: skillName || 'Skill',
      userScore: item.verified ? (weights[item.proficiency] || 60) : (weights[item.proficiency] || 50) - 10,
      industryBenchmark: 80,
    };
  });

  const displayRadar = radarData.length >= 3 ? radarData : undefined;

  // Determine recommended skills
  const userSkillIds = userSkills.map((us: any) => us.skill_id);
  const recommendedUpskilling = taxonomy
    .filter((t: any) => !userSkillIds.includes(t.id))
    .slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Skill Mapping & Profiling</h1>
          <p className="text-body text-ink-muted mt-1">
            Evaluate competencies, identify industry gaps, and get verified credentials.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/skills/assessments">
            <Button className="rounded-pill">
              <Sparkles className="w-4 h-4 mr-2" /> Take Skill Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-headline">Skill Gap Analysis</CardTitle>
                <CardDescription>
                  Your current verified competencies compared against benchmark industry standards
                </CardDescription>
              </div>
              <Badge variant="accent">AI Powered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SkillRadarChart data={displayRadar} />
          </CardContent>
        </Card>

        {/* Action / Recommendations Card */}
        <div className="space-y-6">
          <Card className="bg-surface-2 border-hairline">
            <CardHeader>
              <CardTitle className="text-headline flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-blue" /> Recommended Upskilling
              </CardTitle>
              <CardDescription>
                Skills with highest industry demand missing from your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedUpskilling.length > 0 ? (
                recommendedUpskilling.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-surface-1 rounded-md border border-hairline flex justify-between items-center"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-ink">{item.name}</p>
                      <p className="text-micro text-ink-muted">{item.sector}</p>
                    </div>
                    <Badge variant="warning">High Demand</Badge>
                  </div>
                ))
              ) : (
                <div className="text-body-sm text-ink-muted py-2 text-center">
                  You have acquired all core skills!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-accent-blue/30 bg-accent-blue/5">
            <CardHeader>
              <CardTitle className="text-headline flex items-center gap-2 text-ink">
                <ShieldCheck className="w-5 h-5 text-accent-blue" /> Verified Badges
              </CardTitle>
              <CardDescription>
                Complete skill assessments to get automated verification badges on your digital portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/skills/assessments">
                <Button variant="secondary" className="w-full rounded-pill">
                  Explore {availableAssessments.length > 0 ? `${availableAssessments.length}+` : ''} Available Tests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Skills Inventory */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-headline">Your Skills Inventory</CardTitle>
              <CardDescription>
                {userSkills.length} skills listed in your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userSkills.length === 0 ? (
            <div className="py-12 text-center text-ink-muted space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-body">No skills added yet. Complete an assessment or add skills to begin.</p>
              <Link href="/skills/assessments">
                <Button className="rounded-pill">Browse Assessments</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((item: any) => {
                const s = Array.isArray(item.skill) ? item.skill[0] : item.skill;
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-surface-2 rounded-xl border border-hairline flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-body font-medium text-ink">{s?.name || 'Skill'}</h4>
                        <p className="text-micro text-ink-muted mt-0.5">{s?.category || 'General'} &bull; {s?.sector || 'General'}</p>
                      </div>
                      {item.verified ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="muted">Self Declared</Badge>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-hairline flex justify-between items-center">
                      <span className="text-micro text-ink-muted capitalize">
                        Level: <strong className="text-ink">{item.proficiency}</strong>
                      </span>
                      <span className="text-micro text-ink-muted">
                        Source: {item.verification_source?.replace('_', ' ') || 'Assessment'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

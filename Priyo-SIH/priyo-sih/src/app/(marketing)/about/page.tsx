import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Landmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

export const metadata = {
  title: 'About Us | SkillBridge',
  description: 'Learn about SkillBridge, our mission to bridge campus to corporate, and how we empower students, faculty, and industry.',
};

export default function AboutPage() {
  const pillars = [
    {
      icon: GraduationCap,
      role: 'Students',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description:
        'Access standardized, industry-verified skill assessments, earn verifiable digital credentials, complete structured internships with mentor feedback, and secure top-tier placements.',
      points: [
        'Objective skill benchmark tests',
        'Digital badges & competency portfolios',
        '1-on-1 industry mentorship',
        'Direct internship & job applications',
      ],
    },
    {
      icon: Landmark,
      role: 'Faculty & Academicians',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description:
        'Connect with enterprise R&D departments, lead corporate-sponsored research, apply for Faculty Development Programs (FDPs), and align curriculums with modern industry standards.',
      points: [
        'Industry joint research calls',
        'Corporate consultancy opportunities',
        'FDP & upskilling applications',
        'Student talent mentorship tracking',
      ],
    },
    {
      icon: Briefcase,
      role: 'Industry Partners',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description:
        'Bypass resume spam with verified candidate skill metrics. Post internship and job openings, sponsor corporate training programs, and partner directly with higher education institutions.',
      points: [
        'Pre-verified skill scorecards',
        'Kanban applicant tracking & review',
        'Collaborative research MoUs',
        'Targeted on-campus placement drives',
      ],
    },
    {
      icon: Building2,
      role: 'Institutions',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description:
        'Empower placement cells and deans with real-time cohort skill analytics, comprehensive placement tracking, and audit-ready data for NAAC and NIRF accreditation.',
      points: [
        'Cohort skill-gap analysis',
        'Placement drive management',
        'NAAC & NIRF automated reporting',
        'Enterprise partnership directory',
      ],
    },
  ];

  const milestones = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To eliminate the graduate unemployability gap by creating a unified national infrastructure that continuously syncs university education with industry technology requirements.',
    },
    {
      icon: Sparkles,
      title: 'Smart India Hackathon Roots',
      description:
        'Designed and engineered under Problem Statement PS 26044 to provide an end-to-end, multi-stakeholder collaboration platform built for Indian higher education.',
    },
    {
      icon: ShieldCheck,
      title: 'Integrity & Verification',
      description:
        'Moving beyond self-declared resumes by anchoring student qualifications to proctored assessments, mentor evaluations, and tamper-evident skill matrices.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Innovation',
      description:
        'Integrating dynamic market skill taxonomies, automated matchmaking, and data-driven insights to foster impactful university-industry synergies.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Header */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <Badge variant="accent" className="text-body-sm px-4 py-1 mb-6">
          Problem Statement PS 26044 — Academia-Industry Collaboration
        </Badge>
        <h1 className="text-display-lg text-ink font-bold tracking-tight leading-tight">
          Bridging the Gap Between <br className="hidden sm:inline" />
          <span className="text-accent-blue">Campus Learning</span> &{' '}
          <span className="text-ink">Corporate Excellence</span>
        </h1>
        <p className="text-body text-ink-muted mt-6 max-w-3xl mx-auto leading-relaxed text-lg">
          SkillBridge is a unified national platform engineered to bridge the divide between higher education institutions, students, faculty, and industry enterprises through verified competency assessments, structured internships, and active research partnerships.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button className="rounded-pill px-6 h-11 font-medium">
              Join the Platform <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button variant="secondary" className="rounded-pill px-6 h-11 font-medium">
              Browse Open Opportunities
            </Button>
          </Link>
        </div>
      </section>

      {/* Mission & Purpose Grid */}
      <section className="border-y border-hairline bg-surface-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-md text-ink font-semibold tracking-tight">
              Why SkillBridge Exists
            </h2>
            <p className="text-body text-ink-muted mt-2 max-w-2xl mx-auto">
              Solving the systemic disconnect between what colleges teach and what industry hires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((item) => (
              <Card key={item.title} className="p-6 bg-surface-2/60 border border-hairline space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-headline text-ink font-semibold">{item.title}</h3>
                <p className="text-body-sm text-ink-muted leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The 4 Stakeholders */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-display-md text-ink font-semibold tracking-tight">
            An Ecosystem Built for Everyone
          </h2>
          <p className="text-body text-ink-muted mt-2 max-w-2xl mx-auto">
            Each participant has a dedicated portal designed for their exact workflow and objectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.role} className="p-8 border border-hairline flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${pillar.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-headline text-ink font-bold">{pillar.role}</h3>
                      <span className="text-caption text-ink-muted">Dedicated Portal & Tooling</span>
                    </div>
                  </div>

                  <p className="text-body text-ink-muted leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="border-t border-hairline pt-4 space-y-2">
                    {pillar.points.map((point) => (
                      <div key={point} className="flex items-center space-x-2 text-body-sm text-ink">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link href={`/register?role=${pillar.role === 'Students' ? 'student' : pillar.role === 'Faculty & Academicians' ? 'academician' : pillar.role === 'Industry Partners' ? 'industry_partner' : 'institution_admin'}`}>
                    <Button variant="secondary" className="w-full rounded-pill text-body-sm font-medium">
                      Register as {pillar.role.split(' ')[0]}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Accreditation & Trust Bar */}
      <section className="bg-surface-1 border-t border-hairline py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-display-md text-ink font-bold">
            Built for National Education Frameworks
          </h2>
          <p className="text-body text-ink-muted max-w-2xl mx-auto leading-relaxed">
            SkillBridge directly supports institutional accreditation requirements under <strong>NAAC Criteria 2 & 3</strong> (Teaching-Learning & Research Collaboration) and <strong>NIRF parameters</strong> for graduate outcomes, industry linkages, and faculty development.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <Link href="/register">
              <Button className="rounded-pill px-8 h-11 font-medium">
                Get Started Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="rounded-pill px-8 h-11 font-medium">
                Sign In to Your Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

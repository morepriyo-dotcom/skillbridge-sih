import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { StatsMarquee } from "@/components/marketing/stats-marquee";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { InteractiveAssessmentDemo } from "@/components/marketing/interactive-assessment-demo";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "SkillBridge | National Academia-Industry Platform (SIH PS 26044)",
  description:
    "Unified platform bridging campus to corporate with proctored skill assessments, structured internships, corporate R&D, and NAAC/NIRF accreditation analytics.",
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink relative overflow-hidden">
      {/* Background Ambient Radial Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-gradient-violet/20 via-accent-blue/10 to-transparent blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-[800px] right-[-200px] w-[600px] h-[600px] bg-gradient-magenta/10 blur-[160px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-1 border border-hairline mb-8 shadow-xs hover:border-hairline-strong transition-all">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse"></span>
          <span className="text-body-sm font-semibold text-ink">Smart India Hackathon</span>
          <span className="text-micro text-ink-muted">· Problem Statement PS 26044</span>
        </div>

        <h1 className="text-display-xl font-bold tracking-tight leading-[1.05] text-ink max-w-4xl mx-auto">
          Bridging Campus to Corporate.{" "}
          <span className="bg-gradient-to-r from-gradient-violet via-accent-blue to-teal-400 bg-clip-text text-transparent">
            With Cryptographically Verified Skills.
          </span>
        </h1>

        <p className="text-body-lg text-ink-muted mt-6 max-w-3xl mx-auto leading-relaxed">
          The unified national infrastructure connecting students, faculty researchers, enterprise
          recruiters, and higher education institutions for proctored skill evaluations, structured
          internships, and automated NAAC & NIRF accreditation.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button className="rounded-pill px-8 h-12 text-body font-semibold bg-white text-black hover:opacity-90 shadow-lg hover:scale-105 transition-all">
              Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button
              variant="secondary"
              className="rounded-pill px-8 h-12 text-body font-medium border border-hairline/80 hover:bg-surface-2 transition-all"
            >
              Explore Opportunities
            </Button>
          </Link>
        </div>

        {/* Trust Badges Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption text-ink-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-semantic-success" /> AICTE Internship Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-accent-blue" /> NEP 2020 Aligned
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" /> NAAC & NIRF Metric Ready
          </span>
        </div>

        {/* Interactive Multi-Stakeholder Showcase */}
        <HeroShowcase />
      </section>

      {/* Live Stats Counter & Partner Marquee */}
      <StatsMarquee />

      {/* Core Capabilities Bento Grid */}
      <BentoFeatures />

      {/* Interactive Assessment Demo Playground */}
      <InteractiveAssessmentDemo />

      {/* Stakeholder Value Proposition Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-hairline bg-surface-1/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="accent" className="text-micro font-bold uppercase tracking-wider">
              Multidisciplinary Ecosystem
            </Badge>
            <h3 className="text-display-md text-ink font-bold">
              Built for Every Stakeholder in Higher Education
            </h3>
            <p className="text-body text-ink-muted">
              Whether you are an aspiring student, a college administrator, or a hiring manager,
              SkillBridge provides tailor-made tools for your exact workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: GraduationCap,
                color: "text-accent-blue bg-accent-blue/10 border-accent-blue/20",
                title: "For Students",
                description:
                  "Build verified skill scorecards, practice proctored assessments, access 1-on-1 industry mentorship, and secure pre-screened internships.",
                points: ["Objective skill benchmarking", "Public digital badge portfolio", "Direct recruiter matching"],
                href: "/register?role=student",
              },
              {
                icon: BookOpen,
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                title: "For Academicians",
                description:
                  "Participate in enterprise R&D calls, lead corporate-sponsored projects, enroll in certified FDPs, and mentor top student researchers.",
                points: ["Corporate research grants", "AICTE-aligned FDP programs", "Consultancy MoUs"],
                href: "/register?role=academician",
              },
              {
                icon: Briefcase,
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                title: "For Industry Partners",
                description:
                  "Eliminate screening bottlenecks with pre-verified candidate test scores, post internship drives, and partner directly with engineering universities.",
                points: ["Tamper-evident candidate testing", "1-click interview scheduling", "Targeted campus drives"],
                href: "/register?role=industry_partner",
              },
              {
                icon: Building2,
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
                title: "For Institutions",
                description:
                  "Empower placement cells and academic deans with cohort placement metrics, student skill tracking, and one-click NAAC & NIRF audit tables.",
                points: ["NAAC Criterion 5.2.1 reporting", "Real-time placement dashboards", "Centralized corporate MoUs"],
                href: "/register?role=institution_admin",
              },
            ].map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.title}
                  className="p-6 rounded-2xl bg-canvas border border-hairline shadow-xs flex flex-col justify-between space-y-6 hover:border-hairline-strong transition-all hover:scale-[1.02]"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${persona.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-headline text-ink font-bold">{persona.title}</h4>
                    <p className="text-body-sm text-ink-muted leading-relaxed">
                      {persona.description}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-hairline/60 text-micro text-ink-muted">
                      {persona.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={persona.href}>
                    <Button variant="secondary" className="w-full rounded-pill text-body-sm justify-between">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FAQAccordion />

      {/* High-Impact Atmospheric Call to Action (CTA) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-hairline p-8 sm:p-14 text-center bg-gradient-to-b from-surface-2 via-surface-1 to-canvas shadow-2xl relative overflow-hidden space-y-8">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-violet/20 blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <Badge variant="accent" className="text-body-sm px-4 py-1 rounded-pill">
              Join the National Skill Network
            </Badge>
            <h2 className="text-display-lg text-ink font-bold tracking-tight leading-tight">
              Ready to Bridge the Gap Between Campus & Corporate?
            </h2>
            <p className="text-body-lg text-ink-muted">
              Start building your verified skill profile, post opportunities, or automate college placement analytics today.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register?role=student">
              <Button className="rounded-pill px-6 h-11 bg-white text-black font-semibold hover:bg-gray-100 shadow-md">
                Join as Student
              </Button>
            </Link>
            <Link href="/register?role=industry_partner">
              <Button variant="secondary" className="rounded-pill px-6 h-11 border-hairline font-medium">
                Hire Talent as Recruiter
              </Button>
            </Link>
            <Link href="/register?role=academician">
              <Button variant="secondary" className="rounded-pill px-6 h-11 border-hairline font-medium">
                Collaborate as Faculty
              </Button>
            </Link>
            <Link href="/register?role=institution_admin">
              <Button variant="secondary" className="rounded-pill px-6 h-11 border-hairline font-medium">
                Onboard Institution
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

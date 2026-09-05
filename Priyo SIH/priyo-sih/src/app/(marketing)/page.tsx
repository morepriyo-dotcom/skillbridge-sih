import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Building2,
  Users,
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart3,
  Handshake,
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <Badge variant="accent" className="text-body-sm px-4 py-1 mb-6">
          PS 26044 — Academia-Industry Collaboration
        </Badge>
        <h1 className="text-display-lg text-ink font-bold leading-tight">
          SkillBridge — Bridging Campus to Corporate
        </h1>
        <p className="text-body text-ink-muted mt-4 max-w-2xl mx-auto leading-relaxed">
          A unified national platform connecting students, academicians,
          industry partners, and institutions for verified skill
          assessments, structured internships, and data-driven placements.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register">
            <Button className="rounded-pill px-8">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="rounded-pill px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Bar — Descriptive (no hardcoded numbers) */}
      <section className="border-y border-hairline bg-surface-1 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-6">
          {[
            { icon: Building2, label: "Industry Partners" },
            { icon: GraduationCap, label: "Registered Students" },
            { icon: Users, label: "Partner Institutions" },
            { icon: Zap, label: "AI-Powered Matching" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <stat.icon className="w-8 h-8 text-accent-blue" />
              <span className="text-body-sm text-ink font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-display-md text-ink font-medium text-center mb-12">
          Platform Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Verified Skill Assessments",
              description:
                "Industry-curated tests with automated digital badge credentials for verified competencies.",
            },
            {
              icon: ShieldCheck,
              title: "AI-Driven Matching",
              description:
                "Smart matching algorithm pairs students with opportunities based on verified skill profiles.",
            },
            {
              icon: Briefcase,
              title: "Structured Internships",
              description:
                "End-to-end internship management with weekly logs, mentor feedback, and progress tracking.",
            },
            {
              icon: BarChart3,
              title: "Institutional Analytics",
              description:
                "NAAC and NIRF-ready reports with real-time batch skill readiness and placement metrics.",
            },
            {
              icon: Handshake,
              title: "Academia-Industry Collaborations",
              description:
                "Joint research projects, faculty development programs, and industry-sponsored training.",
            },
            {
              icon: GraduationCap,
              title: "Portfolio & Mentorship",
              description:
                "Digital portfolios with verified badges and 1-on-1 industry mentorship connections.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 space-y-3">
              <feature.icon className="w-8 h-8 text-accent-blue" />
              <h3 className="text-headline text-ink font-medium">
                {feature.title}
              </h3>
              <p className="text-body-sm text-ink-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Role Spotlight */}
      <section className="py-16 px-6 bg-surface-1 border-y border-hairline">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-display-md text-ink font-medium mb-8">
            For Every Stakeholder
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "Students",
                description:
                  "Build verified skill portfolios, access internships, and track career readiness.",
              },
              {
                role: "Academicians",
                description:
                  "Explore FDPs, research collaborations, and industry mentorship opportunities.",
              },
              {
                role: "Industry Partners",
                description:
                  "Post opportunities, access pre-screened talent, and manage recruitment pipelines.",
              },
              {
                role: "Institutions",
                description:
                  "Track batch outcomes, generate NAAC/NIRF-ready reports, and monitor placements.",
              },
            ].map((item) => (
              <Card key={item.role} className="p-5 text-left space-y-2">
                <h4 className="text-body text-ink font-semibold">
                  {item.role}
                </h4>
                <p className="text-body-sm text-ink-muted">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-display-md text-ink font-medium">
          Ready to Bridge the Gap?
        </h2>
        <p className="text-body text-ink-muted mt-2">
          Join the platform and start building your verified career profile
          today.
        </p>
        <Link href="/register">
          <Button className="rounded-pill px-10 mt-6">
            Create Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

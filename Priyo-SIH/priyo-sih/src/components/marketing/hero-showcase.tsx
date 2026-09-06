"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  Users,
  Search,
  FileCheck2,
} from "lucide-react";

type StakeholderRole = "student" | "academician" | "industry" | "institution";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<StakeholderRole>("student");

  const tabs: { id: StakeholderRole; label: string; icon: React.ElementType; color: string }[] = [
    { id: "student", label: "Students", icon: GraduationCap, color: "text-accent-blue" },
    { id: "academician", label: "Faculty & Academicians", icon: BookOpen, color: "text-amber-500" },
    { id: "industry", label: "Industry Partners", icon: Briefcase, color: "text-emerald-500" },
    { id: "institution", label: "Institutions & Deans", icon: Building2, color: "text-purple-500" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-12">
      {/* Interactive Tabs Switcher */}
      <div className="flex items-center justify-center p-1.5 bg-surface-1/90 border border-hairline rounded-2xl sm:rounded-pill max-w-2xl mx-auto shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 w-full gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl sm:rounded-pill text-body-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface-2 text-ink shadow-xs scale-[1.02]"
                    : "text-ink-muted hover:text-ink hover:bg-surface-2/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Window Chrome */}
      <div className="mt-6 rounded-2xl sm:rounded-3xl border border-hairline bg-surface-1 shadow-2xl overflow-hidden transition-all duration-300">
        {/* Browser Top Bar */}
        <div className="bg-canvas/90 border-b border-hairline/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="hidden sm:inline-block text-micro text-ink-muted ml-3 font-mono">
              skillbridge.gov.in/portal/{activeTab}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-micro font-medium bg-semantic-success/10 text-semantic-success border border-semantic-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse"></span>
              Live Platform Sandbox
            </span>
            <Link href={`/register?role=${activeTab === "industry" ? "industry_partner" : activeTab === "institution" ? "institution_admin" : activeTab}`}>
              <Button variant="ghost" className="h-7 text-micro text-ink-muted hover:text-ink px-2">
                Launch Live View <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Interactive Sandbox Body */}
        <div className="p-5 sm:p-8 bg-canvas">
          {/* TAB 1: STUDENT VIEW */}
          {activeTab === "student" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-blue to-gradient-violet flex items-center justify-center text-white font-bold text-headline shadow-inner">
                    PM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-headline text-ink font-bold">Priyanshu More</h4>
                      <Badge variant="accent" className="text-micro font-semibold py-0.5">
                        Verified Student
                      </Badge>
                    </div>
                    <p className="text-body-sm text-ink-muted">
                      B.Tech Computer Science · National Institute of Technology · CGPA 8.85
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-micro uppercase tracking-wider text-ink-muted font-bold block">
                      Placement Readiness Score
                    </span>
                    <span className="text-display-md text-semantic-success font-black">
                      94.5<span className="text-body text-ink-muted font-normal">/100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Verified Skill Badges & AI Matching Engine */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Verified Competencies */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-bold text-ink flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      Cryptographically Verified Badges
                    </span>
                    <span className="text-micro text-ink-muted font-mono">
                      Proctored Test Benchmarks
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { skill: "Full-Stack React & Next.js", score: "96%", level: "Expert", date: "Verified Sep 2026", color: "from-blue-500/15 to-transparent border-blue-500/30" },
                      { skill: "Distributed Systems & DB", score: "91%", level: "Advanced", date: "Verified Aug 2026", color: "from-purple-500/15 to-transparent border-purple-500/30" },
                      { skill: "Cloud Native & DevOps", score: "88%", level: "Proficient", date: "Verified Aug 2026", color: "from-emerald-500/15 to-transparent border-emerald-500/30" },
                    ].map((badge) => (
                      <div
                        key={badge.skill}
                        className={`p-3.5 rounded-xl border bg-gradient-to-b ${badge.color} bg-surface-1 flex flex-col justify-between space-y-2`}
                      >
                        <div className="flex items-center justify-between">
                          <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                          <span className="text-micro font-bold font-mono px-2 py-0.5 rounded-md bg-canvas/80 text-ink">
                            {badge.score}
                          </span>
                        </div>
                        <div>
                          <div className="text-body-sm font-bold text-ink line-clamp-1">{badge.skill}</div>
                          <div className="text-micro text-ink-muted">{badge.level} · {badge.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tamper proof verify bar */}
                  <div className="p-3 rounded-xl bg-surface-1 border border-hairline/60 flex items-center justify-between text-micro text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-accent-blue" />
                      Public Credential Hash: <span className="font-mono text-ink">0x8a92...b4f1</span>
                    </span>
                    <span className="text-semantic-success font-medium">Valid & Authenticated</span>
                  </div>
                </div>

                {/* AI Matchmaker Box */}
                <div className="p-4 rounded-xl border border-hairline bg-surface-1/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-micro font-bold uppercase tracking-wider text-accent-blue flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Match Engine
                      </span>
                      <span className="text-micro px-2 py-0.5 rounded-full bg-semantic-success/15 text-semantic-success font-bold">
                        96% Compatibility
                      </span>
                    </div>
                    <h5 className="text-body font-bold text-ink leading-snug">
                      Cloud Software Engineer Intern
                    </h5>
                    <p className="text-micro text-ink-muted">
                      Tata Consultancy Services · Digital Enterprise Group
                    </p>
                  </div>

                  <div className="text-micro text-ink-muted bg-canvas/60 p-2.5 rounded-lg border border-hairline/60 space-y-1">
                    <div className="flex justify-between">
                      <span>Stipend:</span>
                      <span className="font-semibold text-ink">₹45,000 / month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-semibold text-ink">Bengaluru / Hybrid</span>
                    </div>
                  </div>

                  <Link href="/register?role=student">
                    <Button className="w-full rounded-pill h-8 text-caption font-semibold bg-white text-black hover:bg-gray-100">
                      Apply with SkillBridge Badge
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICIAN / FACULTY VIEW */}
          {activeTab === "academician" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-headline shadow-inner">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-headline text-ink font-bold">Dr. Arvind Sharma</h4>
                      <Badge variant="warning" className="text-micro font-semibold py-0.5">
                        Professor & HoD
                      </Badge>
                    </div>
                    <p className="text-body-sm text-ink-muted">
                      Department of Computer Science & Engineering · AICTE Recognized Guide
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-micro uppercase tracking-wider text-ink-muted font-bold block">
                      Active Research Grants
                    </span>
                    <span className="text-display-md text-amber-500 font-black">
                      ₹42.8L
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-3">
                  <span className="text-body-sm font-bold text-ink flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Sponsored Corporate Research Proposals (Industry-Academia)
                  </span>

                  <div className="space-y-2.5">
                    {[
                      {
                        title: "Edge AI & Vision Computing for High-Speed Autonomous Sorting",
                        partner: "L&T Technology Services · Applied R&D Division",
                        grant: "₹24,00,000 INR",
                        status: "Under Joint Review",
                        statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      },
                      {
                        title: "Fault-Tolerant Microgrid Energy Optimization using Reinforcement Learning",
                        partner: "Tata Power Renewables · Innovation Hub",
                        grant: "₹18,80,000 INR",
                        status: "MoU Approved & Active",
                        statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      },
                    ].map((call) => (
                      <div key={call.title} className="p-4 rounded-xl bg-surface-1 border border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-1">
                          <h5 className="text-body-sm font-bold text-ink">{call.title}</h5>
                          <p className="text-micro text-ink-muted">{call.partner}</p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                          <span className="text-body-sm font-extrabold text-ink font-mono">{call.grant}</span>
                          <span className={`text-micro px-2 py-0.5 rounded-full border font-medium ${call.statusColor}`}>
                            {call.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-hairline bg-surface-1/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-micro font-bold uppercase tracking-wider text-amber-500">
                      Faculty Development Program (FDP)
                    </span>
                    <h5 className="text-body font-bold text-ink leading-snug">
                      Generative AI & LLM Systems in Industry
                    </h5>
                    <p className="text-micro text-ink-muted">
                      Industry-led certificate sponsored by Microsoft Research India
                    </p>
                    <div className="pt-2 text-micro text-ink-muted space-y-1">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold text-ink">4 Weeks (Hybrid)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AICTE Credits:</span>
                        <span className="font-semibold text-ink">3 API Points</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/register?role=academician">
                    <Button className="w-full rounded-pill h-8 text-caption font-semibold bg-white text-black hover:bg-gray-100">
                      Explore R&D Collaboration
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INDUSTRY PARTNER VIEW */}
          {activeTab === "industry" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-headline shadow-inner">
                    TCS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-headline text-ink font-bold">Tata Consultancy Services</h4>
                      <Badge variant="success" className="text-micro font-semibold py-0.5">
                        Enterprise Hiring Partner
                      </Badge>
                    </div>
                    <p className="text-body-sm text-ink-muted">
                      Campus Recruitment Division · 24 Active Engineering College MoUs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-micro uppercase tracking-wider text-ink-muted font-bold block">
                      Screening Time Saved
                    </span>
                    <span className="text-display-md text-emerald-500 font-black">
                      78%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-bold text-ink flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Pre-Vetted Verified Candidate Stream
                    </span>
                    <span className="text-micro text-ink-muted">Zero Resume Tampering</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Aditi Roy", college: "IIT Bombay", role: "AI Systems Intern", score: "97% Test Benchmark", badges: ["PyTorch", "CUDA", "FastAPI"] },
                      { name: "Kunal Verma", college: "NIT Surathkal", role: "Backend Systems Intern", score: "94% Test Benchmark", badges: ["Go", "Kubernetes", "Postgres"] },
                      { name: "Sneha Nair", college: "BITS Pilani", role: "Full-Stack Engineer", score: "93% Test Benchmark", badges: ["Next.js", "TypeScript", "Tailwind"] },
                    ].map((candidate) => (
                      <div key={candidate.name} className="p-3.5 rounded-xl bg-surface-1 border border-hairline flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center font-bold text-caption text-ink">
                            {candidate.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-body-sm font-bold text-ink">{candidate.name}</span>
                              <span className="text-micro text-ink-muted">· {candidate.college}</span>
                            </div>
                            <div className="flex gap-1.5 mt-1">
                              {candidate.badges.map((b) => (
                                <span key={b} className="text-micro px-1.5 py-0.2 rounded bg-surface-2 text-ink-muted font-mono">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-micro font-bold text-semantic-success block font-mono">
                            {candidate.score}
                          </span>
                          <span className="text-micro text-accent-blue font-medium hover:underline cursor-pointer">
                            1-Click Invite
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-hairline bg-surface-1/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-micro font-bold uppercase tracking-wider text-emerald-500">
                      Hiring Efficiency Metric
                    </span>
                    <h5 className="text-body font-bold text-ink leading-snug">
                      Candidate Quality Guarantee
                    </h5>
                    <p className="text-micro text-ink-muted">
                      Every applicant has passed proctored coding assessments and holds verified academic transcripts.
                    </p>
                    <div className="p-2.5 rounded-lg bg-canvas/60 border border-hairline text-micro space-y-1 text-ink-muted">
                      <div className="flex justify-between">
                        <span>Direct Interview Conversion:</span>
                        <span className="font-bold text-semantic-success">84.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Internship Retention Rate:</span>
                        <span className="font-bold text-ink">91.8%</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/register?role=industry_partner">
                    <Button className="w-full rounded-pill h-8 text-caption font-semibold bg-white text-black hover:bg-gray-100">
                      Post Opportunity
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INSTITUTION ADMIN VIEW */}
          {activeTab === "institution" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-headline shadow-inner">
                    NIT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-headline text-ink font-bold">National Institute of Technology</h4>
                      <Badge variant="accent" className="text-micro font-semibold py-0.5">
                        Accredited College Console
                      </Badge>
                    </div>
                    <p className="text-body-sm text-ink-muted">
                      Dean of Academics & Placement Directorate · Batch of 2026 (1,420 Enrolled)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-micro uppercase tracking-wider text-ink-muted font-bold block">
                      Placement Conversion Rate
                    </span>
                    <span className="text-display-md text-purple-500 font-black">
                      87.4%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-3">
                  <span className="text-body-sm font-bold text-ink flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-purple-500" />
                    Automated NAAC & NIRF Accreditation Export Feed
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface-1 border border-hairline space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-micro uppercase font-bold text-purple-400">NAAC Criterion 5.2.1</span>
                        <span className="text-micro px-2 py-0.5 rounded-full bg-semantic-success/15 text-semantic-success font-medium">100% Audit Ready</span>
                      </div>
                      <div className="text-body font-bold text-ink">Student Progression & Placements</div>
                      <p className="text-micro text-ink-muted">
                        Complete digital trail of offer letters, company MoUs, and compensation packages automatically indexed.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-1 border border-hairline space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-micro uppercase font-bold text-purple-400">NIRF Metric: GO</span>
                        <span className="text-micro px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-medium">Projected 38.6/40</span>
                      </div>
                      <div className="text-body font-bold text-ink">Graduation Outcome Index</div>
                      <p className="text-micro text-ink-muted">
                        Verified higher studies tracking, competitive exam credentials, and corporate absorption rates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-hairline bg-surface-1/70 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-micro font-bold uppercase tracking-wider text-purple-500">
                      Drive Management
                    </span>
                    <h5 className="text-body font-bold text-ink leading-snug">
                      18 Campus Drives Scheduled
                    </h5>
                    <p className="text-micro text-ink-muted">
                      Microsoft, Tata Group, Infosys, and L&T scheduled for recruitment tests this quarter.
                    </p>
                  </div>

                  <Link href="/register?role=institution_admin">
                    <Button className="w-full rounded-pill h-8 text-caption font-semibold bg-white text-black hover:bg-gray-100">
                      Open Institutional Console
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

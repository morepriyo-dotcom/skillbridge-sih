"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Zap,
  Briefcase,
  BarChart3,
  Handshake,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  FileSpreadsheet,
  Award,
} from "lucide-react";

export function BentoFeatures() {
  const [activeFeatureHover, setActiveFeatureHover] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <Badge variant="accent" className="text-body-sm px-4 py-1 rounded-pill">
          Engineered for National Scale · PS 26044
        </Badge>
        <h2 className="text-display-lg text-ink font-bold tracking-tight">
          Next-Generation Higher Education & Placement Infrastructure
        </h2>
        <p className="text-body-lg text-ink-muted leading-relaxed">
          Reimagining how university students learn, how faculties collaborate with enterprise R&D,
          and how companies recruit top-tier verified talent without resume fraud.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
        {/* Card 1 (Large 8 cols): Cryptographically Verified Skill Credentials */}
        <div className="lg:col-span-8">
          <SpotlightCard
            variant="violet"
            className="h-full justify-between p-8 sm:p-10 shadow-lg rounded-3xl relative overflow-hidden group"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <Badge variant="muted" className="border border-white/30 text-white text-micro font-bold uppercase tracking-wider">
                Integrity Layer
              </Badge>
              <h3 className="text-display-md text-white font-bold leading-tight">
                Objective, Proctored Skill Benchmarks & Tamper-Evident Badges
              </h3>
              <p className="text-body text-white/80 max-w-xl leading-relaxed">
                Move beyond inflated resume bullet points. Every student skill score is validated
                through timed, proctored assessments. Issued badges are cryptographically signed and
                directly inspectable by recruiters worldwide.
              </p>
            </div>

            {/* Interactive Visual Element */}
            <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
              <div className="p-3.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-micro text-white/70 block">Anti-Cheat Proctoring</span>
                <span className="text-headline text-white font-bold font-mono">99.4%</span>
                <span className="text-micro text-white/60 block">AI gaze & keystroke integrity</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-micro text-white/70 block">Verification Protocol</span>
                <span className="text-headline text-white font-bold font-mono">SHA-256</span>
                <span className="text-micro text-white/60 block">Public ledger verification</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-micro text-white/70 block">Skill Recertification</span>
                <span className="text-headline text-white font-bold font-mono">Continuous</span>
                <span className="text-micro text-white/60 block">Auto-updates with new stacks</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Card 2 (4 cols): AI Matching Engine */}
        <div className="lg:col-span-4">
          <SpotlightCard
            variant="orange"
            className="h-full justify-between p-8 shadow-lg rounded-3xl relative overflow-hidden group"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <Badge variant="muted" className="border border-white/30 text-white text-micro font-bold uppercase tracking-wider">
                Precision Intelligence
              </Badge>
              <h3 className="text-display-md text-white font-bold leading-tight">
                AI Vector Match Engine
              </h3>
              <p className="text-body text-white/80 leading-relaxed">
                Connects student skill matrices with job requirements through semantic multi-vector
                matching, cutting hiring cycle times from 6 weeks to 48 hours.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 space-y-2 relative z-10">
              <div className="flex justify-between items-center text-micro text-white/80">
                <span>Semantic Compatibility</span>
                <span className="font-bold text-white font-mono">96.2% Match</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full w-[96%]"></div>
              </div>
              <p className="text-micro text-white/70">
                Verified: Python, FastAPI, Docker, Microservices
              </p>
            </div>
          </SpotlightCard>
        </div>

        {/* Card 3 (4 cols): Structured Internships */}
        <div className="lg:col-span-4">
          <SpotlightCard
            variant="magenta"
            className="h-full justify-between p-8 shadow-lg rounded-3xl relative overflow-hidden group"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              <Badge variant="muted" className="border border-white/30 text-white text-micro font-bold uppercase tracking-wider">
                Experiential Learning
              </Badge>
              <h3 className="text-display-md text-white font-bold leading-tight">
                Structured Internship Lifecycles
              </h3>
              <p className="text-body text-white/80 leading-relaxed">
                Full-cycle governance: verified weekly milestone submissions, corporate mentor
                feedback loops, stipend escrow confirmation, and academic credit transfer.
              </p>
            </div>

            <div className="mt-6 space-y-2 relative z-10 text-micro">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/25 border border-white/10 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Weekly Work Log Approval
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/25 border border-white/10 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Industry Mentor Evaluation
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/25 border border-white/10 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> AICTE Internship Credit Transfer
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Card 4 (4 cols): Institutional Analytics */}
        <div className="lg:col-span-4">
          <div className="h-full p-8 rounded-3xl bg-surface-1 border border-hairline shadow-sm hover:border-hairline-strong transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <Badge variant="muted" className="text-micro font-bold uppercase tracking-wider text-purple-400">
                Accreditation Data
              </Badge>
              <h3 className="text-display-md text-ink font-bold leading-tight">
                NAAC & NIRF One-Click Audit Reports
              </h3>
              <p className="text-body text-ink-muted leading-relaxed">
                Generate real-time compliance documentation for NAAC Criterion 1.3 (Curricular
                Enrichment) & Criterion 5.2 (Student Progression) with cryptographic audit logs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-hairline/60 space-y-2">
              <div className="flex justify-between items-center text-micro">
                <span className="text-ink font-medium">Criterion 5.2.1 Audit Progress</span>
                <span className="font-bold text-semantic-success font-mono">100% Complete</span>
              </div>
              <div className="flex items-center gap-2 text-micro text-ink-muted">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>Format: SSR Ready (PDF / CSV / JSON)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5 (4 cols): Academia-Industry Collaborations */}
        <div className="lg:col-span-4">
          <div className="h-full p-8 rounded-3xl bg-surface-1 border border-hairline shadow-sm hover:border-hairline-strong transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Handshake className="w-6 h-6" />
              </div>
              <Badge variant="muted" className="text-micro font-bold uppercase tracking-wider text-amber-400">
                Corporate Synergy
              </Badge>
              <h3 className="text-display-md text-ink font-bold leading-tight">
                Joint R&D & Faculty Development
              </h3>
              <p className="text-body text-ink-muted leading-relaxed">
                Bridge universities directly with enterprise R&D wings. Apply for corporate research
                grants, establish specialized centers of excellence, and co-file technology patents.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-hairline/60 space-y-2">
              <div className="flex justify-between items-center text-micro">
                <span className="text-ink font-medium">Active Research Grant Calls</span>
                <span className="font-bold text-amber-500 font-mono">₹4.2 Cr Available</span>
              </div>
              <div className="text-micro text-ink-muted">
                Top Areas: Edge AI, Green Hydrogen, Quantum Computing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

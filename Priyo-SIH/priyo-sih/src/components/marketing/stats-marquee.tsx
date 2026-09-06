"use client";

import React from "react";
import { Building2, GraduationCap, Users, Zap, ShieldCheck, Award } from "lucide-react";

export function StatsMarquee() {
  const stats = [
    {
      value: "120,000+",
      label: "Verified Skill Assessments",
      subtext: "Proctored competency evaluations",
      icon: Award,
      color: "text-accent-blue",
    },
    {
      value: "480+",
      label: "Industry & R&D Partners",
      subtext: "Fortune 500 & deep-tech enterprises",
      icon: Building2,
      color: "text-emerald-500",
    },
    {
      value: "1,250+",
      label: "Partner Institutions",
      subtext: "Engineering, Science & Management",
      icon: GraduationCap,
      color: "text-purple-500",
    },
    {
      value: "94.8%",
      label: "AI Match & Placement Accuracy",
      subtext: "Zero resume inflation or spam",
      icon: Zap,
      color: "text-amber-500",
    },
  ];

  const partners = [
    { name: "Tata Consultancy Services", tag: "Enterprise Partner" },
    { name: "Infosys R&D Foundation", tag: "Research Partner" },
    { name: "Microsoft Research India", tag: "FDP & AI Lab" },
    { name: "AWS Academy", tag: "Cloud Infrastructure" },
    { name: "L&T Technology Services", tag: "Core Engineering" },
    { name: "NASSCOM FutureSkills", tag: "Skill Standards" },
    { name: "AICTE Industry Cell", tag: "Accreditation Sync" },
    { name: "Wipro TalentNext", tag: "Internship Sponsor" },
  ];

  return (
    <section className="border-y border-hairline bg-surface-1/50 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center p-4 rounded-2xl bg-canvas/40 border border-hairline/60 hover:border-hairline transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center mb-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-display-md font-black text-ink tracking-tight font-mono">
                  {item.value}
                </div>
                <div className="text-body-sm font-bold text-ink mt-1">{item.label}</div>
                <div className="text-micro text-ink-muted mt-0.5">{item.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* Enterprise & Government Partner Trust Marquee */}
        <div className="mt-12 pt-8 border-t border-hairline/60">
          <p className="text-center text-micro uppercase tracking-widest font-bold text-ink-muted mb-6">
            Aligned with National Skill Standards & Enterprise Leaders
          </p>

          <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <div className="flex gap-4 sm:gap-6 animate-marquee shrink-0 py-2">
              {[...partners, ...partners].map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface-2/70 border border-hairline/60 text-ink whitespace-nowrap shadow-xs hover:bg-surface-2 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-accent-blue/80"></span>
                  <span className="text-caption font-bold">{p.name}</span>
                  <span className="text-micro px-1.5 py-0.5 rounded bg-canvas/80 text-ink-muted font-mono border border-hairline/40">
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Students" | "Institutions" | "Industry" | "Faculty";
}

const FAQS: FAQItem[] = [
  {
    category: "Students",
    question: "How are SkillBridge assessment scores verified and tamper-proof?",
    answer:
      "All assessments are proctored through automated anomaly detection, browser lock, and timed benchmark modules. Upon completion, scores are converted into a cryptographically signed digital credential with a public SHA-256 verification hash, guaranteeing recruiters that the candidate's skills are 100% genuine.",
  },
  {
    category: "Institutions",
    question: "How does SkillBridge assist with NAAC and NIRF accreditation audits?",
    answer:
      "SkillBridge continuously catalogs student placement offers, MoUs, corporate internship logs, and faculty research funding into standardized institutional data tables. Deans and IQAC coordinators can export audit-ready reports mapped directly to NAAC Criterion 1.3, 5.2.1, and NIRF Graduation Outcome (GO) parameters in one click.",
  },
  {
    category: "Industry",
    question: "How does SkillBridge eliminate resume screening fatigue for recruiters?",
    answer:
      "Unlike job boards flooded with inflated self-reported resumes, SkillBridge filters candidates by objectively evaluated technical test benchmarks. Recruiters set exact competency thresholds (e.g., minimum 85% in Next.js and System Design) and receive a pre-vetted applicant stream ready for final-round technical interviews.",
  },
  {
    category: "Faculty",
    question: "How can professors and academicians participate in corporate R&D projects?",
    answer:
      "Enterprises regularly publish funded research calls and technology consultancy requirements on SkillBridge. Faculty members can submit collaborative proposals, sign institutional MoUs, manage student research assistants, and earn accredited AICTE/UGC API points through certified Faculty Development Programs (FDPs).",
  },
  {
    category: "Students",
    question: "Does SkillBridge fulfill AICTE's mandatory internship policy and NEP 2020?",
    answer:
      "Yes. The platform was designed under Smart India Hackathon Problem Statement PS 26044 to fully satisfy AICTE's mandatory 600-hour internship credit guidelines and NEP 2020 experiential learning directives, featuring weekly verified log submissions, industry supervisor sign-offs, and college dean credit transfer.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-16">
        <span className="text-micro font-bold uppercase tracking-widest text-accent-blue flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
        </span>
        <h3 className="text-display-md text-ink font-bold">
          Common Questions & Platform Governance
        </h3>
        <p className="text-body text-ink-muted">
          Everything you need to know about verification integrity, institutional compliance, and hiring workflows.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? "bg-surface-1 border-hairline shadow-md"
                  : "bg-canvas border-hairline/60 hover:bg-surface-1/50"
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-micro font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted border border-hairline/60">
                    {faq.category}
                  </span>
                  <span className="text-body-lg text-ink font-semibold">{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-ink-muted shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-ink" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-body text-ink-muted leading-relaxed border-t border-hairline/40 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
} from "lucide-react";
import { SkillBridgeLogo } from "@/components/ui/skillbridge-logo";

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Opportunities", href: "/opportunities" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline/80 bg-canvas/80 backdrop-blur-xl transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-surface-1 border-b border-hairline/60 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-micro sm:text-caption text-ink-muted">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-success"></span>
          </span>
          <span className="font-medium text-ink">SIH PS 26044 Network:</span>
          <span>National Academia-Industry Collaborative Infrastructure</span>
          <Link
            href="/about"
            className="hidden sm:inline-flex items-center gap-1 text-accent-blue hover:underline font-medium ml-1"
          >
            Learn more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* World-Class Brand Logo */}
        <div className="flex items-center">
          <SkillBridgeLogo size="md" />
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-1/60 border border-hairline/60 rounded-pill px-3 py-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-body-sm px-4 py-1.5 rounded-pill transition-colors ${
                  isActive
                    ? "bg-surface-2 text-ink font-medium shadow-xs"
                    : "text-ink-muted hover:text-ink hover:bg-surface-2/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="secondary"
              className="rounded-pill px-5 h-9 text-body-sm font-medium border border-hairline/80 hover:bg-surface-2"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-pill px-5 h-9 text-body-sm font-medium bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all hover:scale-[1.02]">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink hover:bg-surface-1 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-hairline bg-canvas/95 backdrop-blur-2xl px-6 py-6 space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-body font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-surface-2 text-ink"
                    : "text-ink-muted hover:text-ink hover:bg-surface-1"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-hairline space-y-3">
            <div className="text-micro font-bold text-ink-muted uppercase tracking-wider px-2">
              Explore by Role
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/register?role=student"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-1 border border-hairline/60 text-body-sm text-ink hover:bg-surface-2"
              >
                <GraduationCap className="w-4 h-4 text-accent-blue" /> Students
              </Link>
              <Link
                href="/register?role=industry_partner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-1 border border-hairline/60 text-body-sm text-ink hover:bg-surface-2"
              >
                <Briefcase className="w-4 h-4 text-emerald-500" /> Industry
              </Link>
              <Link
                href="/register?role=academician"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-1 border border-hairline/60 text-body-sm text-ink hover:bg-surface-2"
              >
                <BookOpen className="w-4 h-4 text-amber-500" /> Faculty
              </Link>
              <Link
                href="/register?role=institution_admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-1 border border-hairline/60 text-body-sm text-ink hover:bg-surface-2"
              >
                <Building2 className="w-4 h-4 text-purple-500" /> Institutions
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-hairline flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="secondary" className="w-full rounded-pill h-11">
                Sign In to Portal
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button className="w-full rounded-pill h-11 bg-primary text-on-primary">
                Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

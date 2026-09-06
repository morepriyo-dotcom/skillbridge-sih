import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { SkillBridgeLogo } from '@/components/ui/skillbridge-logo';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-accent-blue/30 selection:text-ink">
      <MarketingNavbar />

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-canvas border-t border-hairline py-[64px] px-[32px]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Platform</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/about" className="hover:text-ink">About Us</Link></li>
              <li><Link href="/opportunities" className="hover:text-ink">Opportunities</Link></li>
              <li><Link href="/register?role=student" className="hover:text-ink">For Students</Link></li>
              <li><Link href="/register?role=academician" className="hover:text-ink">For Academicians</Link></li>
              <li><Link href="/register?role=industry_partner" className="hover:text-ink">For Industry</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Portals</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/login" className="hover:text-ink">Student Hub</Link></li>
              <li><Link href="/login" className="hover:text-ink">Faculty Portal</Link></li>
              <li><Link href="/login" className="hover:text-ink">Partner Portal</Link></li>
              <li><Link href="/login" className="hover:text-ink">Institution Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Accreditation</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/about" className="hover:text-ink">NAAC Alignment</Link></li>
              <li><Link href="/about" className="hover:text-ink">NIRF Parameters</Link></li>
              <li><Link href="/about" className="hover:text-ink">SIH PS 26044</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Access</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/login" className="hover:text-ink">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-ink">Register Account</Link></li>
              <li><Link href="/forgot-password" className="hover:text-ink">Password Recovery</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4">
          <SkillBridgeLogo size="sm" showBadge={false} />
          <span className="text-caption text-ink-muted">&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

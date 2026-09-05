import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="sticky top-0 z-50 h-[56px] bg-canvas border-b border-hairline flex items-center justify-between px-6">
        <div className="flex items-center">
          <Link href="/" className="text-ink font-bold text-headline tracking-tighter">
            SkillBridge
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-body-sm text-ink hover:text-ink-muted">Home</Link>
          <Link href="/opportunities" className="text-body-sm text-ink hover:text-ink-muted">Opportunities</Link>
          <Link href="/about" className="text-body-sm text-ink hover:text-ink-muted">About</Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="secondary" className="rounded-pill px-4">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-pill px-4">Get Started</Button>
          </Link>
        </div>

        <div className="md:hidden flex items-center">
          <button className="text-ink p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-canvas border-t border-hairline py-[64px] px-[32px]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Platform</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/students">For Students</Link></li>
              <li><Link href="/industry">For Industry</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/documentation">Documentation</Link></li>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/community">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Partners</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/institutions">Institutions</Link></li>
              <li><Link href="/corporate">Corporate</Link></li>
              <li><Link href="/success-stories">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-caption text-ink font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-caption text-ink-muted">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/cookie">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between">
          <span className="text-headline text-ink font-bold tracking-tighter mb-4 md:mb-0">SkillBridge</span>
          <span className="text-caption text-ink-muted">&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

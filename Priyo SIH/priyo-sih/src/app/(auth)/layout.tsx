import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-ink font-bold text-headline tracking-tighter">
            SkillBridge
          </Link>
        </div>
        <div className="bg-surface-1 rounded-xl p-8 shadow-lg border border-hairline">
          {children}
        </div>
      </div>
    </div>
  );
}

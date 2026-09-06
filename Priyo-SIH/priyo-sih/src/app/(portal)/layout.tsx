import React from 'react';
import { PortalSidebar } from './PortalSidebar';
import { getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { PortalBreadcrumb } from '@/components/portal-breadcrumb';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCachedProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <PortalSidebar role={profile.role} userName={profile.full_name} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-[56px] border-b border-hairline flex items-center px-6 justify-between bg-surface-1">
          <PortalBreadcrumb />
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-ink text-sm font-bold">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

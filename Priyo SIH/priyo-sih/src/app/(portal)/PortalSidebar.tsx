'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROLE_NAV_ITEMS } from '@/lib/constants';
import {
  LogOut,
  LayoutDashboard,
  Brain,
  Briefcase,
  FileText,
  Settings,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  Zap,
  ClipboardCheck,
  Award,
  Handshake,
  PlusCircle,
  GraduationCap,
  UserSearch,
  Target,
  BarChart3,
  ShieldCheck,
  Network,
  Globe
} from 'lucide-react';
import { signOut } from '@/actions/auth';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Brain,
  Briefcase,
  FileText,
  Settings,
  Users,
  Building,
  Zap,
  ClipboardCheck,
  Award,
  Handshake,
  PlusCircle,
  GraduationCap,
  UserSearch,
  Target,
  BarChart3,
  ShieldCheck,
  Network,
  Globe,
};

export function PortalSidebar({ role, userName }: { role: string; userName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Safe fallback if role is not in constants
  const navItems = ROLE_NAV_ITEMS?.[role as keyof typeof ROLE_NAV_ITEMS] || [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  ];

  return (
    <div
      className={cn(
        'h-full bg-surface-1 border-r border-hairline flex flex-col transition-all duration-300',
        collapsed ? 'w-[64px]' : 'w-[240px]'
      )}
    >
      <div className="h-[56px] flex items-center justify-between px-4 border-b border-hairline">
        {!collapsed && (
          <Link href="/" className="text-ink font-bold text-headline tracking-tighter truncate">
            SkillBridge
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-ink-muted hover:text-ink p-1 rounded-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-surface-2 text-ink'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-body-sm font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-hairline">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3 mb-4')}>
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-ink flex-shrink-0 font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-body-sm font-medium text-ink truncate">{userName}</span>
              <span className="text-micro text-ink-muted capitalize truncate">{role.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        <form action={signOut} className={cn('mt-2', collapsed && 'flex justify-center')}>
          <Button
            variant="secondary"
            type="submit"
            className={cn(
              'text-ink-muted hover:text-ink hover:bg-surface-2',
              collapsed
                ? 'p-2 rounded-full w-10 h-10'
                : 'w-full rounded-md justify-start px-3 py-2'
            )}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={cn('w-5 h-5', !collapsed && 'mr-3')} />
            {!collapsed && <span className="text-body-sm">Sign Out</span>}
          </Button>
        </form>
      </div>
    </div>
  );
}

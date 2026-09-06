'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROLE_NAV_ITEMS } from '@/lib/constants';
import { SkillBridgeLogo } from '@/components/ui/skillbridge-logo';
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
  Globe,
  Landmark,
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
  Landmark,
};

const roleMeta: Record<string, { portalTitle: string; viewLabel: string; badgeClass: string; icon: typeof Landmark }> = {
  academician: {
    portalTitle: 'Faculty Portal',
    viewLabel: 'Academician View',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Landmark,
  },
  student: {
    portalTitle: 'Student Hub',
    viewLabel: 'Student View',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: GraduationCap,
  },
  industry_partner: {
    portalTitle: 'Partner Portal',
    viewLabel: 'Recruiter View',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Briefcase,
  },
  institution_admin: {
    portalTitle: 'Admin Portal',
    viewLabel: 'Institution View',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: Building,
  },
  super_admin: {
    portalTitle: 'Platform Admin',
    viewLabel: 'System View',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    icon: ShieldCheck,
  },
};

export function PortalSidebar({ role, userName }: { role: string; userName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Safe fallback if role is not in constants
  const navItems = ROLE_NAV_ITEMS?.[role as keyof typeof ROLE_NAV_ITEMS] || [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  ];

  const meta = roleMeta[role] || roleMeta.student;
  const RoleIcon = meta.icon;

  return (
    <div
      className={cn(
        'h-full bg-surface-1 border-r border-hairline flex flex-col transition-all duration-300',
        collapsed ? 'w-[64px]' : 'w-[250px]'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-[56px] flex items-center justify-between px-3 border-b border-hairline">
        {!collapsed ? (
          <SkillBridgeLogo size="sm" showTagline={false} showBadge={false} />
        ) : (
          <div className="mx-auto">
            <SkillBridgeLogo size="sm" showWordmark={false} href={null} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-ink-muted hover:text-ink p-1 rounded-md cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Role Banner Indicator */}
      {!collapsed ? (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl border flex items-center space-x-2.5 transition-all shadow-xs" style={{ backgroundColor: 'var(--surface-2)' }}>
          <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0", meta.badgeClass)}>
            <RoleIcon className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-caption font-semibold text-ink leading-tight truncate">{meta.portalTitle}</div>
            <div className="text-micro text-ink-muted truncate">{meta.viewLabel}</div>
          </div>
        </div>
      ) : (
        <div className="my-2 flex justify-center" title={`${meta.portalTitle} (${meta.viewLabel})`}>
          <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", meta.badgeClass)}>
            <RoleIcon className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Navigation Section Title */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {role === 'academician' ? 'Academician Menu' : role === 'student' ? 'Student Menu' : 'Workspace Menu'}
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-body-sm',
                isActive
                  ? role === 'academician'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20'
                    : 'bg-surface-2 text-ink font-semibold shadow-xs'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && role === 'academician' && "text-amber-600 dark:text-amber-400")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Info & Sign Out Footer */}
      <div className="p-3 border-t border-hairline">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3 mb-3')}>
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-ink flex-shrink-0 font-semibold text-caption">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-body-sm font-semibold text-ink truncate">{userName}</span>
              <span className={cn(
                "text-micro font-medium truncate",
                role === 'academician' ? "text-amber-600 dark:text-amber-400" : "text-ink-muted"
              )}>
                {role === 'academician' ? 'Faculty / Academician' : role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <form action={signOut} className={cn(collapsed && 'flex justify-center')}>
          <Button
            variant="secondary"
            type="submit"
            className={cn(
              'text-ink-muted hover:text-ink hover:bg-surface-2 cursor-pointer',
              collapsed
                ? 'p-2 rounded-full w-9 h-9'
                : 'w-full rounded-pill justify-start px-3 py-1.5 text-caption'
            )}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={cn('w-4 h-4', !collapsed && 'mr-2')} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </form>
      </div>
    </div>
  );
}

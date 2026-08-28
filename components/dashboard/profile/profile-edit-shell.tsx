'use client';

import React, { useState } from 'react';
import { DashboardHeader, DashboardSection } from '@/components/dashboard/dashboard-header';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { ProfileEditForm } from './profile-edit-form';
import { User } from '@/types/user.types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileEditShellProps {
  initialUser: User;
}

export function ProfileEditShell({ initialUser }: ProfileEditShellProps) {
  const router = useRouter();
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleLeftSidebarCollapse = (collapsed: boolean) => {
    setIsLeftSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-sidebar-collapsed', String(collapsed));
    }
  };

  const handleSectionChange = (section: DashboardSection, userId?: string | null) => {
    if (section === 'settings') {
      router.push('/dashboard/settings');
    } else if (section === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?section=${section}${userId ? `&id=${userId}` : ''}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F2EE] dark:bg-[#06080C] selection:bg-primary/20">
      <DashboardHeader 
        activeSection="settings"
        onSectionChange={handleSectionChange}
      />

      <LeftSidebar
        isCollapsed={isLeftSidebarCollapsed}
        onToggle={() => handleLeftSidebarCollapse(!isLeftSidebarCollapsed)}
        activeSection="settings"
        onSectionChange={handleSectionChange}
      />

      <main className={cn(
        "flex-1 flex flex-col min-w-0 pt-20 lg:pt-16 pb-16 lg:pb-0 transition-all duration-300",
        isLeftSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
      )}>
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-card border border-border rounded-sm shadow-sm p-6 sm:p-8">
            <ProfileEditForm initialUser={initialUser} />
          </div>
        </div>
      </main>

      <MobileBottomNav
        activeSection="settings"
        onSectionChange={handleSectionChange}
      />
    </div>
  );
}


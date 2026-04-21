'use client';

import React, { useState } from 'react';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ProfileEditForm } from './profile-edit-form';
import { User } from '@/types/user.types';
import { useRouter } from 'next/navigation';
import { DashboardSection } from '../left-sidebar';

interface ProfileEditShellProps {
  initialUser: User;
}

export function ProfileEditShell({ initialUser }: ProfileEditShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleSectionChange = (section: DashboardSection) => {
    if (section === 'Profile') return;
    // For now, redirect to dashboard with the selected section
    // In a full implementation, we'd persist this in state or URL
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20">
      <LeftSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSection="Profile"
        onSectionChange={() => {
           // On this page, section changes are usually navigation
           // handled by the Sidebar itself if it uses Links, but here it's still using handlers
        }}
      />

      <DashboardHeader 
        isCollapsed={isSidebarCollapsed} 
        activeSection="Profile"
        onSectionChange={handleSectionChange}
      />

      <main className="flex-1 flex flex-col pt-16 transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 custom-scrollbar">
          <ProfileEditForm initialUser={initialUser} />
        </div>
      </main>
    </div>
  );
}

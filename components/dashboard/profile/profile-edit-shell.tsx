'use client';

import React, { useState } from 'react';
import { DashboardHeader, DashboardSection } from '@/components/dashboard/dashboard-header';
import { ProfileEditForm } from './profile-edit-form';
import { User } from '@/types/user.types';
import { useRouter } from 'next/navigation';

interface ProfileEditShellProps {
  initialUser: User;
}

export function ProfileEditShell({ initialUser }: ProfileEditShellProps) {
  const router = useRouter();

  const handleSectionChange = (section: DashboardSection) => {
    if (section === 'Profile') return;
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20">
      <DashboardHeader 
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

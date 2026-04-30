import React from 'react';
import { cookies } from 'next/headers';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { User } from '@/types/user.types';
import { appConfig } from '@/lib/config';

import { ProfileEditShell } from '@/components/dashboard/profile/profile-edit-shell';

async function getProfileData() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  try {
    const response = await fetch(`${appConfig.serverApiBaseUrl}/auth/profile/`, {
      headers: {
        'Cookie': cookieString,
      },
      next: { revalidate: 0 }, // Ensure fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data as User;
  } catch (error) {
    console.error('Failed to fetch profile on server:', error);
    return null;
  }
}

export default async function ProfileEditPage() {
  const user = await getProfileData();

  return (
    <DashboardThemeProvider>
      {user ? (
         <ProfileEditShell initialUser={user} />
      ) : (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Synchronizing your workspace...</p>
         </div>
      )}
    </DashboardThemeProvider>
  );
}

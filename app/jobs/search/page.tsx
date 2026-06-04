'use client';

import React from 'react';
import { DashboardThemeProvider } from '../../../context/DashboardThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { GlobalLoader } from '@/components/ui/global-loader';
import { SearchResultsPage } from '@/components/dashboard/search/search-results-page';

export default function SearchPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !user) {
    return <GlobalLoader />;
  }

  const handleSectionChange = (section: any, queryOrId?: string | null) => {
    if (section === 'search') {
      router.push(`/jobs/search?q=${encodeURIComponent(queryOrId || '')}`);
    } else {
      router.push(`/dashboard?section=${section}${queryOrId ? `&id=${queryOrId}` : ''}`);
    }
  };

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">
        <DashboardHeader
          activeSection={"search" as any}
          onSectionChange={handleSectionChange}
        />

        <div className="flex-1 flex flex-col min-w-0 pt-20 lg:pt-16 pb-16 lg:pb-0 lg:h-screen lg:overflow-hidden p-4 sm:p-6 lg:p-8 lg:pt-4">
          <SearchResultsPage searchQuery={searchQuery} onSectionChange={handleSectionChange} />
        </div>

        <MobileBottomNav
          activeSection={"search" as any}
          onSectionChange={handleSectionChange}
        />
      </div>
    </DashboardThemeProvider>
  );
}

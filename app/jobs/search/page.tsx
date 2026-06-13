'use client';

import React, { useState } from 'react';
import { DashboardThemeProvider } from '../../../context/DashboardThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { GlobalLoader } from '@/components/ui/global-loader';
import { SearchResultsPage } from '@/components/dashboard/search/search-results-page';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

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

        <LeftSidebar
          isCollapsed={isLeftSidebarCollapsed}
          onToggle={() => handleLeftSidebarCollapse(!isLeftSidebarCollapsed)}
          activeSection={"jobs" as any}
          onSectionChange={handleSectionChange}
        />

        <div className={cn(
          "flex-1 flex flex-col min-w-0 pt-20 lg:pt-16 pb-16 lg:pb-0 lg:h-screen lg:overflow-hidden transition-all duration-300",
          isLeftSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
        )}>
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

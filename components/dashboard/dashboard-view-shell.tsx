'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RightSidebar } from '@/components/dashboard/right-sidebar';
import { LeftSidebar } from './left-sidebar';
import { Feed } from '@/components/dashboard/feed';
import { EcosystemContent } from '@/components/dashboard/ecosystem-content';
import { MessagesView } from '@/components/dashboard/messages/messages-view';
import { LinkedInMessenger } from '@/components/dashboard/messages/popupmessageview/linkedin-messenger';
import { NetworkView } from '@/components/dashboard/network/network-view';
import { SettingsView } from '@/components/dashboard/settings/settings/settings-view';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { JobsView } from '@/components/dashboard/jobs/jobs-view';
import { NewsView } from '@/components/dashboard/news/news-view';
import { NotificationsView } from '@/components/dashboard/notifications/notifications-view';
import { CreditView } from '@/components/creditsystem/credit-view';
import { GlobalLoader } from '@/components/ui/global-loader';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Briefcase, Newspaper, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { MobilePostView } from '@/components/dashboard/post/mobile-post-view';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSection } from './dashboard-header';
import { PricingTable } from '@/components/Public/pricing/pricing-table';

export function DashboardViewShell() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatIntent, setChatIntent] = useState<'connection' | 'direct' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // LinkedIn/Google-style back-button trap:
  // Push a duplicate history entry so pressing back stays on dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.history.pushState(null, '', window.location.href);

      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isLoading, isAuthenticated]);

  // Support deep-linking to specific dashboard sections (e.g. section=premium from premium-locker)
  useEffect(() => {
    if (!isLoading && isAuthenticated && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && ['dashboard', 'Profile', 'jobs', 'news', 'messages', 'network', 'settings', 'hire', 'notifications', 'premium', 'credits'].includes(section)) {
        setActiveSection(section as DashboardSection);
        // Strip the query param to keep the URL clean
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [isLoading, isAuthenticated]);

  // Close mobile sidebar on navigation
  const handleSectionChange = (section: DashboardSection, userId: string | null = null, intent?: 'connection' | 'direct') => {
    if ((section as string) === 'search') {
      router.push(`/jobs/search?q=${encodeURIComponent(userId || '')}`);
      return;
    }
    if (section === activeSection && userId === selectedProfileId) return;
    setIsTransitioning(true);
    setActiveSection(section);
    setSelectedProfileId(userId);
    setChatIntent(intent || null);
    // Artificial delay to make the transition feel intentional and premium
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  };

  useEffect(() => {
    const handleCustomSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        handleSectionChange(customEvent.detail as DashboardSection);
      }
    };
    window.addEventListener('dashboard-section-change', handleCustomSectionChange);
    return () => window.removeEventListener('dashboard-section-change', handleCustomSectionChange);
  }, [activeSection, selectedProfileId]);

  const handleProfileNavigate = (userId: string) => {
    handleSectionChange('Profile', userId);
  };

  if (isLoading || !isAuthenticated || !user) {
    return <GlobalLoader />;
  }

  const renderContent = () => {
    if (isTransitioning) {
      return (
        <div className="flex-1 flex items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse"></div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'Profile':
        return <EcosystemContent userId={selectedProfileId} />;
      case 'jobs':
        return (
          <div className="flex-1 flex flex-col p-4 sm:p-8 transition-all ease-out min-h-0">
            {/* Recruiter CTA Banner - Hidden on mobile for cleaner UX */}
            <a
              href="/recruiter/register"
              className="hidden md:block group relative mb-8 w-full rounded-sm overflow-hidden border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#0a66c2]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-[#0a66c2]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Are you a company? Start posting jobs</p>
                    <p className="text-sm text-muted-foreground">Reach thousands of founders and professionals on B2linq</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#0a66c2] text-white text-sm font-bold shadow-md shadow-[#0a66c2]/20 hover:bg-[#004182] transition-all">
                  Register Now →
                </div>
              </div>
            </a>

            {/* Active Job Listings */}
            <div className="flex-1 min-h-0">
              <JobsView
                initialSearch={selectedProfileId?.includes('-') ? null : selectedProfileId}
                initialJobId={selectedProfileId?.includes('-') ? selectedProfileId : null}
                onNavigateToMessages={(userId) => handleSectionChange('messages', userId, 'direct')}
                onSectionChange={handleSectionChange}
              />
            </div>
          </div>
        );
      case 'news':
        return <NewsView selectedNewsId={selectedProfileId} />;
      case 'messages':
        return <MessagesView targetUserId={selectedProfileId} roomType="personal" chatIntent={chatIntent} />;
      case 'network':
        return <NetworkView onSectionChange={handleSectionChange} />;
      case 'settings':
        return <SettingsView onSectionChange={handleSectionChange} />;
      case 'hire':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-dashed border-primary/30 flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="w-10 h-10 text-primary opacity-40 group-hover:opacity-60 transition-all group-hover:scale-110" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-2">Talent Portal Coming Soon</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center font-medium leading-relaxed">
              We're building a premium hiring experience for the startup ecosystem. Stay tuned!
            </p>
          </div>
        );
      case 'notifications':
        return <NotificationsView />;
      case 'premium':
        return (
          <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full overflow-y-auto">
            <div className="flex items-center">
              <button
                onClick={() => handleSectionChange('dashboard')}
                className="group flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs font-bold shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Feed
              </button>
            </div>
            <PricingTable />
          </div>
        );
      case 'credits':
        return (
          <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full overflow-y-auto">
            <div className="flex items-center">
              <button
                onClick={() => handleSectionChange('dashboard')}
                className="group flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs font-bold shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Feed
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-6 sm:p-8 shadow-sm backdrop-blur-sm">
              <CreditView />
            </div>
          </div>
        );
      case 'create-post':
        return (
          <MobilePostView
            onClose={() => handleSectionChange('dashboard')}
            onPostSuccess={() => {
              handleSectionChange('dashboard');
              queryClient.invalidateQueries({ queryKey: ['posts', user?.id] });
            }}
          />
        );
      case 'dashboard':
      default:
        return (
          <Feed
            isRightCollapsed={isRightSidebarCollapsed}
            onNavigateToProfile={handleProfileNavigate}
          />
        );
    }
  };

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">


        <DashboardHeader
          isRightCollapsed={isRightSidebarCollapsed}
          hasRightSidebar={activeSection === 'dashboard'}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <LeftSidebar
          isCollapsed={isLeftSidebarCollapsed}
          onToggle={() => handleLeftSidebarCollapse(!isLeftSidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <div className={cn(
          "flex-1 flex flex-col min-w-0 pt-16 pb-16 lg:pb-0 transition-all duration-300",
          isLeftSidebarCollapsed ? "lg:pl-20" : "lg:pl-60",
          activeSection === 'dashboard' && "xl:pr-[290px] 2xl:pr-[340px]",
          activeSection === 'messages' ? "h-screen overflow-hidden" : "min-h-0",
          activeSection === 'settings' ? "md:h-screen md:overflow-hidden" : ""
        )}>
          {renderContent()}
        </div>

        {activeSection === 'dashboard' && (
          <RightSidebar
            isCollapsed={isRightSidebarCollapsed}
            onToggle={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
            onNavigateNews={(newsId) => handleSectionChange('news', newsId)}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* LinkedIn-style Floating Messenger */}
        {activeSection === 'dashboard' && (
          <div className="hidden md:block">
            <LinkedInMessenger />
          </div>
        )}
      </div>
    </DashboardThemeProvider>
  );
}

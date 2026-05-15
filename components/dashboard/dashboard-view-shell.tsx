'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RightSidebar } from '@/components/dashboard/right-sidebar';
import { Feed } from '@/components/dashboard/feed';
import { EcosystemContent } from '@/components/dashboard/ecosystem-content';
import { MessagesView } from '@/components/dashboard/messages/messages-view';
import { NetworkView } from '@/components/dashboard/network/network-view';
import { SettingsView } from '@/components/dashboard/settings/settings-view';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { JobsView } from '@/components/dashboard/jobs/jobs-view';
import { NewsView } from '@/components/dashboard/news/news-view';
import { NotificationsView } from '@/components/dashboard/notifications/notifications-view';
import { GlobalLoader } from '@/components/ui/global-loader';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Briefcase, Newspaper, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { MobilePostView } from '@/components/dashboard/post/mobile-post-view';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSection } from './dashboard-header';

export function DashboardViewShell() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatIntent, setChatIntent] = useState<'connection' | 'direct' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
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

  // Close mobile sidebar on navigation
  const handleSectionChange = (section: DashboardSection, userId: string | null = null, intent?: 'connection' | 'direct') => {
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
          <div className="flex-1 flex flex-col p-4 sm:p-8 transition-all ease-out">
            {/* Recruiter CTA Banner - Hidden on mobile for cleaner UX */}
            <a
              href="/recruiter/register"
              className="hidden md:block group relative mb-8 w-full rounded-sm overflow-hidden border border-black bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Are you a company? Start posting jobs</p>
                    <p className="text-sm text-muted-foreground">Reach thousands of founders and professionals on B2linq</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-sm bg-emerald-500 text-white text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all">
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
        return <SettingsView />;
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

        <div className={cn(
          "flex-1 flex flex-col min-w-0 pt-16 pb-16 lg:pb-0"
        )}>
          {renderContent()}
        </div>

        {activeSection === 'dashboard' && (
          <RightSidebar
            isCollapsed={isRightSidebarCollapsed}
            onToggle={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
            onNavigateNews={(newsId) => handleSectionChange('news', newsId)}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>
    </DashboardThemeProvider>
  );
}

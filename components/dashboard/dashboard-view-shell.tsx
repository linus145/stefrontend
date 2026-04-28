'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LeftSidebar, DashboardSection } from '@/components/dashboard/left-sidebar';
import { RightSidebar } from '@/components/dashboard/right-sidebar';
import { Feed } from '@/components/dashboard/feed';
import { EcosystemContent } from '@/components/dashboard/ecosystem-content';
import { MessagesView } from '@/components/dashboard/messages/messages-view';
import { NetworkView } from '@/components/dashboard/network/network-view';
import { SettingsView } from '@/components/dashboard/settings/settings-view';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { JobsView } from '@/components/dashboard/jobs/jobs-view';
import { GlobalLoader } from '@/components/ui/global-loader';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Briefcase, Newspaper, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { MobilePostView } from '@/components/dashboard/post/mobile-post-view';

export function DashboardViewShell() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

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
  const handleSectionChange = (section: DashboardSection, userId: string | null = null) => {
    if (section === activeSection && userId === selectedProfileId) return;
    setIsTransitioning(true);
    setActiveSection(section);
    setSelectedProfileId(userId);
    setIsMobileSidebarOpen(false); // Close mobile sidebar on nav
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
        return <EcosystemContent isCollapsed={isSidebarCollapsed} userId={selectedProfileId} />;
      case 'jobs':
        return (
          <div className={cn(
            "flex-1 flex flex-col p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out",
            "lg:ml-0",
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
          )}>
            {/* Recruiter CTA Banner */}
            <a
              href="/recruiter/register"
              className="group relative mb-8 w-full rounded-xl overflow-hidden border border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-teal-500/5 hover:from-teal-500/10 hover:via-cyan-500/10 hover:to-teal-500/10 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-400 opacity-70" />
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Are you a company? Start posting jobs</p>
                    <p className="text-xs text-muted-foreground">Reach thousands of founders and professionals on B2linq</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold shadow-sm group-hover:shadow-lg transition-all">
                  Register →
                </div>
              </div>
            </a>

            {/* Active Job Listings */}
            <div className="flex-1 min-h-0">
               <JobsView isCollapsed={isSidebarCollapsed} />
            </div>
          </div>
        );
      case 'news':
        return (
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out",
            "lg:ml-0",
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
          )}>
            <div className="w-24 h-24 rounded-3xl bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Newspaper className="w-10 h-10 text-muted-foreground opacity-20 group-hover:opacity-40 transition-all group-hover:scale-110" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-2">No news available</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center font-medium leading-relaxed">
              The ecosystem logic is currently processing new posts. Please check back shortly for verified news.
            </p>
          </div>
        );
      case 'messages':
        return <MessagesView isCollapsed={isSidebarCollapsed} targetUserId={selectedProfileId} />;
      case 'network':
        return <NetworkView isCollapsed={isSidebarCollapsed} onSectionChange={handleSectionChange} />;
      case 'settings':
        return <SettingsView isCollapsed={isSidebarCollapsed} />;
      case 'hire':
        return (
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out",
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
          )}>
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
      case 'create-post':
        return (
          <MobilePostView 
            onClose={() => handleSectionChange('dashboard')} 
            onPostSuccess={() => {
              handleSectionChange('dashboard');
              // Optionally refresh feed
            }} 
          />
        );
      case 'dashboard':
      default:
        return (
          <Feed 
            isCollapsed={isSidebarCollapsed} 
            isRightCollapsed={isRightSidebarCollapsed}
            onNavigateToProfile={handleProfileNavigate} 
          />
        );
    }
  };

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <LeftSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <DashboardHeader
          isCollapsed={isSidebarCollapsed}
          isRightCollapsed={isRightSidebarCollapsed}
          hasRightSidebar={activeSection === 'dashboard'}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0 pt-16 pb-16 lg:pb-0">
          {renderContent()}
        </div>

        {activeSection === 'dashboard' && (
          <RightSidebar 
            isCollapsed={isRightSidebarCollapsed} 
            onToggle={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)} 
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

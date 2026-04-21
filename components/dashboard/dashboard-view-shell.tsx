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
import { GlobalLoader } from '@/components/ui/global-loader';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Briefcase, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardViewShell() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSectionChange = (section: DashboardSection) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setActiveSection(section);
    // Artificial delay to make the transition feel intentional and premium
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
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
        return <EcosystemContent isCollapsed={isSidebarCollapsed} />;
      case 'jobs':
        return (
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out",
            isSidebarCollapsed ? "ml-20" : "ml-60"
          )}>
             <div className="w-24 h-24 rounded-3xl bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Briefcase className="w-10 h-10 text-muted-foreground opacity-20 group-hover:opacity-40 transition-all group-hover:scale-110" />
             </div>
             <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-2">No active listings</h3>
             <p className="text-muted-foreground text-sm max-w-xs text-center font-medium leading-relaxed">
               There are currently no job posts or ecosystem feeds available in this section.
             </p>
          </div>
        );
      case 'news':
        return (
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-all ease-out",
            isSidebarCollapsed ? "ml-20" : "ml-60"
          )}>
             <div className="w-24 h-24 rounded-3xl bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Newspaper className="w-10 h-10 text-muted-foreground opacity-20 group-hover:opacity-40 transition-all group-hover:scale-110" />
             </div>
             <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-2">No news available</h3>
             <p className="text-muted-foreground text-sm max-w-xs text-center font-medium leading-relaxed">
               The ecosystem logic is currently processing new signals. Please check back shortly for verified news.
             </p>
          </div>
        );
      case 'messages':
        return <MessagesView isCollapsed={isSidebarCollapsed} />;
      case 'network':
        return <NetworkView isCollapsed={isSidebarCollapsed} onSectionChange={handleSectionChange} />;
      case 'settings':
        return <SettingsView isCollapsed={isSidebarCollapsed} />;
      case 'dashboard':
      default:
        return <Feed isCollapsed={isSidebarCollapsed} />;
    }
  };

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">
        <LeftSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <DashboardHeader 
          isCollapsed={isSidebarCollapsed} 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <div className="flex-1 flex flex-col pt-16">
          {renderContent()}
        </div>

        {activeSection === 'dashboard' && <RightSidebar />}
      </div>
    </DashboardThemeProvider>
  );
}

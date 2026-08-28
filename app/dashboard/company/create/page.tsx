'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { companyPageService, CompanyPageDetail } from '@/services/company-page.service';
import { ExistingCompanyCard } from '@/components/dashboard/createpage/existing-company-card';
import { CreatePageWizard } from '@/components/dashboard/createpage/create-page-wizard';
import { DashboardHeader, DashboardSection } from '@/components/dashboard/dashboard-header';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateCompanyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [existingCompany, setExistingCompany] = useState<CompanyPageDetail | null>(null);
  const [mode, setMode] = useState<'view_existing' | 'create_new' | 'edit_existing'>('view_existing');

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
    if (section === 'dashboard') {
      router.push('/dashboard');
    } else if (section === 'settings') {
      router.push('/dashboard/settings');
    } else {
      router.push(`/dashboard?section=${section}${userId ? `&id=${userId}` : ''}`);
    }
  };

  useEffect(() => {
    async function checkCompany() {
      setLoading(true);
      try {
        const res = await companyPageService.checkUserCompany();
        if (res.has_company && res.company) {
          setExistingCompany(res.company);
          setMode('view_existing');
        } else {
          setMode('create_new');
        }
      } catch (err) {
        console.error('Failed to check user company', err);
        setMode('create_new');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkCompany();
    }
  }, [user, authLoading]);

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">
        {/* Dashboard Header */}
        <DashboardHeader
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />

        {/* Dashboard Left Sidebar */}
        <LeftSidebar
          isCollapsed={isLeftSidebarCollapsed}
          onToggle={() => handleLeftSidebarCollapse(!isLeftSidebarCollapsed)}
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0 pt-20 lg:pt-16 pb-16 lg:pb-8 transition-all duration-300",
            isLeftSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
          )}
        >
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Breadcrumb Header */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-md border border-border/60">
                <Building2 className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span className="font-medium text-foreground">Company Pages</span>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 bg-card border border-border rounded-lg p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Checking your organization profile...</p>
              </div>
            ) : (
              <div>
                {mode === 'view_existing' && existingCompany ? (
                  <ExistingCompanyCard
                    company={existingCompany}
                    onEdit={() => setMode('edit_existing')}
                    onCreateNew={() => setMode('create_new')}
                  />
                ) : mode === 'edit_existing' && existingCompany ? (
                  <CreatePageWizard
                    isEditing={true}
                    initialData={{
                      company_name: existingCompany.company_name,
                      slug: existingCompany.slug,
                      tagline: existingCompany.tagline,
                      page_type: existingCompany.page_type,
                      industry: existingCompany.industry,
                      company_size: existingCompany.company_size,
                      website: existingCompany.website,
                      location: existingCompany.location,
                      description: existingCompany.overview || existingCompany.description,
                      founded_year: existingCompany.founded_year,
                      logo_url: existingCompany.custom_logo_url || existingCompany.logo_url,
                      banner_url: existingCompany.custom_banner_url || existingCompany.banner_url,
                      call_to_action_label: existingCompany.call_to_action_label,
                      call_to_action_url: existingCompany.call_to_action_url,
                    }}
                    onCancel={() => setMode('view_existing')}
                  />
                ) : (
                  <CreatePageWizard
                    onCancel={existingCompany ? () => setMode('view_existing') : undefined}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />
      </div>
    </DashboardThemeProvider>
  );
}

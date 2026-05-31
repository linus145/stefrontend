'use client';

import React from 'react';
import { HRSection } from '../../hr-header';
import { DashboardView } from '@/components/hrtool/tabs/performance/subtabs/dashboard-view';
import { LocalLoader } from '@/components/ui/local-loader';

// Lazy loaded subtabs
const KpiOverviewView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/kpi-overview-view').then(m => ({ default: m.KpiOverviewView })));
const GoalsView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/goals-view').then(m => ({ default: m.GoalsView })));
const AppraisalEngineView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/appraisal-engine-view').then(m => ({ default: m.AppraisalEngineView })));
const AnalyticsView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/analytics-view').then(m => ({ default: m.AnalyticsView })));
const AiInsightsView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/ai-insights-view').then(m => ({ default: m.AiInsightsView })));
const LogsView = React.lazy(() => import('@/components/hrtool/tabs/performance/subtabs/logs-view').then(m => ({ default: m.LogsView })));

interface PerformanceTabProps {
  subTab?: HRSection | string;
}

export function PerformanceTab({ subTab }: PerformanceTabProps) {
  // If no specific subTab is provided, default to the dashboard
  const currentTab = subTab || 'performance-dashboard';

  return (
    <React.Suspense fallback={<LocalLoader />}>
      {currentTab === 'performance-dashboard' && <DashboardView />}
      {currentTab === 'performance' && <DashboardView />}

      {currentTab === 'performance-kpi' && <KpiOverviewView />}
      {currentTab === 'performance-goals' && <GoalsView />}
      {currentTab === 'performance-appraisal' && <AppraisalEngineView />}
      {currentTab === 'performance-analytics' && <AnalyticsView />}
      {currentTab === 'performance-ai-insights' && <AiInsightsView />}
      {currentTab === 'performance-logs' && <LogsView />}
    </React.Suspense>
  );
}

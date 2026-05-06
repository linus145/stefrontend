'use client';

import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import {
  Briefcase, Users, UserCheck, Clock, TrendingUp,
  FileText, Loader2, Plus, ArrowRight
} from 'lucide-react';
import { RecruiterSection } from './recruiter-sidebar';

interface OverviewTabProps {
  onNavigate: (tab: RecruiterSection) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: jobsService.getDashboardStats,
    refetchInterval: 30000,
  });

  const stats = statsResponse?.data;

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:ml-0"
    )}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Recruitment Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Track your hiring pipeline and manage job postings
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Jobs"
              value={stats?.total_jobs ?? 0}
              icon={<Briefcase className="w-5 h-5" />}
              color="teal"
            />
            <StatCard
              label="Active Jobs"
              value={stats?.active_jobs ?? 0}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Total Applications"
              value={stats?.total_applications ?? 0}
              icon={<Users className="w-5 h-5" />}
              color="cyan"
            />
            <StatCard
              label="Hired"
              value={stats?.hired ?? 0}
              icon={<UserCheck className="w-5 h-5" />}
              color="violet"
            />
          </div>

          {/* Application Pipeline */}
          <div className="bg-card border border-border rounded-sm p-6 mb-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5">
              Application Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <PipelineStage label="Pending" count={stats?.pending_applications ?? 0} color="amber" />
              <PipelineStage label="Reviewed" count={stats?.reviewed ?? 0} color="blue" />
              <PipelineStage label="Shortlisted" count={stats?.shortlisted ?? 0} color="cyan" />
              <PipelineStage label="Hired" count={stats?.hired ?? 0} color="emerald" />
              <PipelineStage label="Rejected" count={stats?.rejected ?? 0} color="red" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('my-jobs')}
              className="group flex items-center gap-4 p-5 bg-card border border-border rounded-sm hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-sm bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Post a New Job</p>
                <p className="text-xs text-muted-foreground">Create a new job listing</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('applications')}
              className="group flex items-center gap-4 p-5 bg-card border border-border rounded-sm hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-sm bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Review Applications</p>
                <p className="text-xs text-muted-foreground">
                  {(stats?.pending_applications ?? 0) > 0 ? `${stats?.pending_applications} pending` : 'All caught up!'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    teal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="bg-card border border-border rounded-sm p-5 hover:shadow-md transition-shadow group">
      <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", colorMap[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function PipelineStage({ label, count, color }: { label: string; count: number; color: string }) {
  const dotColors: Record<string, string> = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-sm bg-muted/30 border border-border/50">
      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColors[color])} />
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{count}</p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

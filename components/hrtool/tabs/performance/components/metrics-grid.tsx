'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Award, MessageSquare, TrendingUp } from 'lucide-react';
import { PerformanceAnalytics } from '@/types/performance';

interface MetricsGridProps {
  analytics?: PerformanceAnalytics;
  isLoading?: boolean;
}

export function MetricsGrid({ analytics, isLoading }: MetricsGridProps) {
  // Graceful empty states
  const avgScore = analytics?.companyAverage || null;
  const isAvgAvailable = avgScore !== null && avgScore > 0;
  
  const okrsCount = analytics?.activeOkrsCount ?? 0;
  const pendingCount = analytics?.pendingAppraisalsCount ?? 0;
  const qoqDelta = analytics?.quarterOverQuarterDelta ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-card/50 border-border/50 rounded-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Award className="h-3 w-3 text-blue-500" />
            Company Avg Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-end gap-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {isLoading ? '--' : (isAvgAvailable ? `${avgScore.toFixed(1)}%` : 'N/A')}
            </h2>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50 rounded-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            QoQ Delta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-end gap-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-emerald-500">
              {isLoading ? '--' : `+${qoqDelta}%`}
            </h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 rounded-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3 w-3 text-blue-500" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-end gap-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight">{isLoading ? '--' : okrsCount}</h2>
            <span className="text-[10px] text-muted-foreground font-bold mb-1">tracked</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 rounded-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-amber-500" />
            Pending Appraisals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-end gap-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight">{isLoading ? '--' : pendingCount}</h2>
            <span className="text-[10px] text-muted-foreground font-bold mb-1">drafts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { hrPerformanceService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, LayoutGrid, Users } from 'lucide-react';

export function AnalyticsView() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['performance-analytics'],
    queryFn: () => hrPerformanceService.getAnalytics(),
  });

  const dist = analyticsData?.distribution9Box;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50 rounded-sm lg:col-span-2">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#0a66c2]" />
              Enterprise 9-Box Grid
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading analytics...</div>
            ) : dist ? (
              <div className="max-w-2xl mx-auto">
                <div data-agent="analytics-9box-grid" className="grid grid-cols-3 gap-2 h-96">
                  {/* Top Row: High Potential */}
                  <div data-agent="analytics-9box-stars" className="bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex flex-col items-center justify-center relative group hover:bg-emerald-500/20 transition-all">
                    <span className="text-4xl font-extrabold text-emerald-600">{dist.highPerformanceHighPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-emerald-700/60">Stars</span>
                  </div>
                  <div data-agent="analytics-9box-high-potentials" className="bg-emerald-500/5 border border-emerald-500/20 rounded-sm flex flex-col items-center justify-center relative group hover:bg-emerald-500/10 transition-all">
                    <span className="text-4xl font-extrabold text-emerald-600">{dist.medPerformanceHighPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-emerald-700/60">High Potentials</span>
                  </div>
                  <div data-agent="analytics-9box-enigmas" className="bg-amber-500/10 border border-amber-500/30 rounded-sm flex flex-col items-center justify-center relative group hover:bg-amber-500/20 transition-all">
                    <span className="text-4xl font-extrabold text-amber-600">{dist.lowPerformanceHighPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-amber-700/60">Enigmas</span>
                  </div>

                  {/* Middle Row: Med Potential */}
                  <div data-agent="analytics-9box-high-performers" className="bg-emerald-500/5 border border-emerald-500/20 rounded-sm flex flex-col items-center justify-center relative group hover:bg-emerald-500/10 transition-all">
                    <span className="text-4xl font-extrabold text-emerald-600">{dist.highPerformanceMedPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-emerald-700/60">High Performers</span>
                  </div>
                  <div data-agent="analytics-9box-core-players" className="bg-blue-500/10 border border-blue-500/30 rounded-sm flex flex-col items-center justify-center relative group hover:bg-blue-500/20 transition-all">
                    <span className="text-4xl font-extrabold text-blue-600">{dist.medPerformanceMedPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-blue-700/60">Core Players</span>
                  </div>
                  <div data-agent="analytics-9box-dilemmas" className="bg-amber-500/5 border border-amber-500/20 rounded-sm flex flex-col items-center justify-center relative group hover:bg-amber-500/10 transition-all">
                    <span className="text-4xl font-extrabold text-amber-600">{dist.lowPerformanceMedPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-amber-700/60">Dilemmas</span>
                  </div>

                  {/* Bottom Row: Low Potential */}
                  <div data-agent="analytics-9box-workhorses" className="bg-amber-500/10 border border-amber-500/30 rounded-sm flex flex-col items-center justify-center relative group hover:bg-amber-500/20 transition-all">
                    <span className="text-4xl font-extrabold text-amber-600">{dist.highPerformanceLowPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-amber-700/60">Workhorses</span>
                  </div>
                  <div data-agent="analytics-9box-inconsistent" className="bg-amber-500/5 border border-amber-500/20 rounded-sm flex flex-col items-center justify-center relative group hover:bg-amber-500/10 transition-all">
                    <span className="text-4xl font-extrabold text-amber-600">{dist.medPerformanceLowPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-amber-700/60">Inconsistent</span>
                  </div>
                  <div data-agent="analytics-9box-underperformers" className="bg-rose-500/10 border border-rose-500/30 rounded-sm flex flex-col items-center justify-center relative group hover:bg-rose-500/20 transition-all">
                    <span className="text-4xl font-extrabold text-rose-600">{dist.lowPerformanceLowPotential}</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-widest font-bold text-rose-700/60">Underperformers</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                  <span>← Low Performance</span>
                  <span>High Performance →</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-sm space-y-4">
                <LayoutGrid className="h-10 w-10 opacity-20" />
                <p>Not enough data to map 9-box distribution.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card data-agent="analytics-company-average-card" className="bg-card/50 border-border/50 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-[#0a66c2]" />
                Company Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-extrabold text-foreground">
                {analyticsData?.companyAverage ? `${analyticsData.companyAverage.toFixed(1)}%` : '--'}
              </h2>
            </CardContent>
          </Card>
          
          <Card data-agent="analytics-total-appraisals-card" className="bg-card/50 border-border/50 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3 text-emerald-500" />
                Total Appraisals Calculated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-extrabold text-foreground">
                {dist ? Object.values(dist).reduce((a, b) => a + b, 0) : '--'}
              </h2>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AiInsightsView() {
  const queryClient = useQueryClient();

  // Fetch AI Insights
  const { data: insightsData, isLoading, refetch } = useQuery({
    queryKey: ['performance-ai-insights'],
    queryFn: () => hrPerformanceService.generateAIInsights(), // Fetch on-load
  });

  // Mutate/Generate New Insights
  const generateMutation = useMutation({
    mutationFn: () => hrPerformanceService.generateAIInsights(),
    onSuccess: (data) => {
      toast.success('AI Insights updated successfully.');
      queryClient.setQueryData(['performance-ai-insights'], data);
    },
    onError: () => {
      toast.error('Failed to generate new AI Insights.');
    },
  });

  const flightRisks = insightsData?.flightRisks || [];
  const topPerformers = insightsData?.topPerformers || [];
  const skillGaps = insightsData?.skillGaps || [];

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const isWorking = isLoading || generateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground text-sm">Automated analysis of flight risks, top performers, and skill gaps.</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isWorking}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-sm"
        >
          {isWorking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate New Insights
            </>
          )}
        </Button>
      </div>

      {isWorking && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Gemini is analyzing employee goals, appraisals, and 360-degree feedback...
          </p>
        </div>
      )}

      {!isWorking && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Flight Risk Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Flight Risks
            </h3>
            {flightRisks.length === 0 ? (
              <Card className="bg-slate-50/50 border-dashed rounded-sm p-6 text-center text-xs text-muted-foreground">
                No flight risks identified.
              </Card>
            ) : (
              flightRisks.map((risk: any, i: number) => (
                <Card key={`risk-${i}`} className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 rounded-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      {risk.employeeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {risk.reason}
                    </p>
                    <div className="bg-amber-500/10 rounded-sm p-2 border border-amber-500/10">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">Recommended Action:</span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium">{risk.actionPlan}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Top Performer Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> High Performers
            </h3>
            {topPerformers.length === 0 ? (
              <Card className="bg-slate-50/50 border-dashed rounded-sm p-6 text-center text-xs text-muted-foreground">
                No performance outliers detected yet.
              </Card>
            ) : (
              topPerformers.map((perf: any, i: number) => (
                <Card key={`perf-${i}`} className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 rounded-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      {perf.teamName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {perf.description}
                    </p>
                    <div className="bg-emerald-500/10 rounded-sm p-2 border border-emerald-500/10">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">Recognition Step:</span>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-200 font-medium">{perf.action}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Skill Gap Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
              <TrendingDown className="h-3.5 w-3.5 text-indigo-500" /> Skill Gaps
            </h3>
            {skillGaps.length === 0 ? (
              <Card className="bg-slate-50/50 border-dashed rounded-sm p-6 text-center text-xs text-muted-foreground">
                No significant skill gaps identified.
              </Card>
            ) : (
              skillGaps.map((gap: any, i: number) => (
                <Card key={`gap-${i}`} className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-indigo-500/20 rounded-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
                      {gap.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {gap.description}
                    </p>
                    <div className="bg-indigo-500/10 rounded-sm p-2 border border-indigo-500/10">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">Action Plan:</span>
                      <p className="text-[11px] text-indigo-800 dark:text-indigo-200 font-medium">{gap.action}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Loader2, 
  Play, 
  CheckCircle2, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

export function AiInsightsView() {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);

  // Steps to display in the stepper loader
  const steps = [
    { label: 'Compiling core metrics', desc: 'Analyzing employee appraisal ratings and OKR goals progress.' },
    { label: 'Processing 360-degree feedback', desc: 'Correlating feedback reviews to synthesize soft-skills and teamwork stats.' },
    { label: 'Synthesizing recommendations', desc: 'Gemini generating predictive flight risks, high performer lists, and skill gap analyses.' },
  ];

  // Fetch AI Insights Status/Data
  const { data: insightsResponse, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ['performance-ai-insights'],
    queryFn: () => hrPerformanceService.getAIInsights(),
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === 'PENDING' ? 3000 : false;
    },
  });

  // Mutate/Launch Asynchronous Analysis (POST request)
  const triggerMutation = useMutation({
    mutationFn: () => hrPerformanceService.triggerAIInsights(),
    onSuccess: (data) => {
      toast.success('AI Performance Analysis launched successfully in background!');
      queryClient.setQueryData(['performance-ai-insights'], data);
      refetch();
    },
    onError: () => {
      toast.error('Failed to start background AI Analysis.');
    },
  });

  // Increment stepper step while pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (insightsResponse?.status === 'PENDING') {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 4000);
    } else {
      setActiveStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [insightsResponse?.status]);

  if (isQueryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading AI Performance Center...</p>
      </div>
    );
  }

  const status = insightsResponse?.status || 'NOT_STARTED';
  const insightsData = insightsResponse?.insights || {};
  const flightRisks = insightsData.flightRisks || [];
  const topPerformers = insightsData.topPerformers || [];
  const skillGaps = insightsData.skillGaps || [];
  const updatedAt = insightsResponse?.updated_at;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // 1. WELCOME / LAUNCH VIEW (Status NOT_STARTED or FAILED)
  if (status === 'NOT_STARTED' || status === 'FAILED') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Synthesize flight risks, top performers, and skill gaps across your organization.</p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-indigo-100 bg-gradient-to-br from-violet-650 via-indigo-600 to-blue-700 p-8 text-white shadow-xl">
          {/* Subtle background glow bubbles */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                Unlock Startup Performance Insights with Gemini AI
              </h3>
              <p className="text-sm text-indigo-100/90 leading-relaxed font-light">
                Launch an advanced deep analysis of your team's goals, appraisal ratings, and 360-degree feedbacks. 
                Our AI Agent runs as an asynchronous background worker task to predict flight risks, flag core skill gaps, and highlight high performance outliers.
              </p>
            </div>

            {status === 'FAILED' && (
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-md p-3 text-xs text-rose-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
                <span>The previous analysis encountered an error. Please click below to restart a clean background run.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending}
                className="bg-white hover:bg-slate-50 text-indigo-750 font-bold px-6 shadow-md rounded-sm flex items-center justify-center gap-2 h-10 w-full sm:w-auto cursor-pointer"
                data-agent="performance-launch-ai-insights-btn"
              >
                {triggerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-650" /> Initializing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-650" /> Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. BACKGROUND PROCESSING / STEPPER POLLING VIEW (Status PENDING)
  if (status === 'PENDING') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Agent Analysis</h2>
            <p className="text-xs text-indigo-600 font-medium animate-pulse flex items-center gap-1.5 mt-0.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Background analysis is currently active...
            </p>
          </div>
          <Button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-sm h-9 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer"
            data-agent="performance-generate-insights-btn"
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Generate Analysis
              </>
            )}
          </Button>
        </div>

        <Card className="border border-indigo-50 rounded-sm shadow-md overflow-hidden bg-white">
          <div className="p-8 space-y-8 max-w-lg mx-auto">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="h-14 w-14 rounded-full bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-center relative">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 absolute top-0 right-0 animate-bounce" />
              </div>
              <h3 className="font-bold text-base text-foreground">Analyzing Team Performance</h3>
              <p className="text-xs text-muted-foreground">
                Our AI Agent has spawned a background task. Please hold on while Gemini compiles large performance matrices.
              </p>
            </div>

            {/* Step Stepper */}
            <div className="space-y-6 border-l-2 border-slate-100 ml-4 pl-6 relative">
              {steps.map((step, idx) => {
                const isDone = idx < activeStep;
                const isActive = idx === activeStep;

                return (
                  <div key={idx} className="relative">
                    {/* Circle Indicator on the left line */}
                    <div className={`absolute -left-[35px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center bg-white ${
                      isDone ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                      isActive ? 'border-indigo-600 bg-indigo-50 text-indigo-600' :
                      'border-slate-200'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />
                      ) : isActive ? (
                        <Loader2 className="h-2 w-2 animate-spin" />
                      ) : (
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${
                        isDone ? 'text-emerald-700' :
                        isActive ? 'text-indigo-900' :
                        'text-muted-foreground'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center border-t border-slate-50">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500">
                <Clock className="h-3 w-3 text-slate-400" /> Polling celery worker status
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 3. ANALYSIS SUCCESS RESULTS VIEW (Status SUCCESS)
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent Analysis</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Active Analysis Loaded
            </span>
            {formattedDate && (
              <span className="text-[10px] text-muted-foreground font-semibold">
                Updated: {formattedDate}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-sm h-9 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer"
          data-agent="performance-generate-insights-btn"
        >
          {triggerMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" /> Generate Analysis
            </>
          )}
        </Button>
      </div>

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
              <Card key={`risk-${i}`} data-agent={`performance-flight-risk-${i}`} className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    {risk.employeeName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    {risk.reason}
                  </p>
                  <div className="bg-amber-500/10 rounded-sm p-2 border border-amber-500/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">Recommended Action:</span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-250 font-semibold">{risk.actionPlan}</p>
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
              <Card key={`perf-${i}`} data-agent={`performance-high-performer-${i}`} className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {perf.teamName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    {perf.description}
                  </p>
                  <div className="bg-emerald-500/10 rounded-sm p-2 border border-emerald-500/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">Recognition Step:</span>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-250 font-semibold">{perf.action}</p>
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
              <Card key={`gap-${i}`} data-agent={`performance-skill-gap-${i}`} className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-indigo-500/20 rounded-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
                    {gap.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    {gap.description}
                  </p>
                  <div className="bg-indigo-500/10 rounded-sm p-2 border border-indigo-500/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">Action Plan:</span>
                    <p className="text-[11px] text-indigo-800 dark:text-indigo-250 font-semibold">{gap.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

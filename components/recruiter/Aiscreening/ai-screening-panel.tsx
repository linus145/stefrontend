'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import {
  X, Sparkles, ChevronDown, ChevronUp, ChevronRight,
  Bot, FileText, Target, MessageSquare, Send,
  Search, BrainCircuit, History, AlertCircle, Zap, CheckCircle2, Trash2, Lock, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentTaskModal } from '../aiagents/AgentTaskModal';
import { toast } from 'sonner';
import { AgentUIController } from '@/agent/ui/AgentUIController';
import { useAuth } from '@/hooks/useAuth';

/** Converts any string to Title Case — first letter capital, rest lowercase. */
function toTitleCase(str: string): string {
  if (!str) return str;
  const clean = str.replace(/[_-]/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

interface AIScreeningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  results: any;
  onLoadHistoryReport?: (results: any) => void;
  onViewDetails: (id: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  activeJobId: string | null;
  onStartScreening: (jobId: string, model: string) => void;
}

export function AIScreeningPanel({
  isOpen,
  onClose,
  isLoading,
  results,
  onLoadHistoryReport,
  onViewDetails,
  selectedModel,
  setSelectedModel,
  activeJobId,
  onStartScreening
}: AIScreeningPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  const getModelLabel = (modelVal: string) => {
    switch (modelVal) {
      case 'gemini-3.5-flash':
        return 'Gemini 3.5 Flash';
      case 'gemini-3.5-flash-live':
        return 'Gemini 3.5 Flash Live';
      case 'gemini-3.0-flash-live':
        return 'Gemini 3.0 Flash Live';
      case 'gemini-3.1-pro-preview':
        return 'Gemini 3.1 Pro (Prev)';
      case 'gemini-3.1-flash-lite':
        return 'Gemini 3.1 Flash Lite';
      case 'gemini-3-pro-preview':
        return 'Gemini 3 Pro (Prev)';
      case 'gemini-3-flash-preview':
        return 'Gemini 3 Flash (Prev)';
      case 'gemini-2.5-flash':
        return 'Gemini 2.5 Flash';
      case 'gemini-2.5-flash-lite':
        return 'Gemini 2.5 Flash Lite';
      case 'gemini-2.5-pro':
        return 'Gemini 2.5 Pro';
      case 'gemini-2.0-flash':
        return 'Gemini 2.0 Flash';
      case 'gemini-2.0-flash-thinking-exp':
        return 'Gemini 2.0 Thinking';
      case 'gemini-2.0-pro-exp':
        return 'Gemini 2.0 Pro (Exp)';
      case 'text-multilingual-embedding-002':
        return 'Gemini Multilingual Embedding 2';
      default:
        return modelVal;
    }
  };
  const [selectedCandidateName, setSelectedCandidateName] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const queryClient = useQueryClient();

  // Subscription-based tiered feature locks
  const { userSubscription } = useAuth();
  const planPrice = (userSubscription?.status === 'active' && userSubscription?.plan_details)
    ? Number(userSubscription.plan_details.price) : 0;

  // Metrics (strengths, concerns, trust score, ATS score) unlock only at Enterprise (18000)
  const isMetricsLocked = planPrice < 18000;
  // Deploy Agent unlocks only at Enterprise (18000)
  const isAgentDeployLocked = planPrice < 18000;

  // Resizing state
  const [panelWidth, setPanelWidth] = useState<number>(480);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Load custom width from localStorage on mount and set CSS property
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_screening_panel_width');
      const width = saved ? parseInt(saved, 10) : 480;
      if (!isNaN(width) && width >= 360 && width <= 1000) {
        setPanelWidth(width);
        document.documentElement.style.setProperty('--ai-panel-width', `${width}px`);
      }
    }
  }, []);

  const startResize = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    window.dispatchEvent(new CustomEvent('ai-panel-resize-start'));
  };

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      const minWidth = 360;
      const maxWidth = Math.min(1200, window.innerWidth * 0.85);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
        localStorage.setItem('ai_screening_panel_width', newWidth.toString());
        document.documentElement.style.setProperty('--ai-panel-width', `${newWidth}px`);
      }
    }
  }, [isResizing]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    window.dispatchEvent(new CustomEvent('ai-panel-resize-stop'));
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  // Sync visibility with AgentUIController
  useEffect(() => {
    AgentUIController.getInstance().setExternalPanelOpen(isOpen);
    return () => {
      if (isOpen) {
        AgentUIController.getInstance().setExternalPanelOpen(false);
      }
    };
  }, [isOpen]);

  // Check if selected model is locked under current plan price, auto-fallback to default 2.x model
  useEffect(() => {
    if (selectedModel.startsWith('gemini-3') && planPrice < 18000) {
      setSelectedModel('gemini-2.5-flash-lite');
    }
  }, [selectedModel, planPrice, setSelectedModel]);

  // Timer to track how long we've been processing
  useEffect(() => {
    let interval: any;
    if (results?.status === 'processing') {
      interval = setInterval(() => setProcessingTime(prev => prev + 1), 1000);
    } else {
      setProcessingTime(0);
    }
    return () => clearInterval(interval);
  }, [results?.status]);

  const onRestartAnalysis = () => {
    const targetJobId = results?.job_id || activeJobId;
    if (targetJobId) {
      onStartScreening(targetJobId, selectedModel);
    } else {
      toast.error("No job selected to run screening.");
    }
  };

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory, isError: historyError } = useQuery({
    queryKey: ['screening-history'],
    queryFn: () => aiService.getScreeningHistory(),
    enabled: isOpen,
    retry: 3,
    refetchInterval: (query) => {
      const isProcessing = results?.status === 'processing';
      if (query.state.error) return false;
      return isProcessing ? 5000 : false;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => aiService.deleteScreeningReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening-history'] });
      toast.success('Report deleted');
    },
    onError: () => {
      toast.error('Failed to delete report');
    }
  });

  // Listen for agent-screening-complete events to auto-load results after backend agent finishes
  useEffect(() => {
    const handleAgentComplete = (e: any) => {
      const jobId = e.detail?.jobId;
      console.log('[AIScreeningPanel] Agent screening complete event received for job:', jobId);

      // Refetch history to pick up the newly created report
      refetchHistory().then((result) => {
        if (result.data?.data && onLoadHistoryReport) {
          const latestReport = result.data.data.find((r: any) =>
            r.results?.job_id === jobId && r.results?.status === 'completed'
          );
          if (latestReport) {
            console.log('[AIScreeningPanel] Found completed report, loading results...');
            onLoadHistoryReport(latestReport.results);
            toast.success('AI Screening results loaded from agent.');
          }
        }
      });
    };
    window.addEventListener('agent-screening-complete', handleAgentComplete);
    return () => window.removeEventListener('agent-screening-complete', handleAgentComplete);
  }, [refetchHistory, onLoadHistoryReport]);

  // Effect to handle automatic loading of finished reports
  useEffect(() => {
    if (results?.status === 'processing' && historyData?.data) {
      // Find the specific report we are waiting for, or the latest completed one for this job
      const currentReportId = results.report_id;
      const targetReport = historyData.data.find((r: any) =>
        (currentReportId && r.id === currentReportId) ||
        (!currentReportId && r.job_id === results.job_id && r.results.status === 'completed')
      );

      if (targetReport?.results.status === 'completed' && onLoadHistoryReport) {
        onLoadHistoryReport(targetReport.results);
        setIsAutoRefreshing(false);
      }
    }
  }, [historyData, results, onLoadHistoryReport]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const isProcessing = results?.status === 'processing' || isLoading;

  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 right-0 bg-background/95 backdrop-blur-xl z-30 flex flex-col font-sans border-l border-border shadow-2xl overflow-hidden max-w-full",
        !isResizing && "transition-all duration-300 ease-in-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none"
      )}
      style={{
        width: isOpen ? `${panelWidth}px` : '0px',
      }}
    >
      {/* Resize Drag Handle */}
      {isOpen && (
        <div
          onMouseDown={startResize}
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-purple-500/20 active:bg-purple-500/40 z-50 transition-colors",
            isResizing && "bg-purple-500/30 w-1.5"
          )}
        />
      )}

      {/* Inner wrapper with fixed width to prevent content squishing during resizing */}
      <div
        className="h-full flex flex-col bg-background max-w-full"
        style={{
          width: isOpen ? `${panelWidth}px` : '480px',
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              <h2 className="text-[14px] font-bold text-foreground tracking-tight">
                AI Screening
              </h2>
            </div>
            <p className="text-[10px] text-foreground/70 mt-0.5 font-semibold">
              {activeTab === 'results' ? (
                isProcessing ? (
                  "Analyzing candidates..."
                ) : results ? (
                  `Analysis ready${results.model_used ? ` • ${getModelLabel(results.model_used)}` : ''}`
                ) : (
                  "Analysis ready"
                )
              ) : (
                "Screening history"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Results Tab Button */}
            <button
              onClick={() => setActiveTab('results')}
              className={cn(
                "p-1 hover:bg-muted rounded-[3px] transition-colors shrink-0 border border-border shadow-sm flex items-center justify-center relative",
                activeTab === 'results' ? "bg-purple-600/10 text-purple-600 border-purple-600/20" : "text-foreground/50 hover:text-foreground"
              )}
              title="Results"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* History Tab Button */}
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "p-1 hover:bg-muted rounded-[3px] transition-colors shrink-0 border border-border shadow-sm flex items-center justify-center relative",
                activeTab === 'history' ? "bg-purple-600/10 text-purple-600 border-purple-600/20" : "text-foreground/50 hover:text-foreground"
              )}
              title="History"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Close Panel Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-[3px] transition-colors text-foreground hover:text-purple-500 border border-border shadow-sm shrink-0"
              title="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-background scrollbar-thin scrollbar-thumb-border">
          {activeTab === 'results' ? (
            isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6 px-12 text-center">
                {historyError ? (
                  <>
                    <div className="w-12 h-12 bg-rose-500/10 rounded-sm flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Connection interrupted</p>
                      <p className="text-xs text-slate-500 font-medium">The server is unreachable. Please check your connection.</p>
                      <button
                        onClick={() => refetchHistory()}
                        className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-sm text-[10px] font-black tracking-widest hover:bg-slate-200 transition-colors"
                      >
                        Retry connection
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-sm animate-spin" />
                      <Bot className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Ai engine processing</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        We are analyzing the resumes using <strong className="text-purple-600 dark:text-purple-400 font-extrabold">{getModelLabel(selectedModel)}</strong> in the background.
                        This usually takes 15-30 seconds per resume.
                      </p>
                      <div className="pt-4 space-y-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black tracking-widest rounded-sm">
                          <span className="w-1.5 h-1.5 rounded-sm bg-indigo-500 animate-ping" />
                          Auto-refreshing ({processingTime}s)
                        </span>

                        {processingTime > 30 && (
                          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <button
                              onClick={onRestartAnalysis}
                              className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black tracking-widest rounded-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95"
                            >
                              Restart ai engine
                            </button>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 italic">Taking longer than usual? Click to force a refresh.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : results ? (
              <div className="space-y-6 pb-24">
                {results.top_candidates.map((cand: any, idx: number) => {
                  const isExpanded = expandedId === cand.id;
                  const ai = cand.analysis?.recruiter_view;

                  return (
                    <div
                      key={cand.id || idx}
                      className="animate-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* AI Intelligence Card */}
                      <div
                        className={cn(
                          "bg-white dark:bg-[#111827] rounded-sm p-5 transition-all cursor-pointer border shadow-sm relative overflow-hidden group",
                          isExpanded ? "border-[#7C3AED] ring-1 ring-[#7C3AED]/10" : "border-slate-200 dark:border-slate-800 hover:border-[#7C3AED]/40"
                        )}
                        onClick={() => toggleExpand(cand.id)}
                      >
                        {/* Background Gradient for Top Match */}
                        {idx === 0 && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{cand.name}</h3>
                              {idx === 0 && (
                                <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                                  Top match
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={cn("flex items-center gap-1 text-[11px] font-bold text-indigo-500 relative", isMetricsLocked && "select-none")}>
                                <Target className="w-3 h-3" />
                                {isMetricsLocked ? (
                                  <span className="relative">
                                    <span className="blur-[5px] pointer-events-none">{cand.score}% match</span>
                                    <Lock className="w-3 h-3 text-amber-500 absolute -right-4 top-0" />
                                  </span>
                                ) : (
                                  <>{cand.score}% match</>
                                )}
                              </div>
                              {(cand.skills_match_pct !== undefined && cand.skills_match_pct > 0) && (
                                <div className={cn("flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 relative", isMetricsLocked && "select-none")}>
                                  <span>•</span>
                                  {isMetricsLocked ? (
                                    <span className="blur-[5px] pointer-events-none">{cand.skills_match_pct}% skills match</span>
                                  ) : (
                                    <span>{cand.skills_match_pct}% skills match</span>
                                  )}
                                </div>
                              )}
                              {ai?.startup_fit && (
                                <div className={cn(
                                  "flex items-center gap-1 text-[11px] font-bold",
                                  ai.startup_fit === 'High' ? "text-emerald-500" : "text-amber-500"
                                )}>
                                  <Sparkles className="w-3 h-3" />
                                  {toTitleCase(ai.startup_fit)} fit
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 relative">
                            {isMetricsLocked ? (
                              <>
                                <div className="text-[20px] font-black text-slate-900 dark:text-white leading-none blur-[5px] select-none pointer-events-none">
                                  {cand.score}<span className="text-[12px] opacity-30">%</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-sm px-1.5 py-0.5">
                                    <Lock className="w-2.5 h-2.5 text-indigo-500" />
                                    <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 tracking-wide">Growth Plan</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-[20px] font-black text-slate-900 dark:text-white leading-none">
                                  {cand.score}<span className="text-[12px] opacity-30">%</span>
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 tracking-tighter mt-1">
                                  Fit score
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Summary / Explanation */}
                        <p className={cn(
                          "text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4",
                          !isExpanded && "line-clamp-2"
                        )}>
                          {ai?.explanation || cand.summary}
                        </p>

                        {/* Expanded Structured Insights */}
                        {isExpanded && ai && (
                          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">

                            {/* Knockout Warning Banner */}
                            {cand.knockout_applied && (
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-rose-500 tracking-wider uppercase">
                                    AI Knockout Rule Triggered
                                  </p>
                                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
                                    This candidate's fit score was capped at <span className="font-extrabold">{cand.score}%</span> due to: <span className="italic font-bold">"{cand.knockout_reason || ai.knockout_reason || 'Knockout criteria met'}"</span>.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Skills Alignment */}
                            {cand.analysis?.intelligence?.skills_assessment && (
                              <div className="relative">
                                <div className={cn("space-y-2 border border-slate-100 dark:border-slate-800 rounded-sm p-3.5 bg-slate-50/50 dark:bg-slate-900/30", isMetricsLocked && "blur-[6px] select-none pointer-events-none")}>
                                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase flex items-center gap-1.5 mb-2">
                                    <Target className="w-3.5 h-3.5 text-[#7C3AED]" /> Skills Alignment
                                  </p>

                                  {/* Matched Required Skills */}
                                  {cand.analysis.intelligence.skills_assessment.matched_required?.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                                        Matched Skills ({cand.analysis.intelligence.skills_assessment.matched_required.length})
                                      </p>
                                      <div className="flex flex-col gap-1">
                                        {cand.analysis.intelligence.skills_assessment.matched_required.map((m: any, i: number) => (
                                          <div key={i} className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <div>
                                              <span className="font-semibold text-slate-800 dark:text-slate-200">{m.skill}</span>
                                              {m.evidence && (
                                                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-normal italic ml-1">
                                                  ({m.evidence})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No matched skills identified.</p>
                                  )}

                                  {/* Divider if both exist */}
                                  {cand.analysis.intelligence.skills_assessment.matched_required?.length > 0 &&
                                    cand.analysis.intelligence.skills_assessment.missing_required?.length > 0 && (
                                      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2.5" />
                                    )}

                                  {/* Missing Required Skills */}
                                  {cand.analysis.intelligence.skills_assessment.missing_required?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-wide">
                                        Missing Required Skills ({cand.analysis.intelligence.skills_assessment.missing_required.length})
                                      </p>
                                      <div className="flex flex-col gap-1">
                                        {cand.analysis.intelligence.skills_assessment.missing_required.map((m: any, i: number) => (
                                          <div key={i} className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <span className="font-semibold text-slate-800 dark:text-slate-200">{m.skill}</span>
                                              {m.impact && (
                                                <span className={cn(
                                                  "text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wide",
                                                  m.impact.toLowerCase() === 'critical' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                                                    m.impact.toLowerCase() === 'moderate' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                      "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                                                )}>
                                                  {m.impact}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Strengths & Concerns */}
                            <div className="relative">
                              <div className={cn("grid grid-cols-1 gap-4", isMetricsLocked && "blur-[6px] select-none pointer-events-none")}>
                                {ai.strengths?.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-emerald-500 tracking-widest flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3 h-3" /> Key strengths
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {ai.strengths.map((s: string, i: number) => (
                                        <span key={i} className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-1 rounded-sm border border-emerald-500/10">
                                          {toTitleCase(s)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {ai.concerns?.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-rose-500 tracking-widest flex items-center gap-1.5">
                                      <AlertCircle className="w-3 h-3" /> Potential concerns
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {ai.concerns.map((c: string, i: number) => (
                                        <span key={i} className="bg-rose-500/5 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-2 py-1 rounded-sm border border-rose-500/10">
                                          {toTitleCase(c)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Premium overlay for Free/Basic users */}
                              {isMetricsLocked && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 rounded-sm px-4 py-3 flex flex-col items-center gap-2 shadow-lg">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                      <Lock className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest">GROWTH PLAN</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed max-w-[200px]">
                                      Candidate insights unlock with the Growth Plan.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Red Flags */}
                            {ai.red_flags?.length > 0 && (
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-sm p-3">
                                <p className="text-[10px] font-black text-rose-500 tracking-widest flex items-center gap-1.5 mb-2">
                                  <AlertCircle className="w-3 h-3" /> Ai red flags
                                </p>
                                <ul className="space-y-1">
                                  {ai.red_flags.map((rf: string, i: number) => (
                                    <li key={i} className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                      <span className="mt-1 w-1 h-1 rounded-sm bg-rose-500 shrink-0" />
                                      {toTitleCase(rf)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Interview Questions */}
                            {(ai.tailored_interview_questions?.length > 0 || ai.interview_questions?.length > 0) && (
                              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-sm p-3">
                                <p className="text-[10px] font-black text-indigo-500 tracking-widest flex items-center gap-1.5 mb-2">
                                  <MessageSquare className="w-3 h-3" /> Suggested interview questions
                                </p>
                                <div className="space-y-3">
                                  {(ai.tailored_interview_questions || ai.interview_questions).map((q: any, i: number) => {
                                    const questionText = typeof q === 'string' ? q : q?.question || '';
                                    return (
                                      <div key={i} className="flex gap-3">
                                        <div className="w-5 h-5 rounded-sm bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500 shrink-0">
                                          {i + 1}
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 italic">"{questionText}"</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800 relative">
                                <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1">Trust score</p>
                                {isMetricsLocked ? (
                                  <>
                                    <div className="flex items-center justify-between blur-[5px] select-none pointer-events-none">
                                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">{ai.trust_score}%</span>
                                      <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${ai.trust_score}%` }} />
                                      </div>
                                    </div>
                                    <div className="absolute bottom-1.5 right-2 flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-sm px-1 py-0.5">
                                      <Lock className="w-2 h-2 text-indigo-500" />
                                      <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">Growth</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{ai.trust_score}%</span>
                                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden">
                                      <div className="h-full bg-indigo-500" style={{ width: `${ai.trust_score}%` }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1">Recommended</p>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                  {toTitleCase(ai.recommended_action || ai.pipeline_disposition || "Yes")}
                                </p>
                              </div>
                            </div>

                            {/* Pipeline Disposition & Hiring Confidence (new fields) */}
                            {(ai.pipeline_disposition || ai.hiring_confidence) && (
                              <div className="grid grid-cols-2 gap-3">
                                {ai.pipeline_disposition && (
                                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1">Disposition</p>
                                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400 truncate">
                                      {toTitleCase(ai.pipeline_disposition)}
                                    </p>
                                  </div>
                                )}
                                {ai.hiring_confidence && (
                                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1">Hiring confidence</p>
                                    <p className={cn(
                                      "text-xs font-bold truncate",
                                      ai.hiring_confidence === 'HIGH' ? "text-emerald-600 dark:text-emerald-400" :
                                        ai.hiring_confidence === 'MEDIUM' ? "text-amber-600 dark:text-amber-400" :
                                          "text-rose-600 dark:text-rose-400"
                                    )}>
                                      {toTitleCase(ai.hiring_confidence)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Recruiter Action Memo (new field) */}
                            {ai.recruiter_action_memo && (
                              <div className="bg-violet-500/5 border border-violet-500/10 rounded-sm p-3">
                                <p className="text-[10px] font-black text-violet-500 tracking-widest mb-1">Recruiter memo</p>
                                <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                  {ai.recruiter_action_memo}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex justify-center opacity-20 group-hover:opacity-100 transition-opacity">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(cand.id);
                            }}
                            className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Full profile
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAgentDeployLocked) {
                                toast.error('Deploy Agent is available on the Enterprise AI OS plan.', {
                                  description: 'Upgrade to Enterprise to unlock autonomous agentic AI execution.'
                                });
                                return;
                              }
                              setAgentModalOpen(true);
                              setSelectedCandidateName(cand.name);
                            }}
                            className={cn(
                              "flex items-center justify-center gap-2 p-2.5 rounded-sm text-[11px] font-bold transition-all",
                              isAgentDeployLocked
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                            )}
                          >
                            {isAgentDeployLocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                Deploy agent
                                <span className="text-[7px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1 py-0.5 rounded-sm border border-violet-500/20 ml-1">Enterprise</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                Deploy agent
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30 text-foreground">
                <BrainCircuit className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold tracking-tight">Ready to assist your hiring process</p>
              </div>
            )
          ) : (
            /* History Tab */
            historyLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-60">
                <div className="w-8 h-8 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-sm animate-spin" />
                <p className="text-xs font-bold text-muted-foreground tracking-widest">Loading history...</p>
              </div>
            ) : historyData?.data && historyData.data.length > 0 ? (
              <div className="space-y-2 pb-20">
                {historyData.data.map((report: any, idx: number) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 p-3 rounded-sm border border-border/50 hover:border-[#7C3AED]/30 hover:bg-muted/5 transition-all cursor-pointer group"
                    onClick={() => {
                      if (onLoadHistoryReport) {
                        onLoadHistoryReport(report.results);
                        setActiveTab('results');
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-sm bg-muted/10 flex items-center justify-center shrink-0 border border-[#7C3AED]/20 group-hover:scale-105 transition-transform">
                      <BrainCircuit className="w-5 h-5 text-[#7C3AED]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-foreground truncate">{report.job_title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-muted-foreground truncate font-medium">
                          {report.results.total_applicants} candidates • Top {report.results.top_candidates[0]?.score || 0}%
                          {report.results.model_used && ` • ${getModelLabel(report.results.model_used)}`}
                        </p>
                        <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap ml-auto">
                          {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(report.id);
                      }}
                      className="p-1.5 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-sm transition-all shrink-0 opacity-0 group-hover:opacity-100"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30 text-foreground">
                <History className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold tracking-tight">No screening history yet</p>
              </div>
            )
          )}
        </div>

        {/* Footer Action Bar: Model Selector and Trigger Button */}
        <div className="p-3 border-t border-border bg-white dark:bg-[#0B0F19] shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Left Side: Model Selector Dropdown */}
            <div className="flex items-center gap-2 relative">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase shrink-0">
                Model
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/85 dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 border border-border rounded-[3px] text-[10px] font-bold text-black dark:text-white transition-all shadow-sm disabled:opacity-50"
                >
                  <span>{getModelLabel(selectedModel)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={cn("transition-transform duration-200", isModelMenuOpen ? "rotate-180" : "")}><polyline points="18 15 12 9 6 15" /></svg>
                </button>

                {/* Model Choice Menu Popover */}
                {isModelMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsModelMenuOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-1.5 w-48 bg-popover border border-border rounded-[4px] shadow-xl p-1 z-50 flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-200">
                      {[
                        { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
                        { value: 'gemini-3.5-flash-live', label: 'Gemini 3.5 Flash Live' },
                        { value: 'gemini-3.0-flash-live', label: 'Gemini 3.0 Flash Live' },
                        { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (Preview)' },
                        { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
                        { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)' },
                        { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
                        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                        { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
                        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
                        { value: 'gemini-2.0-flash-thinking-exp', label: 'Gemini 2.0 Thinking' },
                        { value: 'gemini-2.0-pro-exp', label: 'Gemini 2.0 Pro (Exp)' },
                        { value: 'text-multilingual-embedding-002', label: 'Gemini Multilingual Embedding 2' }
                      ].map((m) => {
                        const isModelLocked = m.value.startsWith('gemini-3') && planPrice < 18000;
                        return (
                          <button
                            key={m.value}
                            onClick={() => {
                              if (isModelLocked) {
                                toast.error('Gemini 3.x models are locked', {
                                  description: 'These models are only available on the Enterprise AI OS plan. Please upgrade your subscription to unlock.'
                                });
                                return;
                              }
                              setSelectedModel(m.value);
                              setIsModelMenuOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-[3px] text-[10px] font-bold flex items-center justify-between gap-1.5 transition-colors text-black dark:text-white",
                              selectedModel === m.value ? "bg-purple-600/10 text-purple-600 hover:text-purple-600" : "hover:bg-muted",
                              isModelLocked && "opacity-50 hover:bg-transparent"
                            )}
                          >
                            <span>{m.label}</span>
                            {isModelLocked && <Lock className="w-3 h-3 text-amber-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side: Run/Restart Button */}
            <button
              onClick={onRestartAnalysis}
              disabled={isProcessing || (!results?.job_id && !activeJobId)}
              className={cn(
                "px-3 py-1.5 bg-foreground text-background hover:bg-purple-600 hover:text-white border border-border rounded-[3px] text-[10px] font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-1.5 shadow-sm shrink-0",
                isProcessing && "bg-muted text-muted-foreground"
              )}
              title={results ? "Re-run AI Screening" : "Run AI Screening"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Running...</span>
                </>
              ) : results ? (
                <>
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>Re-run</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AgentTaskModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        candidateName={selectedCandidateName}
      />
    </div>
  );
}

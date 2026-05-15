'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import {
  X, Sparkles, ChevronDown, ChevronUp, ChevronRight,
  Bot, FileText, Target, MessageSquare, Send,
  Search, BrainCircuit, History, AlertCircle, Zap, CheckCircle2, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentTaskModal } from '../aiagents/AgentTaskModal';
import { toast } from 'sonner';
import { AgentUIController } from '@/agent/ui/AgentUIController';


interface AIScreeningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  results: any;
  onLoadHistoryReport?: (results: any) => void;
  onViewDetails: (id: string) => void;
}

export function AIScreeningPanel({ isOpen, onClose, isLoading, results, onLoadHistoryReport, onViewDetails }: AIScreeningPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [selectedCandidateName, setSelectedCandidateName] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const queryClient = useQueryClient();

  // Sync visibility with AgentUIController
  useEffect(() => {
    AgentUIController.getInstance().setExternalPanelOpen(isOpen);
    return () => {
      if (isOpen) {
        AgentUIController.getInstance().setExternalPanelOpen(false);
      }
    };
  }, [isOpen]);

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
    if (results?.job_id && onLoadHistoryReport) {
      aiService.analyzeResumes(results.job_id).then(res => {
        onLoadHistoryReport(res.data);
        setProcessingTime(0);
      }).catch(() => {
        toast.error("Failed to restart. Please check server.");
      });
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
    <div className={cn(
      "absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-[#0B0F19] border-l border-border shadow-2xl z-30 transform transition-transform duration-500 ease-in-out flex flex-col font-sans",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header - Inspired by Chat Interface */}
      <div className="relative pt-6 pb-4 px-6 flex items-center justify-between bg-white dark:bg-[#0B0F19] border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-muted/10 flex items-center justify-center shadow-sm border border-[#7C3AED]/20">
            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">Recruitment Copilot</h1>
            <p className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">
              {activeTab === 'results' ? (isLoading ? "Analyzing..." : "Analysis Ready") : "History"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'results' ? 'history' : 'results')}
            className={cn(
              "p-2 rounded-lg transition-all",
              activeTab === 'history' ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-[#0B0F19] scrollbar-hide">
        {activeTab === 'results' ? (
          isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 px-12 text-center">
              {historyError ? (
                <>
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Connection Interrupted</p>
                    <p className="text-xs text-slate-500 font-medium">The server is unreachable. Please check your connection.</p>
                    <button
                      onClick={() => refetchHistory()}
                      className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Retry Connection
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                    <Bot className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Engine Processing</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      We are analyzing the resumes in the background.
                      This usually takes 15-30 seconds per resume.
                    </p>
                    <div className="pt-4 space-y-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        Auto-refreshing ({processingTime}s)
                      </span>

                      {processingTime > 30 && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <button
                            onClick={onRestartAnalysis}
                            className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95"
                          >
                            Restart AI Engine
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
                        "bg-white dark:bg-[#111827] rounded-lg p-5 transition-all cursor-pointer border shadow-sm relative overflow-hidden group",
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
                              <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                                Top Match
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500">
                              <Target className="w-3 h-3" />
                              {cand.score}% Match
                            </div>
                            {ai?.startup_fit && (
                              <div className={cn(
                                "flex items-center gap-1 text-[11px] font-bold",
                                ai.startup_fit === 'High' ? "text-emerald-500" : "text-amber-500"
                              )}>
                                <Sparkles className="w-3 h-3" />
                                {ai.startup_fit} Fit
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <div className="text-[20px] font-black text-slate-900 dark:text-white leading-none">
                            {cand.score}<span className="text-[12px] opacity-30">%</span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                            Fit Score
                          </div>
                        </div>
                      </div>

                      {/* Summary / Explanation */}
                      <p className={cn(
                        "text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4",
                        !isExpanded && "line-clamp-2"
                      )}>
                        {ai?.explanation || cand.summary}
                      </p>

                      {/* Structured Insights (Always show a preview if not expanded?) */}
                      {isExpanded && ai && (
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">

                          {/* Strengths & Concerns */}
                          <div className="grid grid-cols-1 gap-4">
                            {ai.strengths?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3" /> Key Strengths
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {ai.strengths.map((s: string, i: number) => (
                                    <span key={i} className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-1 rounded-sm border border-emerald-500/10">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {ai.concerns?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                                  <AlertCircle className="w-3 h-3" /> Potential Concerns
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {ai.concerns.map((c: string, i: number) => (
                                    <span key={i} className="bg-rose-500/5 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-2 py-1 rounded-sm border border-rose-500/10">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Red Flags */}
                          {ai.red_flags?.length > 0 && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-3">
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <AlertCircle className="w-3 h-3" /> AI Red Flags
                              </p>
                              <ul className="space-y-1">
                                {ai.red_flags.map((rf: string, i: number) => (
                                  <li key={i} className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                                    {rf}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Interview Questions */}
                          {ai.interview_questions?.length > 0 && (
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-md p-3">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <MessageSquare className="w-3 h-3" /> Suggested Interview Questions
                              </p>
                              <div className="space-y-3">
                                {ai.interview_questions.map((q: string, i: number) => (
                                  <div key={i} className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500 shrink-0">
                                      {i + 1}
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 italic">"{q}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Stats Row */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-700 dark:text-slate-300">{ai.trust_score}%</span>
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${ai.trust_score}%` }} />
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-sm border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended</p>
                              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{ai.recommended_action || "Yes"}</p>
                            </div>
                          </div>
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
                          className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Full Profile
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgentModalOpen(true);
                            setSelectedCandidateName(cand.name);
                          }}
                          className="flex items-center justify-center gap-2 p-2.5 bg-indigo-600 rounded-md text-[11px] font-bold text-white hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          Deploy Agent
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
              <div className="w-8 h-8 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading History...</p>
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

      {/* Footer Chat Input - Professional Chat Style */}
      <div className="p-4 border-t border-border bg-white dark:bg-[#0B0F19]">
        <div className="relative group">
          <input
            type="text"
            placeholder="Ask anything about the candidates..."
            className="w-full bg-muted/20 border border-border rounded-sm py-3 px-4 pr-12 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-muted-foreground/40 font-medium text-foreground"
            disabled={!results}
          />
          <button
            className="absolute right-2 top-2 p-1.5 bg-[#7C3AED] text-white rounded-sm hover:bg-[#6D28D9] transition-colors disabled:opacity-30 shadow-sm"
            disabled={!results}
          >
            <Send className="w-4 h-4" />
          </button>
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

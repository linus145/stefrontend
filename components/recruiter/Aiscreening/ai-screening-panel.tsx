'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { 
  X, Sparkles, ChevronDown, ChevronUp, ChevronRight,
  Bot, FileText, Target, MessageSquare, Send,
  Search, BrainCircuit, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentTaskModal } from '../aiagents/AgentTaskModal';

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

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['screening-history'],
    queryFn: () => aiService.getScreeningHistory(),
    enabled: isOpen && activeTab === 'history',
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-60">
              <div className="w-10 h-10 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground tracking-wide">Processing Resumes...</p>
            </div>
          ) : results ? (
            <div className="space-y-6 pb-24">
              {results.top_candidates.map((cand: any, idx: number) => {
                const isExpanded = expandedId === cand.id;
                
                return (
                  <div 
                    key={cand.id || idx}
                    className="animate-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* AI Bubble Style - Professional Chat Style */}
                    <div 
                      className={cn(
                        "bg-muted/5 rounded-sm p-4 transition-all cursor-pointer border border-border shadow-sm",
                        isExpanded ? "border-[#7C3AED]/30 ring-1 ring-[#7C3AED]/10" : "hover:border-border/80"
                      )}
                      onClick={() => toggleExpand(cand.id)}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-bold text-foreground truncate">{cand.name}</h3>
                          <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">{cand.reason}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            idx === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                          )}>
                            <Target className="w-3 h-3" />
                            Match {cand.score}%
                          </div>
                        </div>
                      </div>

                      <p className={cn(
                        "text-[13px] text-foreground/80 leading-relaxed font-medium",
                        !isExpanded && "line-clamp-3"
                      )}>
                        {cand.summary || cand.match_analysis}
                      </p>

                      <div className="mt-3 flex justify-center opacity-30">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-foreground" /> : <ChevronDown className="w-4 h-4 text-foreground" />}
                      </div>
                    </div>

                    {/* Action Buttons - Rectangular Style */}
                    {isExpanded && (
                      <div className="mt-2 grid grid-cols-1 gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(cand.id);
                          }}
                          className="flex items-center gap-3 p-2.5 bg-muted/10 border border-border rounded-sm text-[12px] font-semibold text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all shadow-sm group"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#7C3AED] transition-colors" />
                          View Detailed Analysis
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgentModalOpen(true);
                            setSelectedCandidateName(cand.name);
                          }}
                          className="flex items-center gap-3 p-2.5 bg-[#7C3AED] rounded-sm text-[12px] font-bold text-white hover:bg-[#6D28D9] transition-all shadow-sm mt-1 group"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                          Run Agentic Task...
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
            <div className="space-y-1 pb-20">
              {historyData.data.map((report: any, idx: number) => (
                <div 
                  key={report.id}
                  className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/10 transition-all cursor-pointer group"
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
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-bold text-foreground truncate">{report.job_title}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-muted-foreground truncate font-medium">
                        {report.results.total_applicants} candidates • Top {report.results.top_candidates[0]?.score || 0}%
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#7C3AED] transition-colors shrink-0" />
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

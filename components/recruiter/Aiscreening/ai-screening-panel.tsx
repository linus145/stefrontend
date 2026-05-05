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
      "absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-500 ease-in-out flex flex-col font-sans",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header - Inspired by Chat Interface */}
      <div className="relative pt-6 pb-4 px-6 flex items-center justify-between bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Recruitment Copilot</h1>
            <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">
              {activeTab === 'results' ? (isLoading ? "Analyzing..." : "Analysis Ready") : "History"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab(activeTab === 'results' ? 'history' : 'results')}
            className={cn(
              "p-2 rounded-lg transition-all",
              activeTab === 'history' ? "bg-[#F5F3FF] text-[#7C3AED]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white scrollbar-hide">
        {activeTab === 'results' ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-60">
              <div className="w-10 h-10 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-400 tracking-wide">Processing Resumes...</p>
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
                    {/* AI Bubble Style - Exactly like Image */}
                    <div 
                      className={cn(
                        "bg-[#F5F3FF] rounded-[24px] p-5 transition-all cursor-pointer border border-transparent",
                        isExpanded ? "ring-2 ring-[#7C3AED]/10 border-[#7C3AED]/10" : "hover:border-[#7C3AED]/10"
                      )}
                      onClick={() => toggleExpand(cand.id)}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider">AI Recruiter</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-900">{cand.name}</h3>
                          <div className="text-[10px] font-black text-[#7C3AED] bg-white px-2 py-0.5 rounded-full border border-[#7C3AED]/10">
                            {cand.score}% MATCH
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-sm text-slate-700 leading-relaxed font-medium",
                          !isExpanded && "line-clamp-3"
                        )}>
                          {cand.summary}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-center opacity-40">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Action Buttons - Exactly like Image */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 px-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(cand.id);
                          }}
                          className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          Summarize Candidate
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                          <Target className="w-4 h-4 text-slate-400" />
                          Check Skill Match
                        </button>
                        
                        <button className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          Generate Interview Questions
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgentModalOpen(true);
                            setSelectedCandidateName(cand.name);
                          }}
                          className="w-full flex items-center gap-3 p-3 bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-xl text-[13px] font-bold text-[#7C3AED] hover:bg-[#EDE9FE] transition-all shadow-sm mt-2 group"
                        >
                          <Sparkles className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                          Run Agentic Task...
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30">
              <BrainCircuit className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold text-slate-900 tracking-tight">Ready to assist your hiring process</p>
            </div>
          )
        ) : (
          /* History Tab */
          historyLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-60">
              <div className="w-8 h-8 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading History...</p>
            </div>
          ) : historyData?.data && historyData.data.length > 0 ? (
            <div className="space-y-1 pb-20">
              {historyData.data.map((report: any, idx: number) => (
                <div 
                  key={report.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
                  onClick={() => {
                    if (onLoadHistoryReport) {
                      onLoadHistoryReport(report.results);
                      setActiveTab('results');
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0 border border-[#7C3AED]/10 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13px] font-bold text-slate-800 truncate">{report.job_title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate font-medium">
                        {report.results.total_applicants} candidates • Top {report.results.top_candidates[0]?.score || 0}%
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7C3AED] transition-colors shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30">
              <History className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold text-slate-900 tracking-tight">No screening history yet</p>
            </div>
          )
        )}
      </div>

      {/* Footer Chat Input - Exactly like Image */}
      <div className="p-4 border-t border-slate-50 bg-white">
        <div className="relative">
          <input 
            type="text"
            placeholder="Ask AI anything about this candidate..."
            className="w-full bg-[#F9FAFB] border border-slate-200 rounded-xl py-3.5 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-slate-400 font-medium"
            disabled={!results}
          />
          <button 
            className="absolute right-2 top-2 p-1.5 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors disabled:opacity-30"
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

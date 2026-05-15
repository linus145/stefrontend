'use client';

import { useState, useEffect } from 'react';
import {
  X, Sparkles, Send, BrainCircuit, History, Bot, Loader2,
  Search, Users, Star, Target, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiAgentService } from '@/services/ai-agents.service';
import { AgentUIController } from '@/agent/ui/AgentUIController';

interface TalentAISearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResults?: (candidateIds: string[] | null) => void;
}

export function TalentAISearchPanel({ isOpen, onClose, onSearchResults }: TalentAISearchPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sync visibility with AgentUIController
  useEffect(() => {
    AgentUIController.getInstance().setExternalPanelOpen(isOpen);
    // Cleanup when component unmounts if it was open
    return () => {
      if (isOpen) {
        AgentUIController.getInstance().setExternalPanelOpen(false);
      }
    };
  }, [isOpen]);
  
  type ChatMessage = {
    id: string;
    role: 'user' | 'agent';
    content: string;
    candidates?: any[];
    count?: number;
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch history when tab changes
  
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await aiAgentService.executeTask({ 
        task_type: 'get_search_history',
        payload: {} 
      });
      setHistory(Array.isArray(response.details) ? response.details : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: searchQuery };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    
    setIsSearching(true);
    try {
      const response = await aiAgentService.executeTask({
        task_type: 'talent_search',
        payload: { query: searchQuery }
      });
      
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.details?.query_analysis?.reasoning || 'No reasoning provided.',
        candidates: response.details?.candidates || [],
        count: response.details?.count || 0
      };
      
      setMessages(prev => [...prev, agentMsg]);
      
      if (onSearchResults && response.details?.candidates) {
        onSearchResults(response.details.candidates.map((c: any) => c.id));
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'I encountered an error while trying to process your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => executeSearch(query);

  return (
    <div className={cn(
      "sticky top-16 h-[calc(100vh-4rem)] border-l border-border bg-background shadow-xl z-30 transition-all duration-500 ease-in-out flex flex-col font-sans overflow-hidden shrink-0",
      isOpen ? "w-full sm:w-[400px] opacity-100" : "w-0 opacity-0 pointer-events-none border-none"
    )}>
      {/* Header */}
      <div className="relative pt-6 pb-4 px-6 flex items-center justify-between bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-muted/20 flex items-center justify-center shadow-sm border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">Talent Copilot</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              {activeTab === 'chat' ? (isSearching ? "Thinking..." : "AI Intelligence Ready") : "Search History"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? 'history' : 'chat')}
            className={cn(
              "p-2 rounded-lg transition-all",
              activeTab === 'history' ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setQuery('');
              setMessages([]);
              if (onSearchResults) onSearchResults(null);
              onClose();
            }}
            className="p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background scrollbar-hide">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-full">
            {/* AI Welcome Message & Empty State Placeholder */}
            {messages.length === 0 && !isSearching && (
              <>
                <div className="bg-muted/10 border border-border rounded-sm p-5 mb-6 animate-in fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-sm bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Talent Scout</span>
                  </div>
                  <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
                    I can help you find the perfect talent from your pool. Describe who you're looking for, or try one of these:
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {[
                      "Find senior developers with React and Node.js experience",
                      "Suggest candidates for a Marketing Lead role in London",
                      "Identify high-potential interns for the engineering team"
                    ].map((hint, i) => (
                      <button
                        key={i}
                        onClick={() => executeSearch(hint)}
                        className="text-left p-3 rounded-sm bg-background border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-blue-500/30 transition-all font-medium"
                      >
                        "{hint}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-12 opacity-30 text-foreground mt-8">
                  <BrainCircuit className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold tracking-tight">Intelligence-driven talent discovery</p>
                </div>
              </>
            )}
            
            <div className="flex-1 space-y-6">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  {msg.role === 'user' ? (
                    <div className="bg-blue-500 text-white p-3 rounded-xl rounded-tr-sm max-w-[85%] text-[13px] shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full space-y-4 animate-in fade-in">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-sm p-4">
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Agent Reasoning</p>
                         <p className="text-[13px] font-medium text-foreground/80 leading-relaxed tracking-tight italic">
                           "{msg.content}"
                         </p>
                      </div>
                      
                      {msg.candidates !== undefined && (
                        <>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-2">
                            Top Matches ({msg.count})
                          </p>
                          
                          <div className="space-y-2 pb-2">
                             {msg.candidates.map((candidate: any) => (
                               <div key={candidate.id} className="p-3.5 bg-muted/20 border border-border rounded-sm hover:border-blue-500/30 transition-all cursor-pointer shadow-sm group/cand">
                                 <div className="flex justify-between items-start mb-1">
                                   <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight group-hover/cand:text-blue-500 transition-colors">{candidate.name}</h4>
                                   <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-sm uppercase tracking-widest">{candidate.role}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{candidate.email}</p>
                               </div>
                             ))}
                            {msg.candidates.length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-4">No matching candidates found.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isSearching && (
                <div className="flex flex-col items-center justify-center py-12 opacity-70">
                   <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                   <p className="text-sm font-bold text-foreground">Agent is sourcing talent...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History Tab */
          <div className="flex-1 flex flex-col p-4 pr-2 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-70 mt-8">
                 <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                 <p className="text-sm font-bold text-foreground">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="p-4 bg-muted/10 border border-border rounded-sm hover:border-blue-500/30 transition-all cursor-pointer group" onClick={() => {
                      setQuery('');
                      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: h.query };
                      const agentMsg: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'agent',
                        content: h.reasoning || 'No reasoning provided.',
                        candidates: h.candidates_data || [],
                        count: h.count
                      };
                      setMessages([userMsg, agentMsg]);
                      setActiveTab('chat');
                  }}>
                    <div className="flex items-start gap-3 mb-2">
                      <History className="w-4 h-4 text-muted-foreground mt-0.5 group-hover:text-blue-500 transition-colors" />
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{h.query}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{new Date(h.created_at).toLocaleDateString()} • {h.count} matches</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30 text-foreground mt-8">
                <History className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold tracking-tight">No search history yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Chat Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search talent with natural language..."
            className="w-full bg-muted/20 border border-border rounded-sm py-3.5 px-4 pr-12 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/50 font-medium text-foreground shadow-inner"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-2 p-1.5 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors disabled:opacity-30 shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

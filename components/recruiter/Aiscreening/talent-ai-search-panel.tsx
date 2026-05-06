'use client';

import { useState } from 'react';
import {
  X, Sparkles, Send, BrainCircuit, History, Bot,
  Search, Users, Star, Target, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TalentAISearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TalentAISearchPanel({ isOpen, onClose }: TalentAISearchPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
            onClick={onClose}
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
            {/* AI Welcome Message */}
            <div className="bg-muted/10 border border-border rounded-sm p-5 mb-6">
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
                    onClick={() => setQuery(hint)}
                    className="text-left p-3 rounded-sm bg-background border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-blue-500/30 transition-all font-medium"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State / Search Results Placeholder */}
            {!isSearching && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-12 opacity-30 text-foreground">
                <BrainCircuit className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold tracking-tight">Intelligence-driven talent discovery</p>
              </div>
            )}
          </div>
        ) : (
          /* History Tab Placeholder */
          <div className="flex flex-col items-center justify-center h-full text-center px-12 opacity-30 text-foreground">
            <History className="w-12 h-12 mb-4" />
            <p className="text-sm font-bold tracking-tight">No search history yet</p>
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
            placeholder="Search talent with natural language..."
            className="w-full bg-muted/20 border border-border rounded-sm py-3.5 px-4 pr-12 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/50 font-medium text-foreground shadow-inner"
          />
          <button
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

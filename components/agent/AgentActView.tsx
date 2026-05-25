import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Brain, User, Cpu, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

export interface AgentActViewProps {
  status: string;
  isAwaking: boolean;
  isSleeping: boolean;
  isWaitingForInput: boolean;
  sleepCountdown: number;
  sleepTime: number;
  awakeCountdown: number;
  logs: Array<{ id: string; message: string; type: string }>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  getStatusColorClass: () => string;
  getStatusText: () => string;
  getProgressBarClass: () => string;
  availableOptions: string[];
  handleStart: (opt?: string) => void;
  isRunning?: boolean;
}

export const AgentActView: React.FC<AgentActViewProps> = ({
  status,
  isAwaking,
  isSleeping,
  isWaitingForInput,
  sleepCountdown,
  sleepTime,
  awakeCountdown,
  logs,
  scrollRef,
  getStatusColorClass,
  getStatusText,
  getProgressBarClass,
  availableOptions,
  handleStart,
  isRunning = false
}) => {
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  // Convert flat logs into structured chat items
  const chatItems = React.useMemo(() => {
    const items: any[] = [];
    let currentThoughts: any[] = [];

    logs.forEach((log, index) => {
      const isUser = log.message.startsWith('USER GOAL: ') || log.message.startsWith('USER ANSWER: ');
      const isAgentQuestion = log.message.startsWith('AGENT QUESTION: ');

      if (isUser) {
        if (currentThoughts.length > 0) {
          items.push({
            id: `thoughts-${index}`,
            type: 'thoughts',
            logs: [...currentThoughts],
          });
          currentThoughts = [];
        }
        items.push({
          id: log.id,
          type: 'user',
          text: log.message.replace(/^USER (GOAL|ANSWER): /, ''),
        });
      } else if (isAgentQuestion) {
        if (currentThoughts.length > 0) {
          items.push({
            id: `thoughts-${index}`,
            type: 'thoughts',
            logs: [...currentThoughts],
          });
          currentThoughts = [];
        }
        items.push({
          id: log.id,
          type: 'bot',
          text: log.message.replace('AGENT QUESTION: ', ''),
          isQuestion: true,
        });
      } else {
        currentThoughts.push(log);
      }
    });

    if (currentThoughts.length > 0) {
      items.push({
        id: `thoughts-final`,
        type: 'thoughts',
        logs: [...currentThoughts],
      });
    }

    return items;
  }, [logs]);

  // Find the last thinking block ID to keep it expanded by default
  const lastThinkingBlockId = React.useMemo(() => {
    const thoughtItems = chatItems.filter(item => item.type === 'thoughts');
    return thoughtItems.length > 0 ? thoughtItems[thoughtItems.length - 1].id : null;
  }, [chatItems]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Status Indicator */}
      <div className="space-y-1 bg-muted/20 p-2.5 rounded-[4px] border border-border/30">
        <div className="flex justify-between items-end w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System status</span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider truncate max-w-[200px] transition-colors",
            getStatusColorClass()
          )}>
            {getStatusText()}
          </span>
        </div>
        <div className="w-full h-1 bg-muted rounded-[2px] overflow-hidden border border-black/10">
          <div className={cn(
            "h-full transition-all duration-1000",
            getProgressBarClass()
          )} />
        </div>
      </div>

      {/* Chat Stream */}
      <div className="space-y-3.5">
        {chatItems.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-[3px] bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[12px] font-bold text-foreground">HR Agent Autonomous Assistant</h4>
              <p className="text-[10px] text-muted-foreground max-w-[240px] leading-relaxed">
                Enter an autonomous goal below to begin execution, or select options as they appear in the stream.
              </p>
            </div>
          </div>
        )}

        {chatItems.map((item) => {
          if (item.type === 'user') {
            return (
              <div key={item.id} className="flex gap-3 justify-end items-start animate-in fade-in duration-300">
                <div className="flex flex-col items-end max-w-[85%]">
                  <div className="px-3 py-2 bg-sky-100 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 border border-sky-200/50 dark:border-sky-800/30 rounded-[4px] text-[10px] leading-relaxed shadow-sm">
                    {item.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">You</span>
                </div>
                <div className="w-7 h-7 rounded-[3px] bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 shadow-sm border border-blue-200">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          }

          if (item.type === 'bot') {
            return (
              <div key={item.id} className="flex gap-3 justify-start items-start animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-[3px] bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-500/20">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start max-w-[85%] w-full">
                  <div className="px-3 py-2 bg-card border border-border text-foreground rounded-[4px] text-[10px] leading-relaxed shadow-sm space-y-3 w-full">
                    <div className="font-semibold whitespace-pre-wrap text-[10px]">{item.text}</div>
                    
                    {/* Inline options list inside/under the question bubble */}
                    {item.isQuestion && isWaitingForInput && availableOptions.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Select an option:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleStart(opt)}
                              className="px-2.5 py-1.5 bg-blue-600/10 text-blue-600 border border-blue-600/20 hover:bg-blue-600 hover:text-white rounded-[3px] text-[10px] font-bold transition-all shadow-sm flex items-center gap-1.5 group/opt cursor-pointer active:scale-95"
                            >
                              <div className="w-2.5 h-2.5 rounded-[2px] border border-current flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-current rounded-[1px] opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                              </div>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">HR Agent</span>
                </div>
              </div>
            );
          }

          if (item.type === 'thoughts') {
            const isExpanded = expandedThoughts[item.id] ?? (item.id === lastThinkingBlockId);

            return (
              <div key={item.id} className="border border-border/40 bg-muted/20 rounded-[4px] overflow-hidden animate-in fade-in duration-300">
                <button
                  type="button"
                  onClick={() => setExpandedThoughts(prev => ({ ...prev, [item.id]: !isExpanded }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-[10px] font-semibold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {status !== 'Idle' && isRunning && item.id === lastThinkingBlockId ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5 text-muted-foreground/80" />
                    )}
                    <span>Reasoning Process ({item.logs.length} step{item.logs.length === 1 ? '' : 's'})</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                
                {isExpanded && (
                  <div className="p-3 border-t border-border/20 bg-card font-mono text-[9px] space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border animate-in slide-in-from-top-1 duration-200">
                    {item.logs.map((log: any) => (
                      <div key={log.id} className="flex space-x-2">
                        <span className="text-foreground/40 shrink-0">·</span>
                        <span className={cn(
                          "leading-relaxed",
                          log.type === 'error' ? 'text-red-500 font-bold' : '',
                          log.type === 'success' ? 'text-emerald-500 font-bold' : '',
                          log.type === 'task' ? 'text-blue-500 font-bold' : '',
                          log.type === 'action' ? 'text-violet-500 font-medium' : 'text-foreground/80'
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

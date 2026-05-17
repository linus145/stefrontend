import React from 'react';
import { cn } from '@/lib/utils';

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
  handleStart
}) => {
  return (
    <>
      {/* Status Indicator */}
      <div className="space-y-1">
        <div className="flex justify-between items-end w-full">
          <span className="text-[11px] font-semibold text-foreground/80">System status</span>
          <span className={cn(
            "text-[11px] font-semibold truncate max-w-[200px] transition-colors",
            getStatusColorClass()
          )}>
            {getStatusText()}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-black">
          <div className={cn(
            "h-full transition-all duration-1000",
            getProgressBarClass()
          )} />
        </div>
      </div>

      {/* Execution Logs */}
      <div className="h-[220px] bg-card rounded-sm border border-border flex flex-col overflow-hidden shadow-sm shrink-0">
        <div className="px-3 py-2 border-b border-border bg-muted/60 flex justify-between items-center">
          <span className="text-[11px] font-bold text-foreground/90">Execution stream</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-border" />
            <div className="w-2 h-2 rounded-full bg-border" />
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 font-mono text-[10px] space-y-2.5 scrollbar-thin scrollbar-thumb-border">
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-foreground/30 italic opacity-80 font-sans">
              Waiting for autonomous command...
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex space-x-2 animate-in fade-in slide-in-from-left-1 duration-300">
              <span className="text-foreground/50 shrink-0 font-sans">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={cn(
                "leading-relaxed",
                log.type === 'error' ? 'text-red-500 font-bold' : '',
                log.type === 'success' ? 'text-emerald-500 font-bold' : '',
                log.type === 'task' ? 'text-blue-500 font-bold' : '',
                log.type === 'action' ? 'text-violet-500 font-medium' : 'text-foreground/90'
              )}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Options List (Expands fully inside scrollable container) */}
      {availableOptions.length > 0 && isWaitingForInput && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-foreground/80">Set autonomous goal</label>
            <span className="text-[10px] font-bold text-blue-500 animate-pulse">Select option below</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2 border border-border/50 rounded-sm bg-muted/20">
            {availableOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleStart(opt)}
                className="px-2 py-1 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-sm text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5 group/opt shrink-0"
              >
                <div className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-current rounded-full opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                </div>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

export interface AgentGoalInputProps {
  goal: string;
  setGoal: (val: string) => void;
  sidebarMode: 'ACT' | 'PLAN';
  isWaitingForInput: boolean;
  availableOptions: string[];
  isModeMenuOpen: boolean;
  setIsModeMenuOpen: (val: boolean) => void;
  setSidebarMode: (val: 'ACT' | 'PLAN') => void;
  isRunning: boolean;
  status: string;
  handleStart: (overrideGoal?: string) => void;
  handleStop: () => void;
  handleResume: () => void;
  handlePlanSendMessage: () => Promise<void>;
}

export const AgentGoalInput: React.FC<AgentGoalInputProps> = ({
  goal,
  setGoal,
  sidebarMode,
  isWaitingForInput,
  availableOptions,
  isModeMenuOpen,
  setIsModeMenuOpen,
  setSidebarMode,
  isRunning,
  status,
  handleStart,
  handleStop,
  handleResume,
  handlePlanSendMessage
}) => {
  return (
    <div className="p-3 border-t border-border bg-background space-y-2 shrink-0 animate-in fade-in duration-300">
      {(!isWaitingForInput || availableOptions.length === 0 || sidebarMode === 'PLAN') && (
        <label className="text-[11px] font-bold text-foreground/80 block">
          {sidebarMode === 'ACT' ? 'Set autonomous goal' : 'Ask hiring plan bot'}
        </label>
      )}

      {/* Composite Input Box styled like Gemini interface */}
      <div className={cn(
        "w-full bg-card border border-border rounded-sm p-2.5 flex flex-col gap-2 relative transition-all focus-within:ring-1 focus-within:ring-blue-500",
        isWaitingForInput && sidebarMode === 'ACT' && "border-blue-500 ring-1 ring-blue-500/20"
      )}>
        {/* Textarea Input */}
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={
            sidebarMode === 'ACT'
              ? (isWaitingForInput ? "Type your answer here..." : "e.g. Hire a Senior Next.js Developer...")
              : "Plan campaigns, candidate rules, question pools..."
          }
          className="bg-transparent border-0 outline-none focus:ring-0 p-1 text-xs font-semibold w-full resize-none text-foreground placeholder:text-muted-foreground/60 min-h-[48px] max-h-[120px] scrollbar-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (sidebarMode === 'ACT') {
                handleStart();
              } else {
                handlePlanSendMessage();
              }
            }
          }}
        />

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between border-t border-border/45 pt-1.5 shrink-0">
          {/* Left side actions: Plus sign and Dropdown selector */}
          <div className="flex items-center gap-1.5 relative">
            <button className="p-1 hover:bg-muted rounded-sm transition-colors text-foreground/60 hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>

            {/* Mode Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1 bg-muted/80 hover:bg-muted border border-border rounded-sm text-[10px] font-bold text-black dark:text-white transition-all shadow-sm"
              >
                <span>{sidebarMode === 'ACT' ? 'Act Mode' : 'Plan Mode'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={cn("transition-transform duration-200", isModeMenuOpen ? "rotate-180" : "")}><polyline points="18 15 12 9 6 15"/></svg>
              </button>

              {/* Mode Choice Menu Popover */}
              {isModeMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsModeMenuOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-1.5 w-40 bg-popover border border-border rounded-sm shadow-xl p-1 z-50 flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <button
                      onClick={() => {
                        setSidebarMode('ACT');
                        setIsModeMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-sm text-[10px] font-bold flex items-center gap-1.5 transition-colors text-black dark:text-white",
                        sidebarMode === 'ACT' ? "bg-blue-600/10 text-blue-600 hover:text-blue-600" : "hover:bg-muted"
                      )}
                    >
                      <span>Act (Autonomous)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSidebarMode('PLAN');
                        setIsModeMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-sm text-[10px] font-bold flex items-center gap-1.5 transition-colors text-black dark:text-white",
                        sidebarMode === 'PLAN' ? "bg-blue-600/10 text-blue-600 hover:text-blue-600" : "hover:bg-muted"
                      )}
                    >
                      <span>Plan (Conversational)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side actions: Send / Run / Stop buttons */}
          <div className="flex items-center gap-1.5">
            {isRunning && sidebarMode === 'ACT' && (
              <button
                onClick={handleStop}
                className="p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-sm transition-all active:scale-95 flex items-center justify-center"
                title="Stop Agent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
              </button>
            )}
            {!isRunning && status === 'Stopped' && sidebarMode === 'ACT' && (
              <button
                onClick={handleResume}
                className="p-1.5 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-sm transition-all active:scale-95 flex items-center justify-center"
                title="Continue Agent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 3 14 9-14 9V3z" /></svg>
              </button>
            )}
            <button
              onClick={() => sidebarMode === 'ACT' ? handleStart() : handlePlanSendMessage()}
              disabled={!goal.trim()}
              className="p-1.5 bg-foreground text-background hover:bg-blue-500 hover:text-white rounded-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

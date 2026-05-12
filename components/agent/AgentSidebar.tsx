
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AgentController } from '@/agent/core/AgentController';
import { AgentRealtimeStream } from '@/agent/core/AgentRealtimeStream';
import { AgentUIController } from '@/agent/ui/AgentUIController';
import { AgentTask } from '@/agent/planner/AgentPlanner';

export const AgentSidebar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [goal, setGoal] = useState('');
  const [logs, setLogs] = useState<{ id: string; message: string; type: string }[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [status, setStatus] = useState('Idle');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = (e: any) => {
      setIsVisible(e.detail.isVisible);
      if (e.detail.goal) {
        setGoal(e.detail.goal);
      }
    };
    window.addEventListener('agent-ui-toggle', handleToggle);

    // Initialize the controller so it can pick up any persisted cross-tab plans
    AgentController.getInstance();

    const stream = AgentRealtimeStream.getInstance();

    stream.on('status', (msg: string) => {
      setStatus(msg);
      addLog(msg, 'info');
    });

    stream.on('task_start', (task: AgentTask) => {
      setTasks(prev => [...prev, task]);
      addLog(`Starting task: ${task.description}`, 'task');
    });

    stream.on('action_start', (action: any) => {
      addLog(`Executing ${action.type} on ${action.selector || 'page'}`, 'action');
    });

    stream.on('goal_complete', (goal: string) => {
      setStatus('Goal Completed');
      addLog(`Successfully completed goal: ${goal}`, 'success');
    });

    stream.on('task_failed', ({ task, error }: any) => {
      setStatus('Error');
      addLog(`Task failed: ${task.description} - ${error}`, 'error');
    });

    stream.on('task_paused', (task: AgentTask) => {
      setStatus('Waiting for input...');
      addLog(`Task paused: ${task.description}`, 'info');
    });

    const handleAskUser = (e: any) => {
      setIsWaitingForInput(true);
      setLastQuestion(e.detail.message);
      addLog(`AGENT QUESTION: ${e.detail.message}`, 'task');
      AgentUIController.getInstance().openSidebar(); // Ensure sidebar is open
    };
    window.addEventListener('agent-ask-user', handleAskUser);

    return () => {
      window.removeEventListener('agent-ui-toggle', handleToggle);
      window.removeEventListener('agent-ask-user', handleAskUser);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), message, type }]);
  };

  const handleStart = () => {
    if (!goal.trim()) return;
    
    if (isWaitingForInput) {
      // If we were waiting for input, the new goal is actually the answer
      const answer = goal;
      addLog(`USER ANSWER: ${answer}`, 'info');
      setIsWaitingForInput(false);
      setLastQuestion('');

      const controller = AgentController.getInstance();
      controller.sendPlaywrightResponse(answer);
    } else {
      AgentController.getInstance().startGoal(goal);
    }
    setGoal('');
  };

  return (
    <>
      {/* Backdrop overlay — click outside to close */}
      {isVisible && (
        <div
          className="fixed inset-0 z-20 bg-black/10 transition-opacity duration-300"
          onClick={() => AgentUIController.getInstance().toggleSidebar()}
          aria-hidden="true"
        />
      )}

      <div className={cn(
        "fixed top-0 bottom-0 right-0 lg:inset-y-auto lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-30 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-2xl",
        isVisible
          ? "w-[85vw] sm:w-96 translate-x-0 opacity-100"
          : "w-0 translate-x-full lg:translate-x-0 lg:opacity-0 lg:border-none pointer-events-none"
      )}>
        {/* Inner wrapper with fixed width to prevent squishing during transition */}
        <div className="w-[85vw] sm:w-96 h-full flex flex-col">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-border flex justify-between items-center bg-muted/40">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h2 className="text-[15px] font-bold text-foreground tracking-tight">
                  Ahrmagent1
                </h2>
              </div>
              <p className="text-[11px] text-foreground/70 mt-0.5 font-semibold">Autonomous executor</p>
            </div>
            {/* Close arrow — slides sidebar back to the right */}
            <button
              onClick={() => AgentUIController.getInstance().toggleSidebar()}
              className="p-1.5 hover:bg-muted rounded-sm transition-colors text-foreground hover:text-blue-500 border border-border shadow-sm"
              title="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

        <div className="flex-1 overflow-hidden flex flex-col p-3 space-y-3 sm:p-4 sm:space-y-4 lg:p-5 lg:space-y-5">
          {/* Status Indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end w-full">
              <span className="text-[11px] font-semibold text-foreground/80">System status</span>
              <span className={cn("text-[11px] font-semibold truncate max-w-[240px]", status === 'Idle' ? 'text-foreground/30' : 'text-blue-500')}>{status}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-black">
              <div className={cn("h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]", status !== 'Idle' ? 'w-full animate-pulse' : 'w-0')} />
            </div>
          </div>

          {/* Execution Logs */}
          <div className="flex-1 bg-card rounded-sm border border-border flex flex-col overflow-hidden shadow-sm">
            <div className="px-3 py-2.5 border-b border-border bg-muted/60 flex justify-between items-center">
              <span className="text-[11px] font-bold text-foreground/90">Execution stream</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-border" />
                <div className="w-2 h-2 rounded-full bg-border" />
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 sm:p-3 lg:p-4 font-mono text-[10px] space-y-2.5 scrollbar-thin scrollbar-thumb-border">
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

          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground/80">Set autonomous goal</label>
            <div className="relative group">
            <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={isWaitingForInput ? "Type your answer here..." : "e.g. Hire a Senior Next.js Developer..."}
                className={cn(
                  "w-full bg-card border border-border rounded-sm p-3 lg:p-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] resize-none text-foreground placeholder:text-muted-foreground/60 focus:placeholder:text-transparent shadow-sm",
                  isWaitingForInput && "border-blue-500 ring-1 ring-blue-500/20"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStart();
                  }
                }}
              />
              <button
                onClick={handleStart}
                disabled={!goal.trim()}
                className="absolute bottom-3 right-3 p-2 bg-foreground text-background hover:bg-blue-500 hover:text-white rounded-sm transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 lg:p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-[10px] font-bold text-foreground/60">
            <span className="opacity-60 text-foreground/80">v1.0.0-alpha</span>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-foreground/80">Autonomous engine ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};


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
  const [isRunning, setIsRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepCountdown, setSleepCountdown] = useState(20);
  const [sleepTime, setSleepTime] = useState(0);
  const [isAwaking, setIsAwaking] = useState(false);
  const [awakeCountdown, setAwakeCountdown] = useState(5);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState('');
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
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
      setIsRunning(true);
      addLog(`Starting task: ${task.description}`, 'task');
    });

    stream.on('action_start', (action: any) => {
      addLog(`Executing ${action.type} on ${action.selector || 'page'}`, 'action');
    });

    stream.on('goal_complete', (goal: string) => {
      setStatus('Goal Completed');
      setIsRunning(false);
      addLog(`Successfully completed goal: ${goal}`, 'success');
    });

    stream.on('task_failed', ({ task, error }: any) => {
      setStatus(error === 'Execution terminated' ? 'Stopped' : 'Error');
      setIsRunning(false);
      if (error === 'Execution terminated') {
        addLog(error, 'error');
      } else {
        addLog(`Task failed: ${task.description} - ${error}`, 'error');
      }
    });

    stream.on('task_paused', (task: AgentTask) => {
      setStatus('Waiting for input...');
      addLog(`Task paused: ${task.description}`, 'info');
    });

    const handleAskUser = (e: any) => {
      setIsWaitingForInput(true);
      setLastQuestion(e.detail.message);
      setAvailableOptions(e.detail.options || []);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isWaitingForInput && !isAwaking) {
      if (!isSleeping) {
        if (sleepCountdown > 0) {
          timer = setTimeout(() => {
            setSleepCountdown(prev => prev - 1);
          }, 1000);
        } else {
          setIsSleeping(true);
          setSleepTime(0);
          addLog('Agent has gone to sleep due to inactivity. Send a response to wake it up.', 'info');
        }
      } else {
        timer = setTimeout(() => {
          setSleepTime(prev => prev + 1);
        }, 1000);
      }
    } else {
      setSleepCountdown(20);
      setSleepTime(0);
    }

    return () => clearTimeout(timer);
  }, [isWaitingForInput, isSleeping, sleepCountdown, sleepTime, isAwaking]);

  useEffect(() => {
    if (isWaitingForInput && !isSleeping && !isAwaking) {
      setSleepCountdown(20);
    }
  }, [goal]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isAwaking) {
      if (awakeCountdown > 0) {
        timer = setTimeout(() => {
          setAwakeCountdown(prev => prev - 1);
        }, 1000);
      } else {
        setIsAwaking(false);
        setIsWaitingForInput(false);
        setLastQuestion('');
        setAvailableOptions([]);

        if (pendingResponse) {
          addLog(`USER ANSWER: ${pendingResponse}`, 'info');
          addLog('Agent fully awake! Resuming execution...', 'success');
          const controller = AgentController.getInstance();
          controller.sendPlaywrightResponse(pendingResponse);
          setPendingResponse(null);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isAwaking, awakeCountdown, pendingResponse]);

  const addLog = (message: string, type: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), message, type }]);
  };

  const handleStart = (overrideGoal?: string) => {
    const finalGoal = overrideGoal || goal;
    if (!finalGoal.trim()) return;

    if (isWaitingForInput) {
      const answer = finalGoal;
      setGoal('');

      if (isSleeping) {
        setIsSleeping(false);
        setIsAwaking(true);
        setAwakeCountdown(5);
        setPendingResponse(answer);
        addLog('User response received. Waking up the agent in 5 seconds...', 'info');
      } else {
        addLog(`USER ANSWER: ${answer}`, 'info');
        setIsWaitingForInput(false);
        setLastQuestion('');
        setAvailableOptions([]);

        const controller = AgentController.getInstance();
        controller.sendPlaywrightResponse(answer);
      }
    } else {
      setIsRunning(true);
      AgentController.getInstance().startGoal(finalGoal);
      setGoal('');
    }
  };

  const handleStop = () => {
    AgentController.getInstance().stopAgent();
    setIsRunning(false);
  };

  const handleResume = () => {
    AgentController.getInstance().resumeAgent();
    setIsRunning(true);
  };

  const getStatusText = () => {
    if (isAwaking) return `Awaking in ${awakeCountdown}s...`;
    if (isSleeping) return `Sleeping (${sleepTime}s)`;
    if (isWaitingForInput) return `Waiting (Sleep in ${sleepCountdown}s)`;
    return status;
  };

  const getStatusColorClass = () => {
    if (isAwaking) return 'text-cyan-500 animate-pulse font-bold';
    if (isSleeping) return 'text-amber-500 animate-pulse font-bold';
    if (isWaitingForInput) return 'text-blue-500 font-bold';
    if (status === 'Idle') return 'text-foreground/30';
    return 'text-blue-500';
  };

  const getProgressBarClass = () => {
    if (isAwaking) return 'w-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]';
    if (isSleeping) return 'w-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (isWaitingForInput) return 'w-full bg-blue-500 animate-pulse';
    if (status !== 'Idle') return 'w-full bg-blue-500 animate-pulse';
    return 'w-0 bg-blue-500';
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
          ? "w-[85vw] sm:w-[360px] translate-x-0 opacity-100"
          : "w-0 translate-x-full lg:translate-x-0 lg:opacity-0 lg:border-none pointer-events-none"
      )}>
        {/* Inner wrapper with fixed width to prevent squishing during transition */}
        <div className="w-[85vw] sm:w-[360px] h-full flex flex-col bg-background">
          {/* Header */}
          <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h2 className="text-[14px] font-bold text-foreground tracking-tight">
                  Ahrmagent1
                </h2>
              </div>
              <p className="text-[10px] text-foreground/70 mt-0.5 font-semibold">Autonomous executor</p>
            </div>
            
            <div className="flex items-center gap-3.5 shrink-0">
              {/* History/timer symbol container with custom premium tooltip */}
              <div className="relative group flex items-center select-none">
                {/* Big non-clickable history/timer symbol */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/50 pointer-events-auto mr-1.5 cursor-help"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                
                {/* Tooltip */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2 py-0.5 bg-foreground text-background text-[9px] font-bold rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md z-40 border border-border/10">
                  history
                </div>
              </div>
              
              {/* Close arrow — slides sidebar back to the right */}
              <button
                onClick={() => AgentUIController.getInstance().toggleSidebar()}
                className="p-1.5 hover:bg-muted rounded-sm transition-colors text-foreground hover:text-blue-500 border border-border shadow-sm shrink-0"
                title="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          {/* Scrollable middle container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
            <div className="h-[200px] bg-card rounded-sm border border-border flex flex-col overflow-hidden shadow-sm shrink-0">
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
          </div>

          {/* Goal Input - LOCKED at bottom, never hidden! */}
          <div className="p-3 border-t border-border bg-background space-y-2 shrink-0">
            {(!isWaitingForInput || availableOptions.length === 0) && (
              <label className="text-[11px] font-bold text-foreground/80 block">Set autonomous goal</label>
            )}

            <div className="relative group">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={isWaitingForInput ? "Type your answer here..." : "e.g. Hire a Senior Next.js Developer..."}
                className={cn(
                  "w-full bg-card border border-border rounded-sm p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all min-h-[48px] sm:min-h-[56px] resize-none text-foreground placeholder:text-muted-foreground/60 focus:placeholder:text-transparent shadow-sm",
                  isWaitingForInput && "border-blue-500 ring-1 ring-blue-500/20"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStart();
                  }
                }}
              />
              {isRunning && (
                <button
                  onClick={handleStop}
                  className="absolute bottom-2.5 right-11 p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-sm transition-all shadow-xl active:scale-95 animate-in slide-in-from-right-2 duration-300"
                  title="Stop Agent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
                </button>
              )}
              {!isRunning && status === 'Stopped' && (
                <button
                  onClick={handleResume}
                  className="absolute bottom-2.5 right-11 p-1.5 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-sm transition-all shadow-xl active:scale-95 animate-in slide-in-from-right-2 duration-300 flex items-center justify-center"
                  title="Continue Agent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 3 14 9-14 9V3z" /></svg>
                </button>
              )}
              <button
                onClick={() => handleStart()}
                disabled={!goal.trim()}
                className="absolute bottom-2.5 right-2.5 p-1.5 bg-foreground text-background hover:bg-blue-500 hover:text-white rounded-sm transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 sm:p-2.5 border-t border-border bg-muted/20 shrink-0">
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

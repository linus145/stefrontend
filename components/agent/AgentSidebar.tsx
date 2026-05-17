
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AgentController } from '@/agent/core/AgentController';
import { AgentRealtimeStream } from '@/agent/core/AgentRealtimeStream';
import { AgentUIController } from '@/agent/ui/AgentUIController';
import { AgentTask } from '@/agent/planner/AgentPlanner';
import { api } from '@/lib/api';
import { AgentHistoryView } from './AgentHistoryView';
import { AgentActView } from './AgentActView';
import { AgentPlanView } from './AgentPlanView';
import { AgentGoalInput } from './AgentGoalInput';
import { aiAgentService } from '@/services/ai-agents.service';

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
  const [sidebarMode, setSidebarMode] = useState<'ACT' | 'PLAN'>('ACT');
  const [planMessages, setPlanMessages] = useState<Array<{ id: string; sender: 'bot' | 'user'; text: string }>>([
    { 
      id: 'init', 
      sender: 'bot', 
      text: "Hello! I am your conversational AI. 👋\n\nAsk me anything about your recruitment campaigns, candidate requirements, or interview structures!" 
    }
  ]);
  const [isPlanBotTyping, setIsPlanBotTyping] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  
  // Resizing state
  const [sidebarWidth, setSidebarWidth] = useState<number>(360);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const planScrollRef = useRef<HTMLDivElement>(null);

  // Load custom width from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_sidebar_width');
      if (saved) {
        const num = parseInt(saved, 10);
        if (!isNaN(num) && num >= 300 && num <= 1000) {
          setSidebarWidth(num);
        }
      }
    }
  }, []);

  const startResize = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      // Boundaries
      const minWidth = 300;
      const maxWidth = Math.min(1000, window.innerWidth * 0.75);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        localStorage.setItem('agent_sidebar_width', newWidth.toString());
      }
    }
  }, [isResizing]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  // Auto-scroll plan messages
  useEffect(() => {
    if (planScrollRef.current) {
      planScrollRef.current.scrollTop = planScrollRef.current.scrollHeight;
    }
  }, [planMessages, isPlanBotTyping]);

  // Load chat and execution histories from the backend on mount/visibility
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        // Fetch Conversational Chat history
        const chatRes = await api.get<any[]>('/autonomousagent1/chat/history/');
        if (chatRes && chatRes.length > 0) {
          const mapped = chatRes.map((c: any) => ({
            id: c.id,
            sender: (c.sender === 'user' ? 'user' : 'bot') as 'user' | 'bot',
            text: c.text
          }));
          setPlanMessages(mapped);
        }
        
        // Fetch Autonomous Execution history
        const execRes = await api.get<any[]>('/autonomousagent1/executions/');
        if (execRes) {
          setExecutionHistory(execRes);
        }
      } catch (error) {
        console.error("Failed to load histories:", error);
      }
    };

    if (isVisible || showHistoryView) {
      fetchHistories();
    }
  }, [isVisible, showHistoryView]);

  // Clear Chat History
  const handleClearChatHistory = async () => {
    try {
      await aiAgentService.clearChatHistory();
      setPlanMessages([
        { 
          id: 'init', 
          sender: 'bot', 
          text: "Hello! I am your conversational AI. 👋\n\nAsk me anything about your recruitment campaigns, candidate requirements, or interview structures!" 
        }
      ]);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  // Delete Individual Execution
  const handleDeleteExecution = async (id: string) => {
    try {
      await aiAgentService.deleteExecution(id);
      setExecutionHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete execution:", error);
    }
  };

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

  const handlePlanSendMessage = async () => {
    if (!goal.trim()) return;
    const userText = goal;
    setGoal('');
    
    // Add User message
    const userMsgId = Math.random().toString(36).substr(2, 9);
    const updatedMessages: { id: string; sender: 'user' | 'bot'; text: string }[] = [
      ...planMessages,
      { id: userMsgId, sender: 'user' as const, text: userText }
    ];
    setPlanMessages(updatedMessages);
    setIsPlanBotTyping(true);

    try {
      await api.post('/autonomousagent1/chat/history/', { sender: 'user', text: userText });
    } catch (err) {
      console.error("Failed to save chat to history:", err);
    }

    try {
      const historyContext = planMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const token = localStorage.getItem('token') || '';
      const response = await fetch('/api/ai/plan-chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          history: historyContext
        })
      });

      const resJson = await response.json();
      setIsPlanBotTyping(false);

      if (resJson.status === 'success' && resJson.data?.reply) {
        const replyText = resJson.data.reply;
        try {
          await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: replyText });
        } catch (err) {
          console.error("Failed to save AI chat to history:", err);
        }
        setPlanMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: replyText
        }]);
      } else {
        const fallbackText = "I have compiled a custom hiring strategy for you:\n\n1. Target matches on GitHub and LinkedIn with active profiles.\n2. Filter candidates based on required technical skill matrices.\n3. Send invitation rounds using AI Interviews.\n\nLet me know if you would like me to configure specific questions!";
        try {
          await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: fallbackText });
        } catch (err) {
          console.error("Failed to save AI chat to history:", err);
        }
        // Fallback strategy template
        setPlanMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: fallbackText
        }]);
      }
    } catch (err) {
      console.error(err);
      setIsPlanBotTyping(false);
      const fallbackText = "I have compiled a custom hiring strategy for you:\n\n1. Target matches on GitHub and LinkedIn with active profiles.\n2. Filter candidates based on required technical skill matrices.\n3. Send invitation rounds using AI Interviews.\n\nLet me know if you would like me to configure specific questions!";
      try {
        await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: fallbackText });
      } catch (err) {
        console.error("Failed to save AI chat to history:", err);
      }
      setPlanMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: fallbackText
      }]);
    }
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
          className="fixed inset-0 z-20 bg-black/10 transition-opacity duration-300 lg:hidden"
          onClick={() => AgentUIController.getInstance().toggleSidebar()}
          aria-hidden="true"
        />
      )}

      <div 
        className={cn(
          "fixed top-0 bottom-0 right-0 lg:inset-y-auto lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-30 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border shrink-0 overflow-hidden shadow-2xl",
          !isResizing && "transition-all duration-300 ease-in-out",
          isVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-full lg:translate-x-0 lg:opacity-0 lg:border-none pointer-events-none"
        )}
        style={{
          width: isVisible ? `${sidebarWidth}px` : '0px',
        }}
      >
        {/* Resize Drag Handle */}
        {isVisible && (
          <div
            onMouseDown={startResize}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/20 active:bg-blue-500/40 z-50 transition-colors",
              isResizing && "bg-blue-500/30 w-1.5"
            )}
          />
        )}

        {/* Inner wrapper with fixed width to prevent squishing during transition */}
        <div 
          className="h-full flex flex-col bg-background"
          style={{
            width: isVisible ? `${sidebarWidth}px` : '360px',
          }}
        >
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
              {/* History/timer symbol button with custom premium tooltip */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowHistoryView(!showHistoryView)}
                  className={cn(
                    "p-1 hover:bg-muted rounded-sm transition-colors text-foreground/50 hover:text-foreground shrink-0 border border-border shadow-sm flex items-center justify-center relative",
                    showHistoryView && "bg-blue-600/10 text-blue-600 border-blue-600/20"
                  )}
                  title="Toggle Agent History"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </button>
                
                {/* Tooltip */}
                {!showHistoryView && (
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2 py-0.5 bg-foreground text-background text-[9px] font-bold rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md z-40 border border-border/10">
                    history
                  </div>
                )}
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
            {showHistoryView ? (
              <AgentHistoryView
                planMessages={planMessages}
                executionHistory={executionHistory}
                onClearChatHistory={handleClearChatHistory}
                onDeleteExecution={handleDeleteExecution}
                onClose={() => setShowHistoryView(false)}
              />
            ) : sidebarMode === 'ACT' ? (
              <AgentActView
                status={status}
                isAwaking={isAwaking}
                isSleeping={isSleeping}
                isWaitingForInput={isWaitingForInput}
                sleepCountdown={sleepCountdown}
                sleepTime={sleepTime}
                awakeCountdown={awakeCountdown}
                logs={logs}
                scrollRef={scrollRef}
                getStatusColorClass={getStatusColorClass}
                getStatusText={getStatusText}
                getProgressBarClass={getProgressBarClass}
                availableOptions={availableOptions}
                handleStart={handleStart}
              />
            ) : (
              <AgentPlanView
                planMessages={planMessages}
                isPlanBotTyping={isPlanBotTyping}
                planScrollRef={planScrollRef}
              />
            )}
          </div>

          {/* Goal Input - LOCKED at bottom, hidden in history mode */}
          {!showHistoryView && (
            <AgentGoalInput
              goal={goal}
              setGoal={setGoal}
              sidebarMode={sidebarMode}
              isWaitingForInput={isWaitingForInput}
              availableOptions={availableOptions}
              isModeMenuOpen={isModeMenuOpen}
              setIsModeMenuOpen={setIsModeMenuOpen}
              setSidebarMode={setSidebarMode}
              isRunning={isRunning}
              status={status}
              handleStart={handleStart}
              handleStop={handleStop}
              handleResume={handleResume}
              handlePlanSendMessage={handlePlanSendMessage}
            />
          )}

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


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
import { useAuth } from '@/hooks/useAuth';

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Standard UUID v4 generator fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  const [currentConversationId, setCurrentConversationId] = useState<string>('');

  // Load sidebar mode on mount to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('agent_sidebar_mode');
      if (savedMode === 'ACT' || savedMode === 'PLAN') {
        setSidebarMode(savedMode);
      }
      const savedConvId = localStorage.getItem('agent_current_conversation_id');
      if (savedConvId) {
        setCurrentConversationId(savedConvId);
      } else {
        const fallbackId = generateUUID();
        setCurrentConversationId(fallbackId);
        localStorage.setItem('agent_current_conversation_id', fallbackId);
      }
    }
  }, []);

  const changeSidebarMode = (mode: 'ACT' | 'PLAN') => {
    setSidebarMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_sidebar_mode', mode);
    }
  };

  const [planMessages, setPlanMessages] = useState<Array<{ id: string; sender: 'bot' | 'user'; text: string; timestamp?: number; conversation_id?: string }>>([
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

  // Subscription-based tiered agent lock
  const { userSubscription, isLoading } = useAuth();
  const agentPlanPrice = (userSubscription?.status === 'active' && userSubscription?.plan_details)
    ? Number(userSubscription.plan_details.price) : 0;

  // Free & Basic (< 12000): No agent access at all (neither Plan nor Act mode)
  const isAgentFullyLocked = !isLoading && agentPlanPrice < 12000;
  // Growth (< 18000): Only Plan/Conversational mode, Act mode locked
  const isActModeLocked = !isLoading && agentPlanPrice < 18000;

  // Force PLAN mode when Act is locked; if fully locked, still default to PLAN (UI will show lock)
  useEffect(() => {
    if (isActModeLocked) {
      setSidebarMode('PLAN');
      if (typeof window !== 'undefined') {
        localStorage.setItem('agent_sidebar_mode', 'PLAN');
      }
      const controller = AgentController.getInstance();
      if (controller.getIsRunning()) {
        controller.stopAgent();
        setIsRunning(false);
        setStatus('Stopped');
      }
    }
  }, [isActModeLocked]);

  // Synchronize sidebar mode with running state
  useEffect(() => {
    if (isRunning && !isActModeLocked) {
      setSidebarMode('ACT');
    }
  }, [isRunning, isActModeLocked]);

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
            text: c.text,
            timestamp: c.timestamp ? new Date(c.timestamp).getTime() : undefined,
            conversation_id: c.conversation_id || undefined
          }));
          setPlanMessages([
            {
              id: 'init',
              sender: 'bot',
              text: "Hello! I am your conversational AI. 👋\n\nAsk me anything about your recruitment campaigns, candidate requirements, or interview structures!"
            },
            ...mapped
          ]);

          if (typeof window !== 'undefined' && !localStorage.getItem('agent_current_conversation_id')) {
            const lastWithId = [...mapped].reverse().find(m => m.conversation_id);
            const activeId = lastWithId?.conversation_id || generateUUID();
            setCurrentConversationId(activeId);
            localStorage.setItem('agent_current_conversation_id', activeId);
          }
        } else {
          setPlanMessages([
            {
              id: 'init',
              sender: 'bot',
              text: "Hello! I am your conversational AI. 👋\n\nAsk me anything about your recruitment campaigns, candidate requirements, or interview structures!"
            }
          ]);
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
  }, [isVisible, showHistoryView, sidebarMode]);

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
      const newId = generateUUID();
      setCurrentConversationId(newId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agent_current_conversation_id', newId);
      }
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await api.delete(`/autonomousagent1/chat/clear/?conversation_id=${convId}`);
      
      // Filter out deleted messages locally
      setPlanMessages(prev => prev.filter(m => m.id === 'init' || m.conversation_id !== convId));
      
      // If the deleted conversation was the active one, start a new chat session
      if (currentConversationId === convId) {
        const newId = generateUUID();
        setCurrentConversationId(newId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_current_conversation_id', newId);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Start a completely fresh new chat session and reset all execution/UI states
  const handleNewChat = async () => {
    try {
      // 1. Stop any active agent execution
      AgentController.getInstance().stopAgent();

      // 2. Clear localStorage contexts
      localStorage.removeItem('agent_llm_context');
      localStorage.removeItem('agent_paused_action');
      localStorage.removeItem('agent_paused_tab_transition');

      // 3. Reset all frontend states
      setGoal('');
      setLogs([]);
      setTasks([]);
      setStatus('Idle');
      setIsRunning(false);
      setIsWaitingForInput(false);
      setIsSleeping(false);
      setLastQuestion('');
      setAvailableOptions([]);
      setPendingResponse(null);

      // 4. Start a new chat session locally by generating a new UUID
      const newId = generateUUID();
      setCurrentConversationId(newId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agent_current_conversation_id', newId);
      }

      // 5. Add custom status log
      addLog("✨ Started a new conversation. All states reset successfully.", "success");
    } catch (error) {
      console.error("Failed to start new chat:", error);
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
    const controller = AgentController.getInstance();
    const activeRunning = controller.getIsRunning();
    setIsRunning(activeRunning);
    if (activeRunning) {
      setStatus('Running...');
      if (!isActModeLocked) {
        setSidebarMode('ACT');
      }
    } else {
      if (typeof window !== 'undefined') {
        const planData = localStorage.getItem('agent_active_plan');
        const llmData = localStorage.getItem('agent_llm_context');
        if (planData || llmData) {
          setStatus('Stopped');
          if (!isActModeLocked) {
            setSidebarMode('ACT');
          }
        }
      }
    }

    const stream = AgentRealtimeStream.getInstance();

    const onStatus = (msg: string) => {
      setStatus(msg);
      addLog(msg, 'info');
      setIsRunning(controller.getIsRunning());
    };

    const onTaskStart = (task: AgentTask) => {
      setTasks(prev => [...prev, task]);
      setIsRunning(true);
      addLog(`Starting task: ${task.description}`, 'task');
    };

    const onActionStart = (action: any) => {
      addLog(`Executing ${action.type} on ${action.selector || 'page'}`, 'action');
      setIsRunning(controller.getIsRunning());
    };

    const onGoalComplete = async (goal: string) => {
      setStatus('Goal Completed');
      setIsRunning(false);

      let cleanGoal = goal;
      if (goal.includes('You are now in the Interview Pipeline') || goal.length > 80) {
        const firstLine = goal.split('\n')[0].trim();
        if (firstLine && firstLine.length < 80) {
          cleanGoal = firstLine;
        } else {
          cleanGoal = 'Hiring workflow phase successfully completed.';
        }
      }
      addLog(`Successfully completed goal: ${cleanGoal}`, 'success');

      // RC-6 backup: finalize scheduling log if use-scheduling.ts hasn't already
      if (typeof window !== 'undefined') {
        const activeLogId = sessionStorage.getItem('active_scheduling_log_id');
        if (activeLogId) {
          sessionStorage.removeItem('active_scheduling_log_id');
          try {
            await api.patch(`/agentsettings/scheduling/logs/${activeLogId}/`, {
              status: 'success',
              completed_at: new Date().toISOString()
            });
            window.dispatchEvent(new CustomEvent('agent-scheduling-log-updated'));
          } catch (err) {
            console.error("Failed to complete scheduling log from sidebar:", err);
          }
        }
      }
    };

    const onTaskFailed = async ({ task, error }: any) => {
      setStatus(error === 'Execution terminated' ? 'Stopped' : 'Error');
      setIsRunning(false);
      if (error === 'Execution terminated') {
        addLog(error, 'error');
      } else {
        addLog(`Task failed: ${task.description} - ${error}`, 'error');
      }

      // RC-6 backup: finalize scheduling log if use-scheduling.ts hasn't already
      if (typeof window !== 'undefined') {
        const activeLogId = sessionStorage.getItem('active_scheduling_log_id');
        if (activeLogId) {
          sessionStorage.removeItem('active_scheduling_log_id');
          const errorMsg = error || 'Execution terminated';
          try {
            await api.patch(`/agentsettings/scheduling/logs/${activeLogId}/`, {
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: errorMsg
            });
            window.dispatchEvent(new CustomEvent('agent-scheduling-log-updated'));
          } catch (err) {
            console.error("Failed to fail scheduling log from sidebar:", err);
          }
        }
      }
    };

    const onTaskPaused = (task: AgentTask) => {
      setStatus('Waiting for input...');
      addLog(`Task paused: ${task.description}`, 'info');
    };

    stream.on('status', onStatus);
    stream.on('task_start', onTaskStart);
    stream.on('action_start', onActionStart);
    stream.on('goal_complete', onGoalComplete);
    stream.on('task_failed', onTaskFailed);
    stream.on('task_paused', onTaskPaused);

    const handleAskUser = (e: any) => {
      setIsWaitingForInput(true);
      setLastQuestion(e.detail.message);
      setAvailableOptions(e.detail.options || []);
      addLog(`AGENT QUESTION: ${e.detail.message}`, 'task');
      AgentUIController.getInstance().openSidebar(); // Ensure sidebar is open
    };
    window.addEventListener('agent-ask-user', handleAskUser);

    const handleScreeningCompleted = (e: any) => {
      const score = e.detail?.score;
      const candidateName = e.detail?.candidateName;
      const totalCandidates = e.detail?.totalCandidates;
      if (score !== undefined) {
        addLog(`📊 AI Screening Complete! Evaluated ${totalCandidates} candidates. Top Match: ${candidateName} (${score}%)`, 'success');
      }
    };
    window.addEventListener('agent-screening-completed', handleScreeningCompleted);

    return () => {
      window.removeEventListener('agent-ui-toggle', handleToggle);
      window.removeEventListener('agent-ask-user', handleAskUser);
      window.removeEventListener('agent-screening-completed', handleScreeningCompleted);
      stream.off('status', onStatus);
      stream.off('task_start', onTaskStart);
      stream.off('action_start', onActionStart);
      stream.off('goal_complete', onGoalComplete);
      stream.off('task_failed', onTaskFailed);
      stream.off('task_paused', onTaskPaused);
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

    // Ensure we have a valid currentConversationId before sending
    let activeConvId = currentConversationId;
    if (!activeConvId) {
      activeConvId = generateUUID();
      setCurrentConversationId(activeConvId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agent_current_conversation_id', activeConvId);
      }
    }

    // Add User message
    const userMsgId = Math.random().toString(36).substr(2, 9);
    const updatedMessages: { id: string; sender: 'user' | 'bot'; text: string; timestamp?: number; conversation_id?: string }[] = [
      ...planMessages,
      { id: userMsgId, sender: 'user' as const, text: userText, conversation_id: activeConvId }
    ];
    setPlanMessages(updatedMessages);
    setIsPlanBotTyping(true);

    try {
      await api.post('/autonomousagent1/chat/history/', { sender: 'user', text: userText, conversation_id: activeConvId });
    } catch (err) {
      console.error("Failed to save chat to history:", err);
    }

    try {
      // Filter context to only include the current conversation session's history
      const historyContext = planMessages
        .filter(m => m.id !== 'init' && m.conversation_id === activeConvId)
        .map(m => ({
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
          await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: replyText, conversation_id: activeConvId });
        } catch (err) {
          console.error("Failed to save AI chat to history:", err);
        }
        setPlanMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: replyText,
          conversation_id: activeConvId
        }]);
      } else {
        const fallbackText = "I have compiled a custom hiring strategy for you:\n\n1. Target matches on GitHub and LinkedIn with active profiles.\n2. Filter candidates based on required technical skill matrices.\n3. Send invitation rounds using AI Interviews.\n\nLet me know if you would like me to configure specific questions!";
        try {
          await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: fallbackText, conversation_id: activeConvId });
        } catch (err) {
          console.error("Failed to save AI chat to history:", err);
        }
        setPlanMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: fallbackText,
          conversation_id: activeConvId
        }]);
      }
    } catch (err) {
      console.error(err);
      setIsPlanBotTyping(false);
      const fallbackText = "I have compiled a custom hiring strategy for you:\n\n1. Target matches on GitHub and LinkedIn with active profiles.\n2. Filter candidates based on required technical skill matrices.\n3. Send invitation rounds using AI Interviews.\n\nLet me know if you would like me to configure specific questions!";
      try {
        await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: fallbackText, conversation_id: activeConvId });
      } catch (err) {
        console.error("Failed to save AI chat to history:", err);
      }
      setPlanMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: fallbackText,
        conversation_id: activeConvId
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
      addLog(`USER GOAL: ${finalGoal}`, 'info');
      setIsRunning(true);
      AgentController.getInstance().startGoal(finalGoal);
      setGoal('');
    }
  };

  const handleStop = () => {
    AgentController.getInstance().stopAgent();
    setIsRunning(false);
  };

  const handleStartRef = useRef(handleStart);
  useEffect(() => {
    handleStartRef.current = handleStart;
  });

  useEffect(() => {
    const handleRunGoal = (e: any) => {
      const targetGoal = e.detail.goal;
      if (targetGoal) {
        setIsVisible(true);
        setSidebarMode('ACT');
        setGoal(targetGoal); // Paste the command into the chat input

        // After 600ms, simulate hitting enter / start
        setTimeout(() => {
          if (handleStartRef.current) {
            handleStartRef.current(targetGoal);
          }
        }, 600);
      }
    };
    window.addEventListener('agent-run-goal', handleRunGoal);
    return () => {
      window.removeEventListener('agent-run-goal', handleRunGoal);
    };
  }, []);

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
          "fixed top-0 bottom-0 right-0 lg:inset-y-auto lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-[110] flex flex-col bg-background/95 backdrop-blur-xl border-l border-border shrink-0 overflow-hidden shadow-2xl",
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
                <div className="w-2 h-2 rounded-sm bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h2 className="text-[14px] font-bold text-foreground tracking-tight">
                  HR Agent
                </h2>
              </div>
              <p className="text-[10px] text-foreground/70 mt-0.5 font-semibold">Autonomous executor</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* New Chat Button */}
              <div className="relative flex items-center group">
                <button
                  onClick={handleNewChat}
                  className="p-1 hover:bg-muted rounded-[3px] transition-colors text-foreground/50 hover:text-foreground shrink-0 border border-border shadow-sm flex items-center justify-center relative hover:text-blue-600 hover:border-blue-600/20"
                  title="New Chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2 py-0.5 bg-foreground text-background text-[9px] font-bold rounded-[3px] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md z-40 border border-border/10">
                  new chat
                </div>
              </div>

              {/* History/timer symbol button with custom premium tooltip */}
              <div className="relative flex items-center group">
                <button
                  onClick={() => setShowHistoryView(!showHistoryView)}
                  className={cn(
                    "p-1 hover:bg-muted rounded-[3px] transition-colors text-foreground/50 hover:text-foreground shrink-0 border border-border shadow-sm flex items-center justify-center relative",
                    showHistoryView && "bg-blue-600/10 text-blue-600 border-blue-600/20"
                  )}
                  title="Toggle Agent History"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </button>

                {/* Tooltip */}
                {!showHistoryView && (
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2 py-0.5 bg-foreground text-background text-[9px] font-bold rounded-[3px] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md z-40 border border-border/10">
                    history
                  </div>
                )}
              </div>

              {/* Close arrow — slides sidebar back to the right */}
              <button
                onClick={() => AgentUIController.getInstance().toggleSidebar()}
                className="p-1.5 hover:bg-muted rounded-[3px] transition-colors text-foreground hover:text-blue-500 border border-border shadow-sm shrink-0"
                title="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>


          {/* Scrollable middle container */}
          {showHistoryView ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-border">
              <AgentHistoryView
                planMessages={planMessages}
                executionHistory={executionHistory}
                onClearChatHistory={handleClearChatHistory}
                onDeleteExecution={handleDeleteExecution}
                onClose={() => setShowHistoryView(false)}
                currentConversationId={currentConversationId}
                onSelectConversation={(id) => {
                  setCurrentConversationId(id);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('agent_current_conversation_id', id);
                  }
                  setShowHistoryView(false);
                }}
                onDeleteConversation={handleDeleteConversation}
                defaultSubTab={sidebarMode}
              />
            </div>
          ) : sidebarMode === 'ACT' ? (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-border">
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
                isRunning={isRunning}
              />
            </div>
          ) : (
            <div ref={planScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-border">
              <AgentPlanView
                planMessages={planMessages.filter(msg => {
                  if (msg.id === 'init') return true;
                  return msg.conversation_id === currentConversationId;
                })}
                isPlanBotTyping={isPlanBotTyping}
                planScrollRef={planScrollRef}
              />
            </div>
          )}

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
              setSidebarMode={changeSidebarMode}
              isRunning={isRunning}
              status={status}
              handleStart={handleStart}
              handleStop={handleStop}
              handleResume={handleResume}
              handlePlanSendMessage={handlePlanSendMessage}
              isAgentFullyLocked={isAgentFullyLocked}
              isActModeLocked={isActModeLocked}
            />
          )}

          {/* Footer */}
          <div className="p-2 sm:p-2.5 border-t border-border bg-muted/20 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-bold text-foreground/60">
              <span className="opacity-60 text-foreground/80">v1.0.0-alpha</span>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <span className="text-foreground/80">Autonomous engine ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

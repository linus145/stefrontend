'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AgentRealtimeStream } from '../../../../agent/core/AgentRealtimeStream';
import { AgentSchedulingData, CommandStep, DEFAULT_SCHEDULING } from './types';
import { AgentController } from '../../../../agent/core/AgentController';

/** Centralised scheduling hook – holds every piece of state, handler and side-effect
 *  that used to live inside the monolithic AgentSchedulingTab component. */
export function useScheduling() {
  // ── core data ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduling, setScheduling] = useState<AgentSchedulingData>(DEFAULT_SCHEDULING);

  // ── builder form state ─────────────────────────────────────────────────────
  const [taskSelect, setTaskSelect] = useState('payroll_runs');
  const [recurrenceSelect, setRecurrenceSelect] = useState('12h');
  const [commandText, setCommandText] = useState('');
  const [stepTimeInput, setStepTimeInput] = useState('09:00:00');
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'logs'>('config');

  // ── history / logs ─────────────────────────────────────────────────────────
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isTriggeringSample, setIsTriggeringSample] = useState(false);

  // ── refs ────────────────────────────────────────────────────────────────────
  const activeLogIdRef = useRef<number | null>(null);
  const actionsPerformedRef = useRef<any[]>([]);
  const startTimeRef = useRef<number>(0);
  const triggeredStepsRef = useRef<Record<string, string>>({});

  // ── helpers ─────────────────────────────────────────────────────────────────
  const getCommandSteps = (): CommandStep[] => {
    try {
      if (scheduling.command && scheduling.command.trim()) {
        const parsed = JSON.parse(scheduling.command);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // Fallback if not valid JSON (e.g. legacy plain text command)
      const tasksArray = scheduling.task_type ? scheduling.task_type.split(',').map(t => t.trim()).filter(Boolean) : [];
      return tasksArray.map(t => ({
        task: t,
        recurrence: scheduling.recurrence || 'daily',
        command: scheduling.command || 'Execute default task',
        execution_time: scheduling.execution_time || '09:00:00'
      }));
    }
    return [];
  };

  const timeToSeconds = (timeStr: string) => {
    try {
      const parts = timeStr.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;
      return h * 3600 + m * 60 + s;
    } catch (e) {
      return 0;
    }
  };

  const isTooClose = (time1: string, time2: string) => {
    const diff = Math.abs(timeToSeconds(time1) - timeToSeconds(time2));
    // 5 minutes = 300 seconds
    return diff < 300;
  };

  // ── API helpers ─────────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    try {
      const res = await api.get<any[]>('/agentsettings/scheduling/logs/');
      if (res) {
        setHistory(res);
      }
    } catch (err) {
      console.error('Failed to load execution history', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const saveSchedulingToBackend = async (updatedData: AgentSchedulingData) => {
    try {
      const res = await api.patch<AgentSchedulingData>('/agentsettings/scheduling/', updatedData);
      if (res) {
        setScheduling(res);
        toast.success('Schedule auto-saved successfully!');
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to auto-save schedule changes', err);
      toast.error('Failed to auto-save schedule changes');
    }
  };

  const triggerVisualRun = async (task: string, command: string) => {
    // RC-3: Anti-loop guard — do not trigger a new run if one is already active
    const isTaskRunning = activeLogIdRef.current !== null || AgentController.getInstance().getIsRunning();
    if (isTaskRunning) {
      console.warn('[Scheduling] Skipping trigger — a task is already running.');
      return;
    }

    try {
      const newLog = await api.post<any>('/agentsettings/scheduling/logs/', {
        task_type: task,
        command: command,
        status: 'running',
        actions_performed: []
      });
      if (newLog && newLog.id) {
        activeLogIdRef.current = newLog.id;
        // RC-6: Backup in sessionStorage so AgentSidebar can also finalize this log
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('active_scheduling_log_id', newLog.id.toString());
        }
        actionsPerformedRef.current = [];
        startTimeRef.current = Date.now();
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to create visual run log:", err);
    }
    const agentEvent = new CustomEvent('agent-run-goal', { detail: { goal: command } });
    window.dispatchEvent(agentEvent);
  };

  // ── command step handlers ──────────────────────────────────────────────────
  const handleAddCommandStep = () => {
    if (!commandText.trim()) {
      toast.error("Please enter a command instruction!");
      return;
    }
    const currentSteps = getCommandSteps();

    // Enforce 5-minute difference constraint to prevent execution overlaps
    const isOverlap = currentSteps.some((step) => isTooClose(step.execution_time, stepTimeInput || '09:00:00'));
    if (isOverlap) {
      toast.warning("To prevent overlaps, autonomous task steps must be scheduled at least 5 minutes apart!");
      return;
    }

    const newStep: CommandStep = {
      task: taskSelect,
      recurrence: recurrenceSelect,
      command: commandText.trim(),
      execution_time: stepTimeInput || '09:00:00'
    };

    const updatedSteps = [...currentSteps, newStep];
    const updatedTaskType = updatedSteps.map(s => s.task).join(',');

    const updatedScheduling = {
      ...scheduling,
      task_type: updatedTaskType,
      command: JSON.stringify(updatedSteps)
    };

    setScheduling(updatedScheduling);
    saveSchedulingToBackend(updatedScheduling);

    setCommandText('');
    setStepTimeInput('09:00:00');
  };

  const handleStartEditStep = (index: number) => {
    const steps = getCommandSteps();
    const step = steps[index];
    if (step) {
      setTaskSelect(step.task);
      setRecurrenceSelect(step.recurrence);
      setCommandText(step.command);
      setStepTimeInput(step.execution_time);
      setEditingStepIndex(index);
      toast.info(`Editing step #${index + 1}. Modify the fields above and click 'Save'.`);
    }
  };

  const handleUpdateCommandStep = () => {
    if (!commandText.trim()) {
      toast.error("Please enter a command instruction!");
      return;
    }
    if (editingStepIndex === null) return;

    const currentSteps = getCommandSteps();

    // Enforce 5-minute difference constraint, skipping the step being edited
    const isOverlap = currentSteps.some((step, idx) => {
      if (editingStepIndex !== null && idx === editingStepIndex) return false;
      return isTooClose(step.execution_time, stepTimeInput || '09:00:00');
    });
    if (isOverlap) {
      toast.warning("To prevent overlaps, autonomous task steps must be scheduled at least 5 minutes apart!");
      return;
    }

    const updatedSteps = [...currentSteps];

    updatedSteps[editingStepIndex] = {
      task: taskSelect,
      recurrence: recurrenceSelect,
      command: commandText.trim(),
      execution_time: stepTimeInput || '09:00:00'
    };

    const updatedTaskType = updatedSteps.map(s => s.task).join(',');

    const updatedScheduling = {
      ...scheduling,
      task_type: updatedTaskType,
      command: JSON.stringify(updatedSteps)
    };

    setScheduling(updatedScheduling);
    saveSchedulingToBackend(updatedScheduling);

    setCommandText('');
    setStepTimeInput('09:00:00');
    setEditingStepIndex(null);
  };

  const handleCancelEditStep = () => {
    setCommandText('');
    setStepTimeInput('09:00:00');
    setEditingStepIndex(null);
    toast.info("Edit cancelled.");
  };

  const handleRemoveCommandStep = (indexToRemove: number) => {
    const currentSteps = getCommandSteps();
    const updatedSteps = currentSteps.filter((_, idx) => idx !== indexToRemove);
    const updatedTaskType = updatedSteps.map(s => s.task).join(',');

    const updatedScheduling = {
      ...scheduling,
      task_type: updatedTaskType,
      command: JSON.stringify(updatedSteps)
    };

    setScheduling(updatedScheduling);
    saveSchedulingToBackend(updatedScheduling);
  };

  const handleSampleRun = async () => {
    setIsTriggeringSample(true);
    try {
      const steps = getCommandSteps();
      const firstStep = steps.length > 0 ? steps[0] : null;
      const commandToRun = firstStep ? firstStep.command : 'need payslip approval';
      const targetTask = firstStep ? firstStep.task : 'payroll_runs';

      toast.success(`Launching agent sample run: "${commandToRun}"`);
      await triggerVisualRun(targetTask, commandToRun);
    } catch (err) {
      console.error('Failed to trigger sample run', err);
      toast.error('Failed to trigger sample run');
    } finally {
      setIsTriggeringSample(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch<AgentSchedulingData>('/agentsettings/scheduling/', scheduling);
      if (res) {
        setScheduling(res);
        toast.success('Agent scheduling updated successfully!');
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to save scheduling', err);
      toast.error('Failed to update agent scheduling');
    } finally {
      setIsSaving(false);
    }
  };

  // ── effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Rehydrate triggeredSteps from sessionStorage to prevent looping when component remounts
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('agent_triggered_steps');
        if (stored) {
          triggeredStepsRef.current = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse triggered steps", e);
      }
    }

    const fetchScheduling = async () => {
      try {
        const res = await api.get<AgentSchedulingData>('/agentsettings/scheduling/');
        if (res) {
          setScheduling(res);
        }
      } catch (err) {
        console.error('Failed to load agent scheduling', err);
        toast.error('Failed to load agent scheduling');
      } finally {
        setIsLoading(false);
      }
    };
    fetchScheduling();
    fetchHistory();
  }, []);

  // RC-5: Listen for log-updated events (emitted by completion handlers) to refresh the UI
  useEffect(() => {
    const handleLogUpdated = () => {
      fetchHistory();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('agent-scheduling-log-updated', handleLogUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('agent-scheduling-log-updated', handleLogUpdated);
      }
    };
  }, []);

  // Realtime stream subscription
  useEffect(() => {
    const stream = AgentRealtimeStream.getInstance();

    const onActionStart = (action: any) => {
      if (activeLogIdRef.current === null) return;
      const formattedAction = {
        action: `${action.type || action.action_type || 'Action'} on ${action.selector || 'page'}`,
        result: action.value || action.description || 'Action performed.'
      };
      actionsPerformedRef.current.push(formattedAction);

      api.patch(`/agentsettings/scheduling/logs/${activeLogIdRef.current}/`, {
        actions_performed: actionsPerformedRef.current
      }).catch(err => console.error("Failed to patch real-time actions:", err));
    };

    const onGoalComplete = async () => {
      // Capture logId from ref, or fall back to sessionStorage if ref was lost (e.g., component remounted)
      let logId: number | null = activeLogIdRef.current;
      if (logId === null && typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('active_scheduling_log_id');
        if (stored) logId = parseInt(stored, 10);
      }
      if (logId === null) return;
      activeLogIdRef.current = null;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      try {
        await api.patch(`/agentsettings/scheduling/logs/${logId}/`, {
          status: 'success',
          completed_at: new Date().toISOString(),
          duration: duration,
          actions_performed: actionsPerformedRef.current
        });
      } catch (err) {
        console.error("Failed to complete log", err);
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('active_scheduling_log_id');
        }
        actionsPerformedRef.current = [];
        window.dispatchEvent(new CustomEvent('agent-scheduling-log-updated'));
        fetchHistory();
      }
    };

    const onTaskFailed = async (data: any) => {
      // Capture logId from ref, or fall back to sessionStorage if ref was lost
      let logId: number | null = activeLogIdRef.current;
      if (logId === null && typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('active_scheduling_log_id');
        if (stored) logId = parseInt(stored, 10);
      }
      if (logId === null) return;
      activeLogIdRef.current = null;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      const errorMsg = data?.error || 'Execution terminated';
      try {
        await api.patch(`/agentsettings/scheduling/logs/${logId}/`, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration: duration,
          error_message: errorMsg,
          actions_performed: actionsPerformedRef.current
        });
      } catch (err) {
        console.error("Failed to fail log", err);
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('active_scheduling_log_id');
        }
        actionsPerformedRef.current = [];
        window.dispatchEvent(new CustomEvent('agent-scheduling-log-updated'));
        fetchHistory();
      }
    };

    stream.on('action_start', onActionStart);
    stream.on('goal_complete', onGoalComplete);
    stream.on('task_failed', onTaskFailed);

    return () => {
      stream.off('action_start', onActionStart);
      stream.off('goal_complete', onGoalComplete);
      stream.off('task_failed', onTaskFailed);
    };
  }, []);

  // Client-side scheduled polling
  useEffect(() => {
    // Do not poll if background schedules are currently disabled for this tenant
    if (!scheduling.enabled) return;

    const interval = setInterval(() => {
      // RC-3: Skip polling entirely if a task is already running
      const isTaskRunning = activeLogIdRef.current !== null || AgentController.getInstance().getIsRunning();
      if (isTaskRunning) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDateStr = now.toDateString();

      const steps = getCommandSteps();
      steps.forEach((step, idx) => {
        if (!step.execution_time) return;
        // RC-3: Double-check — skip if a preceding step just started a task in this loop
        const isTaskRunningInner = activeLogIdRef.current !== null || AgentController.getInstance().getIsRunning();
        if (isTaskRunningInner) return;

        try {
          const parts = step.execution_time.split(':');
          const stepHour = parseInt(parts[0], 10);
          const stepMinute = parseInt(parts[1], 10);

          const isHourMatch = step.recurrence === '12h'
            ? (currentHour === stepHour || currentHour === ((stepHour + 12) % 24))
            : (currentHour === stepHour);

          if (isHourMatch && currentMinute === stepMinute) {
            const stepKey = `step_${idx}_${step.command}_${step.execution_time}`;
            const triggerTimeKey = step.recurrence === '12h'
              ? `${currentDateStr}_${currentHour >= 12 ? 'pm' : 'am'}`
              : currentDateStr;

            if (triggeredStepsRef.current[stepKey] !== triggerTimeKey) {
              triggeredStepsRef.current[stepKey] = triggerTimeKey;
              if (typeof window !== 'undefined') {
                try {
                  sessionStorage.setItem('agent_triggered_steps', JSON.stringify(triggeredStepsRef.current));
                } catch (e) {}
              }

              toast.success(`⏰ Scheduled Trigger Time Reached! Executing: "${step.command}"`);
              triggerVisualRun(step.task, step.command);
            }
          }
        } catch (e) {
          console.error("Error evaluating scheduled trigger:", e);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [scheduling.command, scheduling.enabled]);

  // ── return surface ──────────────────────────────────────────────────────────
  return {
    // data
    isLoading,
    isSaving,
    scheduling,
    setScheduling,
    commandSteps: getCommandSteps(),

    // builder form
    taskSelect,
    setTaskSelect,
    recurrenceSelect,
    setRecurrenceSelect,
    commandText,
    setCommandText,
    stepTimeInput,
    setStepTimeInput,
    editingStepIndex,

    // sub-tab
    activeSubTab,
    setActiveSubTab,

    // history
    history,
    isHistoryLoading,

    // policy modal
    showPolicyModal,
    setShowPolicyModal,

    // sample run
    isTriggeringSample,

    // handlers
    handleAddCommandStep,
    handleStartEditStep,
    handleUpdateCommandStep,
    handleCancelEditStep,
    handleRemoveCommandStep,
    handleSampleRun,
    handleSave,
  };
}

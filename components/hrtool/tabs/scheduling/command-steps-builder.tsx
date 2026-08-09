'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { TASK_OPTIONS, CommandStep, formatTimeStr } from './types';

interface CommandStepsBuilderProps {
  enabled: boolean;
  taskSelect: string;
  recurrenceSelect: string;
  commandText: string;
  stepTimeInput: string;
  editingStepIndex: number | null;
  commandSteps: CommandStep[];
  onTaskSelectChange: (val: string) => void;
  onRecurrenceSelectChange: (val: string) => void;
  onCommandTextChange: (val: string) => void;
  onStepTimeInputChange: (val: string) => void;
  onAddStep: () => void;
  onUpdateStep: () => void;
  onCancelEdit: () => void;
  onStartEdit: (index: number) => void;
  onRemoveStep: (index: number) => void;
}

// Helper utilities for 12h/24h time conversion
function parseTimeTo12h(timeStr: string) {
  let hour12 = '09';
  let minute = '00';
  let second = '00';
  let period: 'AM' | 'PM' = 'AM';

  if (timeStr) {
    const cleaned = timeStr.trim().toUpperCase();
    const match12 = cleaned.match(/^(\d+):(\d+)(?::(\d+))?\s*(AM|PM)$/);
    if (match12) {
      hour12 = match12[1].padStart(2, '0');
      minute = match12[2].padStart(2, '0');
      second = (match12[3] || '00').padStart(2, '0');
      period = match12[4] as 'AM' | 'PM';
    } else {
      const match24 = cleaned.match(/^(\d+):(\d+)(?::(\d+))?$/);
      if (match24) {
        let hr = parseInt(match24[1], 10);
        minute = match24[2].padStart(2, '0');
        second = (match24[3] || '00').padStart(2, '0');
        period = hr >= 12 ? 'PM' : 'AM';
        hr = hr % 12;
        if (hr === 0) hr = 12;
        hour12 = String(hr).padStart(2, '0');
      }
    }
  }

  return { hour12, minute, second, period };
}

function compileTo24h(hour12: string, minute: string, second: string, period: 'AM' | 'PM') {
  let hr = parseInt(hour12, 10);
  if (period === 'PM' && hr < 12) hr += 12;
  if (period === 'AM' && hr === 12) hr = 0;
  
  const hrStr = String(hr).padStart(2, '0');
  const minStr = minute.padStart(2, '0');
  const secStr = second.padStart(2, '0');
  return `${hrStr}:${minStr}:${secStr}`;
}

export function CommandStepsBuilder({
  enabled,
  taskSelect,
  recurrenceSelect,
  commandText,
  stepTimeInput,
  editingStepIndex,
  commandSteps,
  onTaskSelectChange,
  onRecurrenceSelectChange,
  onCommandTextChange,
  onStepTimeInputChange,
  onAddStep,
  onUpdateStep,
  onCancelEdit,
  onStartEdit,
  onRemoveStep,
}: CommandStepsBuilderProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  const { hour12, minute, second, period } = parseTimeTo12h(stepTimeInput);

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Autonomous Command Tasks Builder
        </label>
        <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold leading-normal mb-3">
          Build a multi-action agent pipeline. Add sequential tasks with custom commands, recurrence, and specific trigger times.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50/50 dark:bg-[#1c1d30]/30 p-3.5 border border-slate-200/60 dark:border-slate-800/80 rounded-[3px]">
          {/* Task Selection (3 cols) */}
          <div className="md:col-span-3 space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Task</span>
            <select
              value={taskSelect}
              disabled={!enabled}
              onChange={(e) => onTaskSelectChange(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2]"
            >
              {TASK_OPTIONS.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Frequency (2 cols) */}
          <div className="md:col-span-2 space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Frequency</span>
            <select
              value={recurrenceSelect}
              disabled={!enabled}
              onChange={(e) => onRecurrenceSelectChange(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2]"
            >
              <option value="12h">Every 12 Hours</option>
              <option value="daily">Everyday (Daily)</option>
              <option value="weekly">Every Week (Weekly)</option>
              <option value="monthly">Every Month (Monthly)</option>
              <option value="yearly">Every Year (Yearly)</option>
            </select>
          </div>

          {/* Command / Instruction (3 cols) */}
          <div className="md:col-span-3 space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Command Instruction</span>
            <input
              type="text"
              disabled={!enabled}
              value={commandText}
              onChange={(e) => onCommandTextChange(e.target.value)}
              placeholder="e.g. need payslip approval"
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-[3px] font-semibold focus:outline-none focus:border-[#0a66c2]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddStep();
                }
              }}
            />
          </div>

          {/* Time with Seconds (2 cols) */}
          <div className="md:col-span-2 space-y-1 relative">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Trigger Time</span>
            <div className="relative">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="w-full h-9 px-3 text-left text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2] flex items-center justify-between cursor-pointer"
              >
                <span>{`${hour12}:${minute}:${second} ${period}`}</span>
                <Clock className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500" />
              </button>

              {isPickerOpen && (
                <div 
                  ref={pickerRef}
                  className="absolute right-0 bottom-full md:bottom-auto md:top-full z-50 mt-1 p-3 bg-white dark:bg-[#121320] border border-slate-200 dark:border-slate-800 rounded-[3px] shadow-lg flex gap-1 items-center justify-center min-w-[250px] animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {/* Hour Select */}
                  <select
                    value={hour12}
                    onChange={(e) => {
                      const newTime = compileTo24h(e.target.value, minute, second, period);
                      onStepTimeInputChange(newTime);
                    }}
                    className="w-[22%] h-8 text-center text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <span className="text-slate-400 dark:text-slate-650 font-extrabold select-none">:</span>

                  {/* Minute Select */}
                  <select
                    value={minute}
                    onChange={(e) => {
                      const newTime = compileTo24h(hour12, e.target.value, second, period);
                      onStepTimeInputChange(newTime);
                    }}
                    className="w-[22%] h-8 text-center text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <span className="text-slate-400 dark:text-slate-650 font-extrabold select-none">:</span>

                  {/* Second Select */}
                  <select
                    value={second}
                    onChange={(e) => {
                      const newTime = compileTo24h(hour12, minute, e.target.value, period);
                      onStepTimeInputChange(newTime);
                    }}
                    className="w-[22%] h-8 text-center text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Period (AM/PM) Select */}
                  <select
                    value={period}
                    onChange={(e) => {
                      const newTime = compileTo24h(hour12, minute, second, e.target.value as 'AM' | 'PM');
                      onStepTimeInputChange(newTime);
                    }}
                    className="w-[28%] h-8 text-center text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {editingStepIndex !== null ? (
            <div className="md:col-span-2 flex gap-1.5 w-full">
              <Button
                type="button"
                onClick={onUpdateStep}
                className="flex-1 bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-[11px] h-9 rounded-[3px] flex items-center justify-center cursor-pointer transition-colors"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 bg-[#0a66c2]/80 hover:bg-[#084e96] text-white font-extrabold text-[11px] h-9 rounded-[3px] flex items-center justify-center cursor-pointer transition-colors"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="md:col-span-2 flex w-full">
              <Button
                type="button"
                disabled={!enabled}
                onClick={onAddStep}
                className="w-full bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs h-9 rounded-[3px] flex items-center justify-center cursor-pointer transition-colors"
              >
                Add Step
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Pipeline Steps List */}
      <div className="space-y-2 mt-4">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Configured Sequence & Steps List ({commandSteps.length})
        </span>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {commandSteps.length > 0 ? (
            commandSteps.map((step, idx) => {
              const matchedTask = TASK_OPTIONS.find(o => o.id === step.task);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50/70 dark:bg-[#1c1d30]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-[3px] shadow-2xs hover:border-[#0a66c2]/30 dark:hover:border-[#0a66c2]/30 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1 min-w-0">
                    {/* Task Badge */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <Badge className="bg-[#0a66c2]/10 hover:bg-[#0a66c2]/15 text-[#0a66c2] border-none font-bold text-[9px] px-2 py-0.5 rounded-[3px] uppercase">
                        {matchedTask ? matchedTask.label : step.task}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-[3px] uppercase">
                        {step.recurrence?.toUpperCase() || 'DAILY'}
                      </Badge>
                    </div>
                    {/* Command Instruction */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 truncate">
                        {step.command}
                      </p>
                    </div>
                    {/* Trigger Time Badge */}
                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-450 dark:text-slate-500 font-bold bg-slate-100 dark:bg-[#151624] px-2 py-0.5 rounded-[3px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatTimeStr(step.execution_time)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!enabled}
                      onClick={() => onStartEdit(idx)}
                      className="text-[10px] font-extrabold text-[#0a66c2] hover:text-[#084e96] hover:bg-[#0a66c2]/10 px-2 py-1.5 rounded-[3px] cursor-pointer transition-all"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={!enabled}
                      onClick={() => onRemoveStep(idx)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-750 hover:bg-red-500/10 p-1.5 rounded-[3px] cursor-pointer transition-all shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[3px]">
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium italic">No sequential steps added yet. Add a step above to build your pipeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

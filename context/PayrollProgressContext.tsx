'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Clock, FileText, Loader2, Minus, Maximize2, Sparkles 
} from 'lucide-react';
import { hrPayrollService } from '@/services/hr/payroll.service';

interface ProgressState {
  isOpen: boolean;
  payrollId: string | null;
  totalCount: number;
  generatedCount: number;
  secondsElapsed: number;
  isFinished: boolean;
  isMinimized: boolean;
}

interface PayrollProgressContextType {
  startProgress: (payrollId: string, totalCount?: number) => void;
  minimizeProgress: () => void;
  maximizeProgress: () => void;
  dismissProgress: () => void;
  progressState: ProgressState;
}

const STORAGE_KEY = 'b2linq_payroll_progress_state';

const defaultState: ProgressState = {
  isOpen: false,
  payrollId: null,
  totalCount: 13,
  generatedCount: 0,
  secondsElapsed: 0,
  isFinished: false,
  isMinimized: false,
};

const PayrollProgressContext = createContext<PayrollProgressContextType | undefined>(undefined);

export function PayrollProgressProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<ProgressState>(defaultState);

  // Restore active session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isOpen && parsed?.payrollId) {
          setState(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save active session to localStorage whenever state changes
  useEffect(() => {
    try {
      if (state.isOpen && state.payrollId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore write errors
    }
  }, [state]);

  // Timer ticker (only ticks while open and not finished)
  useEffect(() => {
    if (!state.isOpen || state.isFinished) return;

    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        secondsElapsed: prev.secondsElapsed + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isOpen, state.isFinished]);

  // Polling loop
  useEffect(() => {
    if (!state.isOpen || !state.payrollId || state.isFinished) return;

    let isMounted = true;

    const poll = async () => {
      try {
        const res = await hrPayrollService.getPayrollProgress(state.payrollId!);
        if (isMounted && res?.data) {
          const total = res.data.total_count || state.totalCount || 13;
          const generated = res.data.generated_count || 0;
          const finished = res.data.is_complete || (total > 0 && generated >= total) || res.data.status === 'FAILED';

          setState((prev) => ({
            ...prev,
            totalCount: total,
            generatedCount: Math.max(prev.generatedCount, generated),
            isFinished: finished,
          }));
        }
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 404 || err?.response?.status === 403) {
            dismissProgress();
            return;
          }
          setState((prev) => {
            const nextGen = Math.min(prev.generatedCount + 1, prev.totalCount);
            return {
              ...prev,
              generatedCount: nextGen,
              isFinished: nextGen >= prev.totalCount && prev.secondsElapsed >= 2,
            };
          });
        }
      }
    };

    poll();
    const interval = setInterval(poll, 700);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.isOpen, state.payrollId, state.isFinished, state.totalCount]);

  const startProgress = (payrollId: string, totalCount = 13) => {
    const newState: ProgressState = {
      isOpen: true,
      payrollId,
      totalCount: totalCount || 13,
      generatedCount: 0,
      secondsElapsed: 0,
      isFinished: false,
      isMinimized: false,
    };
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  };

  const minimizeProgress = () => {
    setState((prev) => ({ ...prev, isMinimized: true }));
  };

  const maximizeProgress = () => {
    setState((prev) => ({ ...prev, isMinimized: false }));
  };

  const dismissProgress = () => {
    setState(defaultState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const completeAndNavigate = () => {
    dismissProgress();
    router.push('/Hrtools/payroll/payslips');
  };

  const effectiveTotal = Math.max(state.totalCount, 1);
  const percent = state.isFinished
    ? 100
    : Math.min(Math.round((state.generatedCount / effectiveTotal) * 100), 98);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <PayrollProgressContext.Provider
      value={{
        startProgress,
        minimizeProgress,
        maximizeProgress,
        dismissProgress,
        progressState: state,
      }}
    >
      {children}

      {/* Global Persistent Progress UI */}
      {state.isOpen && (
        <>
          {/* Minimized Docked Widget */}
          {state.isMinimized ? (
            <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
              <div className={`bg-white dark:bg-[#121320] border rounded-sm shadow-2xl p-3 flex items-center gap-3 w-88 transition-all ${
                state.isFinished 
                  ? 'border-emerald-500/40 dark:border-emerald-500/30' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}>
                
                {/* Mini circular ring */}
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      className={`transition-all duration-300 ${
                        state.isFinished ? 'text-emerald-500' : 'text-[#0a66c2]'
                      }`}
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={2 * Math.PI * 30 - (percent / 100) * (2 * Math.PI * 30)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className={`absolute text-[10px] font-semibold ${state.isFinished ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {state.isFinished ? '✓' : `${percent}%`}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    {state.isFinished ? (
                      <span className="text-emerald-600 dark:text-emerald-400">All Payslips Ready</span>
                    ) : (
                      'Generating Payslips...'
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-0.5">
                    <span>{state.isFinished ? effectiveTotal : state.generatedCount}/{effectiveTotal} generated</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{formatTime(state.secondsElapsed)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {state.isFinished ? (
                    <>
                      <Button
                        onClick={dismissProgress}
                        className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-sm cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        OK
                      </Button>
                      <Button
                        onClick={completeAndNavigate}
                        className="h-7 px-2.5 bg-[#0a66c2] hover:bg-[#084e96] text-white text-[10px] font-semibold rounded-sm cursor-pointer shadow-sm"
                      >
                        View →
                      </Button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={maximizeProgress}
                      title="Maximize"
                      className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Full Centered Modal */
            <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#121320] border border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-sm shadow-xl p-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Top Header Controls: Minimize */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Payroll Compilation
                  </span>
                  <button
                    type="button"
                    onClick={minimizeProgress}
                    title="Minimize to background corner"
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#0a66c2] cursor-pointer bg-transparent border-none outline-none py-0.5 px-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" /> Minimize
                  </button>
                </div>

                {/* Circular Progress Ring */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className={`transition-all duration-400 ease-out ${
                          state.isFinished ? 'text-emerald-500' : 'text-[#0a66c2]'
                        }`}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>

                    {/* Center Content */}
                    <div className="absolute flex flex-col items-center justify-center">
                      {state.isFinished ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      ) : (
                        <>
                          <span className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                            {percent}%
                          </span>
                          <span className="text-[9px] font-medium text-[#0a66c2] uppercase tracking-wide">
                            Active
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-2.5 text-center">
                    {state.isFinished ? 'Payslips Successfully Generated' : 'Generating & Publishing Payslips'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-normal mt-0.5 max-w-xs">
                    {state.isFinished
                      ? `All ${effectiveTotal} payslips have been compiled in ${formatTime(state.secondsElapsed)}.`
                      : `Building ReportLab PDF documents & cloud assets.`}
                  </p>
                </div>

                {/* Live Counters & Timer Bar */}
                <div className="grid grid-cols-2 gap-2.5 py-2.5 px-3 bg-slate-50 dark:bg-[#151624]/60 rounded-sm border border-slate-150 dark:border-slate-800/80 my-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-sm bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-slate-400 uppercase">Payslips</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {state.isFinished ? effectiveTotal : state.generatedCount} / {effectiveTotal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2.5">
                    <div className="w-7 h-7 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-slate-400 uppercase">Elapsed Time</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {formatTime(state.secondsElapsed)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {state.isFinished ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={dismissProgress}
                      className="flex-1 h-8.5 rounded-sm text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      OK (Stay Here)
                    </Button>
                    <Button
                      type="button"
                      onClick={completeAndNavigate}
                      className="flex-1 h-8.5 rounded-sm text-xs font-semibold bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm cursor-pointer"
                    >
                      View Payslips →
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="w-full h-8.5 rounded-sm text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700/50"
                  >
                    Processing in Background...
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </PayrollProgressContext.Provider>
  );
}

export function usePayrollProgress() {
  const context = useContext(PayrollProgressContext);
  if (!context) {
    throw new Error('usePayrollProgress must be used within a PayrollProgressProvider');
  }
  return context;
}

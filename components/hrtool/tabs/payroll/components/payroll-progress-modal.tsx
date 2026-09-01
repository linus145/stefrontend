'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Clock, FileText, Sparkles, Loader2, 
  Minus, Maximize2, X 
} from 'lucide-react';
import { hrPayrollService } from '@/services/hr/payroll.service';

interface PayrollProgressModalProps {
  isOpen: boolean;
  payrollId: string | null;
  totalRecordsCount?: number;
  onComplete: () => void;
  onDismiss?: () => void;
}

export function PayrollProgressModal({
  isOpen,
  payrollId,
  totalRecordsCount = 13,
  onComplete,
  onDismiss,
}: PayrollProgressModalProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(totalRecordsCount || 13);
  const [isFinished, setIsFinished] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Timer ticker - stops automatically once finished
  useEffect(() => {
    if (!isOpen || isFinished || isDismissed) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isFinished, isDismissed]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSecondsElapsed(0);
      setGeneratedCount(0);
      setIsFinished(false);
      setIsMinimized(false);
      setIsDismissed(false);
      setTotalCount(totalRecordsCount || 13);
    }
  }, [isOpen, totalRecordsCount]);

  // Progress Polling loop
  useEffect(() => {
    if (!isOpen || !payrollId || isFinished || isDismissed) return;

    let isMounted = true;
    let localGenerated = 0;

    const poll = async () => {
      try {
        const res = await hrPayrollService.getPayrollProgress(payrollId);
        if (isMounted && res?.data) {
          const fetchedTotal = res.data.total_count || totalRecordsCount || 13;
          const fetchedGenerated = res.data.generated_count || 0;
          
          setTotalCount(fetchedTotal);
          localGenerated = Math.max(localGenerated, fetchedGenerated);
          setGeneratedCount(localGenerated);

          if (res.data.is_complete || (fetchedTotal > 0 && localGenerated >= fetchedTotal)) {
            setIsFinished(true);
            return;
          }
        }
      } catch {
        if (isMounted) {
          localGenerated = Math.min(localGenerated + 1, totalCount);
          setGeneratedCount(localGenerated);
          if (localGenerated >= totalCount && secondsElapsed >= 2) {
            setIsFinished(true);
          }
        }
      }
    };

    poll();
    const interval = setInterval(poll, 700);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, payrollId, isFinished, isDismissed, totalRecordsCount, totalCount, secondsElapsed]);

  if (!isOpen || isDismissed) return null;

  const effectiveTotal = Math.max(totalCount, 1);
  const percent = isFinished
    ? 100
    : Math.min(Math.round((generatedCount / effectiveTotal) * 100), 98);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Minimized Bottom-Right Floating Widget
  // Stays permanently on the page until the user explicitly clicks OK or View
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className={`bg-white dark:bg-[#121320] border rounded-sm shadow-2xl p-3 flex items-center gap-3 w-88 transition-all ${
          isFinished 
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
                  isFinished ? 'text-emerald-500' : 'text-[#0a66c2]'
                }`}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 - (percent / 100) * (2 * Math.PI * 30)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className={`absolute text-[10px] font-semibold ${isFinished ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {isFinished ? '✓' : `${percent}%`}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              {isFinished ? (
                <>
                  <span className="text-emerald-600 dark:text-emerald-400">All Payslips Ready</span>
                </>
              ) : (
                'Generating Payslips...'
              )}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-0.5">
              <span>{isFinished ? effectiveTotal : generatedCount}/{effectiveTotal} generated</span>
              <span>•</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">{formatTime(secondsElapsed)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isFinished ? (
              <>
                <Button
                  onClick={handleDismiss}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-sm cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  OK
                </Button>
                <Button
                  onClick={onComplete}
                  className="h-7 px-2.5 bg-[#0a66c2] hover:bg-[#084e96] text-white text-[10px] font-semibold rounded-sm cursor-pointer shadow-sm"
                >
                  View →
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                title="Maximize"
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full Centered Modal
  return (
    <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121320] border border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-sm shadow-xl p-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Controls: Minimize & Dismiss button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Payroll Compilation
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to background corner"
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#0a66c2] cursor-pointer bg-transparent border-none outline-none py-0.5 px-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" /> Minimize
            </button>
          </div>
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
                  isFinished ? 'text-emerald-500' : 'text-[#0a66c2]'
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
              {isFinished ? (
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
            {isFinished ? 'Payslips Successfully Generated' : 'Generating & Publishing Payslips'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-normal mt-0.5 max-w-xs">
            {isFinished
              ? `All ${effectiveTotal} payslips have been compiled in ${formatTime(secondsElapsed)}.`
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
                {isFinished ? effectiveTotal : generatedCount} / {effectiveTotal}
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
                {formatTime(secondsElapsed)}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Checklist */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-sm bg-slate-50/60 dark:bg-[#161726]/40 border border-slate-100 dark:border-slate-800/40">
            <span className="font-normal text-slate-700 dark:text-slate-300">1. Attendance & Salary Computation</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-sm bg-slate-50/60 dark:bg-[#161726]/40 border border-slate-100 dark:border-slate-800/40">
            <span className="font-normal text-slate-700 dark:text-slate-300">2. Deductions & Statutory Locking</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-sm bg-slate-50/60 dark:bg-[#161726]/40 border border-slate-100 dark:border-slate-800/40">
            <span className="font-normal text-slate-700 dark:text-slate-300">
              3. PDF Cloud Generation ({isFinished ? effectiveTotal : generatedCount}/{effectiveTotal})
            </span>
            {isFinished ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Loader2 className="h-3.5 w-3.5 text-[#0a66c2] animate-spin" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isFinished ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleDismiss}
              className="flex-1 h-8.5 rounded-sm text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              OK (Stay Here)
            </Button>
            <Button
              type="button"
              onClick={onComplete}
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
  );
}

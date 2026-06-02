'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface SchedulingPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export function SchedulingPolicyModal({ open, onClose }: SchedulingPolicyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#121320] border border-slate-200 dark:border-slate-800 rounded-sm shadow-xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#0a66c2]" />
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
              Schedules Policy & Disclaimer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
            <p>When active, the agent wakes up at the designated step target time using server-side tasks to process payroll or resume matching.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
            <p>The execution limit prevents unexpected resource consumption by disabling the trigger after reaching maximum counts.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
            <p>All compiled reports are sent directly to the configured recipient email address after completion.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
            <p>Celery workers must be active to schedule and trigger background tasks.</p>
          </div>
          
          {/* AI Warning point */}
          <div className="flex gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-sm text-amber-600 dark:text-amber-500 text-[11px] font-bold">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <p>
              AI agents can make mistakes. Please verify generated payroll figures, onboarding salary sheets, and critical configurations before executing high autonomy cycles.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold uppercase">Engine Version:</span>
            <span className="text-[10px] font-black text-[#0a66c2] bg-[#0a66c2]/10 px-1.5 py-0.5 rounded-sm">V2.5-CRON</span>
          </div>
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs h-8 px-3.5 rounded-sm cursor-pointer"
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}

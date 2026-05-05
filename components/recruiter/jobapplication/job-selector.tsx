'use client';

import { ChevronDown, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobSelectorProps {
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
  jobs: any[];
  copiedId: string | null;
  onCopyId: (id: string) => void;
  manualJobId: string;
  setManualJobId: (id: string) => void;
  onAnalyze: (id: string) => void;
  isAnalyzePending: boolean;
}

export function JobSelector({
  activeJobId,
  setActiveJobId,
  jobs,
  copiedId,
  onCopyId,
  manualJobId,
  setManualJobId,
  onAnalyze,
  isAnalyzePending
}: JobSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
          Select Active Job
        </label>
        <div className="relative">
          <select
            value={activeJobId || ''}
            onChange={(e) => setActiveJobId(e.target.value || null)}
            className="w-full rounded-sm bg-muted/30 dark:bg-slate-800 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none transition-all cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">-- Choose a job post --</option>
            {jobs.map((job: any) => (
              <option 
                key={job.id} 
                value={job.id}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {job.title} ({job.applications_count} applicants)
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {activeJobId && (
          <div className="mt-2 flex items-center gap-2 group">
            <code className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
              ID: {activeJobId}
            </code>
            <button 
              onClick={() => onCopyId(activeJobId)}
              className="text-muted-foreground hover:text-teal-500 transition-colors"
            >
              {copiedId === activeJobId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
          Manual Job ID Trigger
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Paste Job UID here..."
              value={manualJobId}
              onChange={(e) => setManualJobId(e.target.value)}
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none transition-all font-mono"
            />
          </div>
          <button
            onClick={() => manualJobId && onAnalyze(manualJobId)}
            disabled={isAnalyzePending || !manualJobId}
            className="px-4 py-2.5 bg-foreground text-background text-xs font-bold rounded-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAnalyzePending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Screen
          </button>
        </div>
      </div>
    </div>
  );
}

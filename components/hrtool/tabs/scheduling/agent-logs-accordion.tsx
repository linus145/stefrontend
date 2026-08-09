'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TASK_OPTIONS } from './types';

interface AgentLogsDateAccordionProps {
  history: any[];
  isHistoryLoading: boolean;
}

export function AgentLogsDateAccordion({ history, isHistoryLoading }: AgentLogsDateAccordionProps) {
  // Group logs by calendar date (e.g. "June 1, 2026")
  const grouped: Record<string, any[]> = {};
  history.forEach((run) => {
    const dateKey = new Date(run.started_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(run);
  });

  // Sort date keys newest-first
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Auto-open the latest date group
  const [openDates, setOpenDates] = React.useState<Record<string, boolean>>(
    () => sortedDates.length > 0 ? { [sortedDates[0]]: true } : {}
  );

  const toggleDate = (date: string) =>
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));

  if (isHistoryLoading) {
    return <div className="py-8"><LocalLoader /></div>;
  }

  if (history.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-[3px] overflow-hidden shadow-sm">
        <CardContent className="py-10 text-center">
          <p className="text-xs text-slate-400 font-semibold tracking-wide">No executions logged yet. Scheduled agent tasks will report runs here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sortedDates.map((dateKey) => {
        const dayRuns = grouped[dateKey];
        const isOpen = !!openDates[dateKey];
        const successCount = dayRuns.filter((r) => r.status === 'success').length;
        const failCount = dayRuns.filter((r) => r.status === 'failed').length;
        const runningCount = dayRuns.filter((r) => r.status === 'running').length;

        return (
          <div
            key={dateKey}
            className="border border-slate-200 dark:border-slate-800 rounded-[3px] overflow-hidden bg-white dark:bg-[#121320] shadow-xs"
          >
            {/* Date header / toggle */}
            <button
              type="button"
              onClick={() => toggleDate(dateKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 dark:bg-[#151624]/40 hover:bg-slate-100/80 dark:hover:bg-[#1c1d30]/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {isOpen
                  ? <ChevronDown className="h-3.5 w-3.5 text-[#0a66c2]" />
                  : <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0a66c2] transition-colors" />}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{dateKey}</span>
                <span className="text-[10px] text-slate-400 font-medium">{dayRuns.length} run{dayRuns.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {successCount > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-[3px]">
                    {successCount} success
                  </Badge>
                )}
                {runningCount > 0 && (
                  <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-[3px] animate-pulse">
                    {runningCount} running
                  </Badge>
                )}
                {failCount > 0 && (
                  <Badge className="bg-red-500/10 text-red-600 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-[3px]">
                    {failCount} failed
                  </Badge>
                )}
              </div>
            </button>

            {/* Expanded logs list */}
            {isOpen && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dayRuns.map((run: any) => {
                  const matched = TASK_OPTIONS.find((o) => o.id === run.task_type);
                  const taskName = matched ? matched.label : run.task_type;
                  const timeStr = new Date(run.started_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const durationStr = run.duration ? `${run.duration.toFixed(1)}s` : '-';

                  return (
                    <div key={run.id} className="flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-3 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      {/* Status + Time column */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto sm:min-w-[140px]">
                        <Badge className={`font-bold text-[9px] px-2 py-0.5 rounded-[3px] border shadow-none ${
                          run.status === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          run.status === 'running' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 animate-pulse' :
                          'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {run.status?.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">{durationStr}</span>
                      </div>

                      {/* Task + command + actions */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{taskName}</p>
                        {run.command && (
                          <p className="text-[10px] text-[#0a66c2] dark:text-[#3b8fd9] font-medium mt-0.5 truncate">{run.command}</p>
                        )}
                        {run.status === 'failed' && run.error_message && (
                          <p className="text-[10px] text-red-500 font-medium mt-1">{run.error_message}</p>
                        )}
                        {run.actions_performed && run.actions_performed.length > 0 && run.status !== 'failed' && (
                          <div className="mt-1.5 space-y-0.5">
                            {run.actions_performed.map((act: any, i: number) => (
                              <div key={i} className="flex gap-1.5 text-[10px]">
                                <span className="font-bold text-[#0a66c2] dark:text-[#3b8fd9] shrink-0">{act.action || act.type}:</span>
                                <span className="text-slate-500 dark:text-slate-400 truncate">{act.result || act.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(!run.actions_performed || run.actions_performed.length === 0) && run.status !== 'failed' && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">No specific actions recorded.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

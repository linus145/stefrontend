'use client';

import React from 'react';
import { Clock, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PendingRequestsSummaryProps {
  pendingList: any[];
}

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export function PendingRequestsSummary({
  pendingList
}: PendingRequestsSummaryProps) {
  return (
    <Card className="flex-1 bg-white dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-900 rounded-sm flex flex-col justify-between shadow-md">
      <CardHeader className="border-b border-slate-100 dark:border-slate-900/50 pb-5">
        <CardTitle className="text-sm font-bold tracking-wider text-slate-550 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            My pending leave requests
          </span>
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 tracking-wider font-bold self-start sm:self-auto rounded-full px-2.5">
            Awaiting HR approval
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-4">
        <p className="text-sm text-slate-550 dark:text-slate-400">
          Your submitted leave requests are listed here. Once your HR manager reviews them, the status will update automatically.
        </p>

        <div className="space-y-3 my-2 flex-1 overflow-y-auto max-h-[190px] pr-2">
          {pendingList.map((req: any) => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-900/80 hover:border-slate-350 dark:hover:border-slate-800 transition-colors gap-3 animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{req.name}</span>
                  <Badge className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 tracking-wider font-bold px-2 py-0.5 rounded-full">
                    {toSentenceCase(req.type)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-550 dark:text-slate-450 mt-1.5 font-semibold">Duration: {req.duration}</p>
                {req.reason && <p className="text-xs italic text-slate-400 dark:text-slate-550 mt-1">Reason: &quot;{req.reason}&quot;</p>}
                {req.status?.toUpperCase() === 'REJECTED' && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1.5 animate-pulse">
                    Your leave is rejected
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                {req.status?.toUpperCase() === 'REJECTED' ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] px-3 py-1.5 font-bold rounded-sm tracking-wider border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5 flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[11px] px-3 py-1.5 font-bold rounded-sm tracking-wider border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 flex items-center gap-1"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {pendingList.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">All clear!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No pending leave requests at the moment.</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900/50 pt-4 flex justify-between items-center text-xs text-slate-450 dark:text-slate-500">
          <span>Leave status tracking</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider">
            <CalendarCheck className="w-3.5 h-3.5" />
            Auto-synced
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

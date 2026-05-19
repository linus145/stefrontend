'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeaveRequestLogsProps {
  leaveRequestsList: any[];
}

export function LeaveRequestLogs({
  leaveRequestsList
}: LeaveRequestLogsProps) {
  return (
    <Card className="bg-white dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-900 rounded-sm shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-900/50 pb-4">
        <CardTitle className="text-xs font-bold tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#0a66c2]" />
          Leave Request Logs & Status tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/40 text-[9px] tracking-wider font-bold text-slate-550 dark:text-slate-400">
                <th className="p-4">Leave Category</th>
                <th className="p-4">Schedule Frame</th>
                <th className="p-4 text-center">Duration</th>
                <th className="p-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
              {leaveRequestsList.map((req: any) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    <div>
                      <span>{req.leave_type_name}</span>
                      {req.reason && <p className="text-[9px] font-normal text-slate-500 dark:text-slate-400 truncate max-w-[160px] italic mt-0.5">"{req.reason}"</p>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {format(new Date(req.start_date), 'dd/MM/yyyy')} - {format(new Date(req.end_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-600 dark:text-slate-400 font-mono">
                    {req.total_days} days
                  </td>
                  <td className="p-4 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-2.5 py-0.5 font-bold rounded-sm capitalize tracking-wider",
                        req.status?.toUpperCase() === 'APPROVED'
                          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                          : req.status?.toUpperCase() === 'PENDING'
                            ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                            : "border-rose-500/30 text-rose-600 dark:text-rose-455 bg-rose-500/5"
                      )}
                    >
                      {req.status}
                    </Badge>
                  </td>
                </tr>
              ))}

              {leaveRequestsList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-550 italic">
                    No leave applications submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

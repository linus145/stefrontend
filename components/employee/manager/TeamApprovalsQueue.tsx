'use client';

import React from 'react';
import { CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TeamApprovalsQueueProps {
  teamLeaveApprovals: any[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
}

export function TeamApprovalsQueue({ teamLeaveApprovals, onApprove, onReject }: TeamApprovalsQueueProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl flex-1 flex flex-col overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" /> Team Approvals Queue
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-slate-400">
            Review and authorize pending leave requests from your subordinates.
          </CardDescription>
        </div>
        <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2]/15 border-none px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          {teamLeaveApprovals.length} Pending
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto max-h-[260px] space-y-3 scrollbar-thin">
        {teamLeaveApprovals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/80" />
            <span className="text-xs font-bold uppercase tracking-wider">All caught up!</span>
            <span className="text-[10px] max-w-xs font-medium text-slate-400">
              There are no pending subordinate leave requests requiring your review.
            </span>
          </div>
        ) : (
          teamLeaveApprovals.map((req: any) => (
            <div key={req.id} className="p-3.5 rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.employee_name}</span>
                  <Badge variant="outline" className="text-[8px] font-extrabold uppercase px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 rounded-full">
                    {req.leave_type_name}
                  </Badge>
                </div>
                <div className="text-[10px] font-semibold text-[#0a66c2]/80">
                  {format(new Date(req.start_date), 'MMM dd')} - {format(new Date(req.end_date), 'MMM dd')} ({req.total_days} {req.total_days === 1 ? 'day' : 'days'})
                </div>
                <div className="text-[10px] text-muted-foreground font-medium italic max-w-md line-clamp-1">
                  &ldquo;{req.reason}&rdquo;
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  onClick={() => onReject(req.id, req.employee_name)}
                  className="bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-500/20 shadow-sm font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm px-3 flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApprove(req.id, req.employee_name)}
                  className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 shadow-sm font-bold text-[10px] uppercase tracking-wider h-8 rounded-sm px-3 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

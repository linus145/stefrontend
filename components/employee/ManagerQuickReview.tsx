'use client';

import React from 'react';
import { CheckSquare, Check, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ManagerQuickReviewProps {
  approvalsList: any[];
  onApprove: (id: string, name: string, isReal: boolean) => void;
  onReject: (id: string, name: string, isReal: boolean) => void;
}

export function ManagerQuickReview({
  approvalsList,
  onApprove,
  onReject
}: ManagerQuickReviewProps) {
  return (
    <Card className="flex-1 bg-white dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-900 rounded-sm flex flex-col justify-between shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-900/50 pb-4">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-550 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-amber-500" />
            Manager Quick Review (One-Click Approvals)
          </span>
          <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold self-start sm:self-auto">
            Quick Check Action
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-4">
        <p className="text-xs text-slate-550 dark:text-slate-400">
          Instantly verify employee timecards and approve leave requests for your team directly from this panel using one-click confirmation checklists.
        </p>

        <div className="space-y-3 my-2 flex-1 overflow-y-auto max-h-[190px] pr-2">
          {approvalsList.map((req: any) => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-900/80 hover:border-slate-350 dark:hover:border-slate-800 transition-colors gap-3 animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.name}</span>
                  <Badge className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold px-1.5 py-0">
                    {req.type}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Duration: {req.duration}</p>
                <p className="text-[10px] italic text-slate-400 dark:text-slate-550 mt-0.5">Reason: "{req.reason}"</p>
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  onClick={() => onApprove(req.id, req.name, req.isReal !== false)}
                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(req.id, req.name, req.isReal !== false)}
                  className="h-7 px-2.5 border-rose-500/20 text-rose-600 dark:text-rose-500 hover:bg-rose-500/5 bg-rose-500/5 dark:bg-rose-950/10 font-bold text-[9px] uppercase tracking-wider rounded-sm cursor-pointer"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}

          {approvalsList.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">All Clear!</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">No pending approvals require your verification.</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900/50 pt-4 flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500">
          <span>Managerial Credentials Active</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            System Verified
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

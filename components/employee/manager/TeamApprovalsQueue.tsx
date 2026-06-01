'use client';

import React from 'react';
import { CheckCircle2, XCircle, ClipboardCheck, BanknoteIcon, ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PayrollApprovalAccess {
  allowed: boolean;
  stage: string;
}

interface TeamApprovalsQueueProps {
  teamLeaveApprovals: any[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;

  // Payroll approval props
  payrollApprovalsList?: any[];
  payrollSettings?: any;
  getPayrollApprovalAccess?: (run: any) => PayrollApprovalAccess;
  onApprovePayroll?: (id: string) => void;
  onRejectPayroll?: (id: string) => void;
  isApprovingPayroll?: boolean;
  isRejectingPayroll?: boolean;
  payrollConfirmId?: string | null;
  setPayrollConfirmId?: (id: string | null) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export function TeamApprovalsQueue({
  teamLeaveApprovals,
  onApprove,
  onReject,
  payrollApprovalsList = [],
  payrollSettings,
  getPayrollApprovalAccess,
  onApprovePayroll,
  onRejectPayroll,
  isApprovingPayroll,
  isRejectingPayroll,
  payrollConfirmId,
  setPayrollConfirmId,
}: TeamApprovalsQueueProps) {

  const totalPending = teamLeaveApprovals.length + payrollApprovalsList.length;

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl flex-1 flex flex-col overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-6 px-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" /> Approvals queue
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            Leave requests and payroll cycles awaiting your authorization.
          </CardDescription>
        </div>
        <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2]/15 border-none px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
          {totalPending} pending
        </Badge>
      </CardHeader>

      <CardContent className="p-6 flex-1 overflow-y-auto max-h-[380px] space-y-4 scrollbar-thin">

        {/* ─── LEAVE APPROVALS SECTION ─── */}
        {teamLeaveApprovals.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Leave requests</span>
            </div>
            {teamLeaveApprovals.map((req: any) => (
              <div
                key={req.id}
                className="p-4.5 rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-350 dark:hover:border-slate-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{req.employee_name}</span>
                    <Badge variant="outline" className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 rounded-full">
                      {toSentenceCase(req.leave_type_name)}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-[#0a66c2]/80">
                    {format(new Date(req.start_date), 'MMM dd')} - {format(new Date(req.end_date), 'MMM dd')} ({req.total_days} {req.total_days === 1 ? 'day' : 'days'})
                  </div>
                  <div className="text-xs text-muted-foreground font-medium italic max-w-md line-clamp-1 mt-0.5">
                    &ldquo;{req.reason}&rdquo;
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    onClick={() => onReject(req.id, req.employee_name)}
                    className="bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-500/20 shadow-sm font-bold text-xs uppercase tracking-wider h-8 rounded-sm px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApprove(req.id, req.employee_name)}
                    className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 shadow-sm font-bold text-xs uppercase tracking-wider h-8 rounded-sm px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── PAYROLL APPROVALS SECTION ─── */}
        {payrollApprovalsList.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <BanknoteIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Payroll cycles</span>
            </div>

            {payrollApprovalsList.map((run: any) => {
              const access = getPayrollApprovalAccess ? getPayrollApprovalAccess(run) : { allowed: false, stage: '' };
              const isConfirming = payrollConfirmId === run.id;
              const isActing = (isApprovingPayroll || isRejectingPayroll) && isConfirming;
              const monthName = MONTHS[(run.month ?? 1) - 1] || 'Unknown';

              return (
                <div
                  key={run.id}
                  className="rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 hover:border-[#0a66c2]/20 dark:hover:border-[#0a66c2]/30 transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {/* Payroll Run Header */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center shrink-0">
                        <BanknoteIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-880 dark:text-slate-200">
                          {monthName} {run.year} payroll
                        </div>
                        <div className="text-xs text-slate-400 font-semibold truncate mt-0.5">
                          {run.records_count || 0} employees • {access.stage ? `Awaiting ${toSentenceCase(access.stage)}` : 'Pending approval'}
                        </div>
                      </div>
                    </div>

                    {/* Stage badge */}
                    {access.allowed ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Your turn
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Waiting
                      </Badge>
                    )}
                  </div>

                  {/* Permission note */}
                  {!access.allowed && (
                    <div className="px-4 pb-3.5 text-xs text-amber-600 dark:text-amber-400/80 font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      Waiting on {access.stage ? toSentenceCase(access.stage) : 'designated approver'} — not assigned to you.
                    </div>
                  )}

                  {/* Switch-mode action row — only shown if user is allowed */}
                  {access.allowed && (
                    <div className="px-4 pb-4">
                      {!isConfirming ? (
                        /* Collapsed: single "Review & Act" trigger */
                        <button
                          onClick={() => setPayrollConfirmId && setPayrollConfirmId(run.id)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10 border border-[#0a66c2]/15 hover:border-[#0a66c2]/30 text-[#0a66c2] dark:text-[#3b8fd9] text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer group"
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            Review &amp; take action
                          </span>
                          {/* Switch-mode toggle visual */}
                          <span className="inline-flex items-center gap-1 bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-full px-2.5 py-0.5">
                            <span className="w-2 h-2 rounded-full bg-[#0a66c2] shadow shadow-blue-500/40"></span>
                            <span className="text-[10px] font-black text-[#0a66c2]">ACT</span>
                          </span>
                        </button>
                      ) : (
                        /* Expanded confirm panel — switch-mode style */
                        <div className="animate-in slide-in-from-top-1 fade-in duration-200 space-y-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Confirm action — {monthName} {run.year}
                            </span>
                            <button
                              onClick={() => setPayrollConfirmId && setPayrollConfirmId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer bg-transparent border-none outline-none"
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Switch-mode toggle buttons */}
                          <div className="flex items-stretch gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-sm border border-slate-200 dark:border-slate-700/60">
                            {/* Reject toggle */}
                            <button
                              disabled={isActing}
                              onClick={() => onRejectPayroll && onRejectPayroll(run.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[3px] bg-transparent hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-700 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {isRejectingPayroll && isConfirming ? 'Rejecting…' : 'Send back'}
                            </button>

                            {/* Divider */}
                            <div className="w-px bg-slate-200 dark:bg-slate-700/60 self-stretch my-0.5" />

                            {/* Approve toggle */}
                            <button
                              disabled={isActing}
                              onClick={() => onApprovePayroll && onApprovePayroll(run.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[3px] bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-blue-500/20"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isApprovingPayroll && isConfirming ? 'Approving…' : `Approve (${toSentenceCase(access.stage)})`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {totalPending === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/80" />
            <span className="text-xs font-bold uppercase tracking-wider">All caught up!</span>
            <span className="text-[10px] max-w-xs font-medium text-slate-400">
              No pending leave requests or payroll cycles require your review.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { 
  ShieldCheck, Calendar, Check, X, ShieldAlert, ArrowRight, Download 
} from 'lucide-react';

export function PayrollApprovalsClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedRun, setSelectedRun] = React.useState<any | null>(null);

  const { data: approvalsRes, isLoading } = useQuery({
    queryKey: ['payroll-approvals'],
    queryFn: () => hrPayrollService.getApprovalsQueue(),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  const { data: recordsRes, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['payroll-records', selectedRun?.id],
    queryFn: () => hrPayrollService.getPayrollRecords(selectedRun.id),
    enabled: !!selectedRun,
  });

  const getCurrencySymbol = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'د.إ ';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(settingsRes?.data?.currency);
  const runRecords = recordsRes?.data || [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.approvePayroll(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      
      const isL1DoneOnly = res.message?.includes('L1') || res.message?.includes('recorded');
      if (isL1DoneOnly && res.payroll) {
        toast.success(res.message || 'L1 (Finance Manager) approval recorded successfully!');
        setSelectedRun(res.payroll);
      } else {
        setSelectedRun(null);
        toast.success('Payroll cycle approved and published successfully!');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to approve payroll cycle.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.rejectPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      setSelectedRun(null);
      toast.success('Payroll cycle sent back for correction.');
    },
    onError: () => {
      toast.error('Failed to reject payroll cycle.');
    }
  });

  const getMonthName = (m: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[m - 1] || 'Unknown';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-255 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'PROCESSED': return 'bg-amber-50 text-amber-700 border-amber-255 dark:bg-amber-500/10 dark:text-amber-400';
      case 'PAID': return 'bg-blue-50 text-blue-700 border-blue-255 dark:bg-blue-500/10 dark:text-blue-400';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-255 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400';
    }
  };

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const list = approvalsRes?.data || [];

  const getApprovalStatusAndCheck = () => {
    if (!settingsRes?.data || !selectedRun) return { allowed: true, message: '', currentStage: '' };
    
    const config = settingsRes.data;
    
    if (config.finance_approval_required && !selectedRun.finance_approved) {
      const allowed = user?.id === config.finance_manager;
      return {
        allowed,
        message: allowed 
          ? 'You are authorized to approve this cycle as Finance Manager (Level 1 Approval).'
          : `Level 1 Approval pending from designated Finance Manager: ${config.finance_manager_name || 'Unassigned'}.`,
        currentStage: 'Finance Manager Approval'
      };
    }
    
    if (config.director_approval_required && !selectedRun.director_approved) {
      const allowed = user?.id === config.director;
      return {
        allowed,
        message: allowed
          ? 'You are authorized to approve this cycle as Director (Level 2 / Final Approval).'
          : `Level 2 / Final Approval pending from designated Director: ${config.director_name || 'Unassigned'}.`,
        currentStage: 'Director Approval'
      };
    }
    
    return { allowed: true, message: '', currentStage: '' };
  };

  const approvalCheck = getApprovalStatusAndCheck();

  // Drilldown audit mode
  if (selectedRun) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Drilldown Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-[#121320]/60 p-4 rounded-sm border border-slate-200/50 dark:border-slate-800/50">
          <div>
            <button 
              onClick={() => setSelectedRun(null)}
              data-agent="payroll-approvals-back-btn"
              className="text-xs font-bold text-[#0a66c2] dark:text-[#3b8fd9] hover:underline mb-1 flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
            >
              ← Back to approvals queue
            </button>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              Payroll drill sheet: {getMonthName(selectedRun.month)} {selectedRun.year}
              <Badge className={`${getStatusBadgeColor(selectedRun.status)} font-bold text-[9px] px-2 py-0.5 rounded-sm border`}>
                {toSentenceCase(selectedRun.status)}
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Audit calculated records breakdown for all active startup employees before authorizing disbursement.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => rejectMutation.mutate(selectedRun.id)}
              disabled={rejectMutation.isPending}
              data-agent="payroll-run-reject-btn"
              className="border border-red-500/20 bg-transparent hover:bg-red-500/5 text-red-600 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer transition-all duration-300"
            >
              Reject run
            </Button>
            <Button 
              onClick={() => approveMutation.mutate(selectedRun.id)}
              disabled={approveMutation.isPending || !approvalCheck.allowed}
              data-agent="payroll-run-approve-btn"
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" /> 
              {approvalCheck.currentStage ? `Approve (${approvalCheck.currentStage})` : 'Approve & issue payslips'}
            </Button>
          </div>
        </div>

        {approvalCheck.message && (
          <div className={`p-4 rounded-sm border text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
            approvalCheck.allowed 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-amber-50 text-amber-800 border-amber-250 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
          }`}>
            <ShieldAlert className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>{approvalCheck.message}</span>
          </div>
        )}

        {/* Drilldown Records Table */}
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee details</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Gross salary</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Bonus</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Overtime</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Reimbursement</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Deductions (tax, pf)</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Net payout</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Deduction status</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRecords ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td colSpan={9} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                    </tr>
                  ))
                ) : runRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No computed records in this run.</td>
                  </tr>
                ) : (
                  runRecords.map((rec: any) => (
                    <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center">
                            {rec.employee_detail?.first_name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {rec.employee_detail?.first_name} {rec.employee_detail?.last_name}
                              <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                                ({rec.employee_detail?.employee_id || 'No ID'})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {rec.employee_detail?.designation_detail?.title || 'Team Member'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-bold">{currencySymbol}{parseFloat(rec.gross_salary || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-bold">{currencySymbol}{parseFloat(rec.bonus_amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-semibold">{currencySymbol}{parseFloat(rec.overtime_amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-semibold">{currencySymbol}{parseFloat(rec.reimbursement_amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-red-500/90 font-bold">-{currencySymbol}{parseFloat(rec.deductions || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">{currencySymbol}{parseFloat(rec.net_salary || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusBadgeColor(rec.status)} font-bold text-[9px] px-2 py-0.5 rounded-sm`}>
                          {toSentenceCase(rec.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] text-slate-400 font-semibold italic">Awaiting cycle authorization</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Queue List Table Mode
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Executive payroll approvals</h2>
      </div>

      {isLoading ? (
        <LocalLoader />
      ) : list.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-[#121320] border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center rounded-sm">
          <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500 opacity-60 mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-250">No cycles awaiting approval</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All generated payroll runs are either fully disbursed or in drafting modes.</p>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Cycle Period</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Team Members</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Processed At</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Status</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((run: any, index: number) => (
                  <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {getMonthName(run.month)} {run.year}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Contains {run.records_count || '0'} payroll records computed
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {run.processed_at ? new Date(run.processed_at).toLocaleDateString() : 'Draft mode'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1.5 flex flex-col items-start justify-start">
                        <Badge className={`${getStatusBadgeColor(run.status)} font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none`}>
                          {toSentenceCase(run.status)}
                        </Badge>
                        {settingsRes?.data?.finance_approval_required && !run.finance_approved && (
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400/90 whitespace-nowrap">
                            Awaiting Finance Manager: {settingsRes.data.finance_manager_name || 'Unassigned'}
                          </div>
                        )}
                        {((settingsRes?.data?.finance_approval_required && run.finance_approved) || !settingsRes?.data?.finance_approval_required) && settingsRes?.data?.director_approval_required && !run.director_approved && (
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400/90 whitespace-nowrap">
                            Awaiting Director: {settingsRes.data.director_name || 'Unassigned'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        onClick={() => setSelectedRun(run)}
                        data-agent={`payroll-approvals-review-sheet-btn${index === 0 ? "" : `-${index}`}`}
                        className="border border-[#0a66c2]/20 hover:bg-[#0a66c2]/5 text-[#0a66c2] dark:text-[#3b8fd9] dark:hover:bg-[#0a66c2]/10 bg-transparent rounded-sm font-bold text-xs h-7.5 px-3 cursor-pointer transition-all duration-300 inline-flex items-center gap-1"
                      >
                        Review sheet <ArrowRight className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}

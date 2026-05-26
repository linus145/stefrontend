'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { LocalLoader } from '@/components/ui/local-loader';

export function ExpenseClaims() {
  const queryClient = useQueryClient();

  const { data: reimbursements, isLoading: isLoadingReimbursements } = useQuery({
    queryKey: ['payroll-reimbursements'],
    queryFn: () => hrPayrollService.getReimbursements(),
  });

  const approveReimbursementMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.approveReimbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-reimbursements'] });
      toast.success('Expense claim approved successfully!');
    },
    onError: () => {
      toast.error('Failed to approve reimbursement request.');
    }
  });

  const rejectReimbursementMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.rejectReimbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-reimbursements'] });
      toast.success('Expense claim rejected successfully.');
    },
    onError: () => {
      toast.error('Failed to reject reimbursement request.');
    }
  });

  const onApproveClaim = (id: string) => approveReimbursementMutation.mutate(id);
  const onRejectClaim = (id: string) => rejectReimbursementMutation.mutate(id);

  const { data: settingsRes } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  if (isLoadingReimbursements) {
    return <LocalLoader />;
  }

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

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-medium">Reimbursement expense claims</h3>
        <p className="text-xs text-slate-500 font-medium">Employee expense claims requesting HR validation to add to next month payroll payout.</p>
      </div>

      <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Category</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Claim amount</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Description</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Submitted date</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Approval status</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Verification action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingReimbursements ? (
                [1, 2].map(i => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={7} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                  </tr>
                ))
              ) : reimbursements?.data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No expense reimbursement claims registered.</td>
                </tr>
              ) : (
                reimbursements?.data?.results?.map((claim: any) => (
                  <tr key={claim.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{claim.employee_name} {claim.employee_last_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[9px] rounded-sm shadow-none border">
                        {toSentenceCase(claim.category)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-extrabold text-slate-900 dark:text-white">{currencySymbol}{parseFloat(claim.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{claim.description || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${getStatusBadgeColor(claim.approval_status)} font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none`}>
                        {toSentenceCase(claim.approval_status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {claim.approval_status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            onClick={() => onRejectClaim(claim.id)}
                            data-agent={`payroll-claim-reject-btn-${claim.id}`}
                            className="w-7 h-7 p-0 rounded-full border border-red-500/20 bg-transparent text-red-500 hover:bg-red-500/5 cursor-pointer flex items-center justify-center"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => onApproveClaim(claim.id)}
                            data-agent={`payroll-claim-approve-btn-${claim.id}`}
                            className="w-7 h-7 p-0 rounded-full border border-emerald-500/20 bg-transparent text-emerald-500 hover:bg-emerald-500/5 cursor-pointer flex items-center justify-center"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Processed</span>
                      )}
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

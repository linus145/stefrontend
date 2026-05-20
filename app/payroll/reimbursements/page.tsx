'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { LocalLoader } from '@/components/ui/local-loader';
import { ExpenseClaims } from '@/components/hrtool/tabs/payroll/expense-claims';

export default function ReimbursementsPage() {
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

  if (isLoadingReimbursements) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Expense Claims & Reimbursements</h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Audit uploaded employee business receipts, coordinate corporate expense logs, and dispatch final payouts.</p>
      </div>

      <ExpenseClaims
        reimbursements={reimbursements}
        isLoadingReimbursements={isLoadingReimbursements}
        onApproveClaim={(id) => approveReimbursementMutation.mutate(id)}
        onRejectClaim={(id) => rejectReimbursementMutation.mutate(id)}
      />
    </div>
  );
}

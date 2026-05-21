'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { LocalLoader } from '@/components/ui/local-loader';
import { PayrollRuns } from '@/components/hrtool/tabs/payroll/payroll-runs';

import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function PayrollRunsPage() {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [runRecords, setRunRecords] = useState<any[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Modals / Forms state
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);
  const [newRunMonth, setNewRunMonth] = useState('5');
  const [newRunYear, setNewRunYear] = useState('2026');
  const [page, setPage] = useState(1);

  // Queries
  const { data: payrolls, isLoading: isLoadingPayrolls } = useQuery({
    queryKey: ['payrolls', page],
    queryFn: () => hrPayrollService.getPayrolls({ page }),
  });

  // Fetch records when a payroll run is clicked
  useEffect(() => {
    if (selectedRun) {
      setIsLoadingRecords(true);
      hrPayrollService.getPayrollRecords(selectedRun.id)
        .then(res => {
          if (res.data) {
            setRunRecords(res.data);
          }
        })
        .catch(() => {
          toast.error("Failed to load payroll details");
        })
        .finally(() => {
          setIsLoadingRecords(false);
        });
    }
  }, [selectedRun]);

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) => 
      hrPayrollService.generatePayroll(data.month, data.year),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
      setIsNewRunOpen(false);
      toast.success(res.message || 'Payroll generated successfully in Draft mode.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to generate payroll run.');
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.approvePayroll(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics'] });
      setSelectedRun(null);
      toast.success(res.message || 'Payroll approved, finalized and paid successfully!');
    },
    onError: () => {
      toast.error('Failed to approve payroll cycle.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.rejectPayroll(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics'] });
      setSelectedRun(null);
      toast.success(res.message || 'Payroll cycle rejected back to draft.');
    },
    onError: () => {
      toast.error('Failed to reject payroll cycle.');
    }
  });

  const rerunMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.rerunPayroll(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
      setSelectedRun(null);
      toast.success(res.message || 'Payroll recalculation started successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to rerun payroll.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.deletePayroll(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
      setSelectedRun(null);
      toast.success('Payroll cycle permanently hard deleted.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete payroll.');
    }
  });

  if (isLoadingPayrolls) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Payroll Runs & Payouts</h2>
        </div>
        {!selectedRun && (
          <Button
            onClick={() => setIsNewRunOpen(true)}
            data-agent="payroll-start-run-btn"
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-md text-xs font-bold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 h-9 shrink-0 self-start sm:self-center"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Start Payroll Run
          </Button>
        )}
      </div>

      <PayrollRuns
        payrolls={payrolls}
        isLoadingPayrolls={isLoadingPayrolls}
        selectedRun={selectedRun}
        setSelectedRun={setSelectedRun}
        runRecords={runRecords}
        isLoadingRecords={isLoadingRecords}
        onApproveRun={(id) => approveMutation.mutate(id)}
        onRejectRun={(id) => rejectMutation.mutate(id)}
        approvePending={approveMutation.isPending}
        rejectPending={rejectMutation.isPending}
        onRerunRun={(id) => rerunMutation.mutate(id)}
        onDeleteRun={(id) => deleteMutation.mutate(id)}
        rerunPending={rerunMutation.isPending}
        deletePending={deleteMutation.isPending}
        isNewRunOpen={isNewRunOpen}
        setIsNewRunOpen={setIsNewRunOpen}
        newRunMonth={newRunMonth}
        setNewRunMonth={setNewRunMonth}
        newRunYear={newRunYear}
        setNewRunYear={setNewRunYear}
        onCompileSubmit={() => generateMutation.mutate({ month: parseInt(newRunMonth), year: parseInt(newRunYear) })}
        compilePending={generateMutation.isPending}
        onClaimTabRedirect={() => { window.location.href = '/payroll/reimbursements'; }}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}

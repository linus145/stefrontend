'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService, hrEmployeeService } from '@/services/hr';
import { LogsMatrixTable } from '../components/logs-matrix-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function LogsView() {
  const queryClient = useQueryClient();

  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => hrPerformanceService.getReviews(),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 100 }),
  });
  const employees = employeesData?.data?.results || [];

  const { data: cyclesData } = useQuery({
    queryKey: ['performance-cycles'],
    queryFn: () => hrPerformanceService.getCycles(),
  });
  const cycles = cyclesData?.data?.results || [];

  const calculateMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await hrPerformanceService.calculateScore(reviewId);
      return res.data || res;
    },
    onSuccess: () => {
      toast.success('Performance score calculated successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['performance-analytics'] });
    },
    onError: () => {
      toast.error('Failed to calculate performance score.');
    }
  });

  const launchAppraisalMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createReview(data),
    onSuccess: () => {
      toast.success('Appraisal launched successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setIsLaunchOpen(false);
      setEmployeeId('');
      setReviewerId('');
      setCycleId('');
      setPeriodStart('');
      setPeriodEnd('');
    },
    onError: () => {
      toast.error('Failed to launch appraisal.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => hrPerformanceService.deleteReview(reviewId),
    onSuccess: () => {
      toast.success('Appraisal deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['performance-analytics'] });
    },
    onError: () => {
      toast.error('Failed to delete appraisal.');
    }
  });

  const handleDeleteReview = (id: string) => {
    toast('Are you sure you want to permanently delete this appraisal?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleLaunchAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !reviewerId || !periodStart || !periodEnd) {
      toast.error('Please fill in all required fields.');
      return;
    }
    launchAppraisalMutation.mutate({
      employee: employeeId,
      reviewer: reviewerId,
      review_period_start: periodStart,
      review_period_end: periodEnd,
      cycle: cycleId || null,
      status: 'DRAFT',
    });
  };

  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setCycleId(cid);
    if (cid) {
      const matched = cycles.find((c: any) => c.id === cid);
      if (matched) {
        setPeriodStart(matched.start_date);
        setPeriodEnd(matched.due_date);
      }
    }
  };

  const reviews = reviewsData?.data?.results || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Logs</h2>
        </div>
        <Button
          onClick={() => setIsLaunchOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm"
          data-agent="performance-start-appraisal-btn"
        >
          <Plus className="mr-2 h-4 w-4" /> Start Appraisal
        </Button>
      </div>

      <div className="w-full">
        <LogsMatrixTable
          reviews={reviews}
          isLoading={reviewsLoading}
          onCalculate={(id) => calculateMutation.mutate(id)}
          isCalculating={calculateMutation.isPending}
          onDelete={handleDeleteReview}
        />
      </div>

      {/* Launch Appraisal Dialog */}
      <Dialog open={isLaunchOpen} onOpenChange={setIsLaunchOpen}>
        <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Launch New Appraisal</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Initiate a performance evaluation for an employee.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLaunchAppraisal} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="targetEmployee">
                Reviewee Employee *
              </label>
              <select
                id="targetEmployee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
                data-agent="launch-appraisal-employee-select"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.designation?.title || 'No Title'})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="appraisalReviewer">
                Assigned Reviewer *
              </label>
              <select
                id="appraisalReviewer"
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
                data-agent="launch-appraisal-reviewer-select"
              >
                <option value="">Select Reviewer...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.designation?.title || 'No Title'})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="appraisalCycle">
                Performance Cycle
              </label>
              <select
                id="appraisalCycle"
                value={cycleId}
                onChange={handleCycleChange}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-agent="launch-appraisal-cycle-select"
              >
                <option value="">No Cycle (Ad-hoc review)</option>
                {cycles.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="revPeriodStart">
                  Period Start *
                </label>
                <Input
                  id="revPeriodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="launch-appraisal-start-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="revPeriodEnd">
                  Period End *
                </label>
                <Input
                  id="revPeriodEnd"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="launch-appraisal-end-input"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLaunchOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="launch-appraisal-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={launchAppraisalMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="launch-appraisal-submit-btn"
              >
                {launchAppraisalMutation.isPending ? 'Launching...' : 'Launch Appraisal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

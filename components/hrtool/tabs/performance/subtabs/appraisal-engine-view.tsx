'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService, hrEmployeeService } from '@/services/hr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Trash2, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function AppraisalEngineView() {
  const queryClient = useQueryClient();

  // Create Cycle Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isActive, setIsActive] = useState('true');

  // Launch Appraisal Dialog state
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  // Fetch Cycles
  const { data: cyclesData, isLoading } = useQuery({
    queryKey: ['performance-cycles'],
    queryFn: () => hrPerformanceService.getCycles(),
  });
  const cycles = cyclesData?.data?.results || [];

  // Fetch Employees for appraisal selection
  const { data: employeesData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 100 }),
  });
  const employees = employeesData?.data?.results || [];

  // Mutations
  const createCycleMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createCycle(data),
    onSuccess: () => {
      toast.success('Performance cycle created successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-cycles'] });
      setIsCreateOpen(false);
      setCycleName('');
      setStartDate('');
      setDueDate('');
      setIsActive('true');
    },
    onError: () => {
      toast.error('Failed to create cycle.');
    },
  });

  const deleteCycleMutation = useMutation({
    mutationFn: (id: string) => hrPerformanceService.deleteCycle(id),
    onSuccess: () => {
      toast.success('Performance cycle deleted.');
      queryClient.invalidateQueries({ queryKey: ['performance-cycles'] });
    },
    onError: () => {
      toast.error('Failed to delete cycle.');
    },
  });

  const launchAppraisalMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createReview(data),
    onSuccess: () => {
      toast.success('Appraisal launched successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setIsLaunchOpen(false);
      setEmployeeId('');
      setReviewerId('');
      setPeriodStart('');
      setPeriodEnd('');
    },
    onError: () => {
      toast.error('Failed to launch appraisal.');
    },
  });

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName || !startDate || !dueDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    createCycleMutation.mutate({
      name: cycleName,
      start_date: startDate,
      due_date: dueDate,
      is_active: isActive === 'true',
    });
  };

  const handleLaunchAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !reviewerId || !periodStart || !periodEnd || !selectedCycle) {
      toast.error('Please fill in all required fields.');
      return;
    }
    launchAppraisalMutation.mutate({
      employee: employeeId,
      reviewer: reviewerId,
      review_period_start: periodStart,
      review_period_end: periodEnd,
      cycle: selectedCycle.id,
      status: 'DRAFT',
    });
  };

  const openLaunchDialog = (cycle: any) => {
    setSelectedCycle(cycle);
    setPeriodStart(cycle.start_date);
    setPeriodEnd(cycle.due_date);
    setIsLaunchOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appraisal Engine</h2>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm"
          data-agent="performance-new-cycle-btn"
        >
          <Plus className="mr-2 h-4 w-4" /> New Cycle
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50 overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[9px] text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
              <tr>
                <th className="px-4 py-2 font-bold">Cycle Name</th>
                <th className="px-4 py-2 font-bold">Start Date</th>
                <th className="px-4 py-2 font-bold">Due Date</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Loading cycles...
                  </td>
                </tr>
              ) : cycles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No performance cycles defined.
                  </td>
                </tr>
              ) : (
                cycles.map((cycle: any) => (
                  <tr key={cycle.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
                        <span className="font-semibold text-xs text-foreground">{cycle.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[11px] font-medium">{cycle.start_date}</td>
                    <td className="px-4 py-2 text-[11px] font-medium">{cycle.due_date}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={`text-[8px] px-1.5 py-0 uppercase font-bold ${cycle.is_active ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' : 'border-muted text-muted-foreground'
                        }`}>
                        {cycle.is_active ? 'ACTIVE' : 'CLOSED'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => openLaunchDialog(cycle)}
                          className="h-7 text-[9px] px-2 font-bold uppercase rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/10 cursor-pointer"
                          data-agent={`performance-launch-appraisal-btn-${cycle.id}`}
                        >
                          <Rocket className="mr-1 h-2.5 w-2.5" /> Launch Appraisal
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast('Delete this appraisal cycle?', {
                              description: 'This action cannot be undone.',
                              action: {
                                label: 'Delete',
                                onClick: () => deleteCycleMutation.mutate(cycle.id),
                              },
                              cancel: {
                                label: 'Cancel',
                                onClick: () => {},
                              },
                            });
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 h-7 w-7 rounded-sm flex items-center justify-center"
                          data-agent={`performance-delete-cycle-btn-${cycle.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Cycle Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Create Appraisal Cycle</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define evaluation windows and milestones.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCycle} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="cycleName">
                Cycle Name *
              </label>
              <Input
                id="cycleName"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                placeholder="e.g. Q2 2026 Mid-Year Appraisal"
                className="rounded-sm bg-background border-input"
                required
                data-agent="new-cycle-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="cycleStart">
                  Start Date *
                </label>
                <Input
                  id="cycleStart"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="new-cycle-start-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="cycleDue">
                  Due Date *
                </label>
                <Input
                  id="cycleDue"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="new-cycle-due-input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="cycleActive">
                Status
              </label>
              <select
                id="cycleActive"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-agent="new-cycle-status-select"
              >
                <option value="true">Active (Review period open)</option>
                <option value="false">Closed / Inactive</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="new-cycle-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCycleMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="new-cycle-submit-btn"
              >
                {createCycleMutation.isPending ? 'Creating...' : 'Create Cycle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Launch Appraisal Dialog */}
      <Dialog open={isLaunchOpen} onOpenChange={setIsLaunchOpen}>
        <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Launch Appraisal</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Initiate a performance evaluation under cycle: {selectedCycle?.name}
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
                data-agent="launch-employee-select"
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
                data-agent="launch-reviewer-select"
              >
                <option value="">Select Reviewer...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.designation?.title || 'No Title'})
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
                  data-agent="launch-period-start-input"
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
                  data-agent="launch-period-end-input"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLaunchOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="launch-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={launchAppraisalMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="launch-submit-btn"
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

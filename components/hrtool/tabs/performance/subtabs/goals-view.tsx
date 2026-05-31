'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService, hrEmployeeService } from '@/services/hr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, User, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function GoalsView() {
  const queryClient = useQueryClient();

  // State for Create Goal Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kpiId, setKpiId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [progress, setProgress] = useState(0);

  // State for Update Progress Dialog
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState('PENDING');
  const [updateProgress, setUpdateProgress] = useState(0);

  // Fetch Goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['performance-goals'],
    queryFn: () => hrPerformanceService.getGoals(),
  });
  const goals = goalsData?.data?.results || [];

  // Fetch Employees for assignment dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 100 }),
  });
  const employees = employeesData?.data?.results || [];

  // Fetch KPIs for dropdown
  const { data: kpisData } = useQuery({
    queryKey: ['performance-kpis'],
    queryFn: () => hrPerformanceService.getKPIs(),
  });
  const kpis = kpisData?.data?.results || [];

  // Create Goal Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createGoal(data),
    onSuccess: () => {
      toast.success('Goal assigned successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      setIsCreateOpen(false);
      setEmployeeId('');
      setTitle('');
      setDescription('');
      setKpiId('');
      setStartDate('');
      setDueDate('');
      setStatus('PENDING');
      setProgress(0);
    },
    onError: () => {
      toast.error('Failed to assign goal.');
    },
  });

  // Update Goal Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrPerformanceService.updateGoal(id, data),
    onSuccess: () => {
      toast.success('Goal progress updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      setIsUpdateOpen(false);
      setSelectedGoal(null);
    },
    onError: () => {
      toast.error('Failed to update goal progress.');
    },
  });

  // Delete Goal Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrPerformanceService.deleteGoal(id),
    onSuccess: () => {
      toast.success('Goal deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
    },
    onError: () => {
      toast.error('Failed to delete goal.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !title || !startDate || !dueDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    createMutation.mutate({
      employee: employeeId,
      title,
      description,
      kpi: kpiId || null,
      start_date: startDate,
      due_date: dueDate,
      status,
      progress_percentage: progress,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    updateMutation.mutate({
      id: selectedGoal.id,
      data: {
        status: updateStatus,
        progress_percentage: updateProgress,
      },
    });
  };

  const openUpdateDialog = (goal: any) => {
    setSelectedGoal(goal);
    setUpdateStatus(goal.status);
    setUpdateProgress(goal.progress_percentage);
    setIsUpdateOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Goals</h2>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm"
          data-agent="performance-assign-goal-btn"
        >
          <Plus className="mr-2 h-4 w-4" /> Assign Goal
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50 overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[9px] text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
              <tr>
                <th className="px-4 py-2 font-bold">Employee</th>
                <th className="px-4 py-2 font-bold">Goal Title</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold w-1/4">Progress</th>
                <th className="px-4 py-2 font-bold">Due Date</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Loading goals...
                  </td>
                </tr>
              ) : goals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No active goals found.
                  </td>
                </tr>
              ) : (
                goals.map((goal: any) => (
                  <tr key={goal.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="font-semibold text-xs text-foreground">
                          {goal.employee_detail ? `${goal.employee_detail.first_name} ${goal.employee_detail.last_name}` : 'Unknown Employee'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Target className="h-2.5 w-2.5 text-muted-foreground" />
                        {goal.title}
                      </div>
                      {goal.kpi_detail && (
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          KPI: {goal.kpi_detail.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={`text-[8px] px-1.5 py-0 uppercase font-bold ${goal.status === 'COMPLETED' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' :
                        goal.status === 'IN_PROGRESS' ? 'border-blue-500/20 text-blue-600 bg-blue-500/5' :
                          'border-amber-500/20 text-amber-600 bg-amber-500/5'
                        }`}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                          <span>{goal.progress_percentage}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-sm overflow-hidden flex">
                          <div
                            className="bg-blue-500 transition-all duration-1000"
                            style={{ width: `${goal.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[11px] font-medium">
                      {goal.due_date}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openUpdateDialog(goal)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-7 w-7 rounded-sm flex items-center justify-center"
                          data-agent={`performance-edit-goal-btn-${goal.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast('Delete this strategic goal?', {
                              description: 'This action cannot be undone.',
                              action: {
                                label: 'Delete',
                                onClick: () => deleteMutation.mutate(goal.id),
                              },
                              cancel: {
                                label: 'Cancel',
                                onClick: () => {},
                              },
                            });
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 h-7 w-7 rounded-sm flex items-center justify-center"
                          data-agent={`performance-delete-goal-btn-${goal.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
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

      {/* Assign Goal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Assign New Goal</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define and link a goal to an employee.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="employee">
                Assignee Employee *
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
                data-agent="assign-employee-select"
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalTitle">
                Goal Title *
              </label>
              <Input
                id="goalTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement performance subtabs"
                className="rounded-sm bg-background border-input"
                required
                data-agent="assign-goal-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalDesc">
                Description
              </label>
              <Textarea
                id="goalDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key outcomes, expectations, and metrics..."
                className="rounded-sm bg-background border-input min-h-[60px]"
                data-agent="assign-goal-desc-textarea"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalKpi">
                Associated KPI
              </label>
              <select
                id="goalKpi"
                value={kpiId}
                onChange={(e) => setKpiId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-agent="assign-goal-kpi-select"
              >
                <option value="">No Associated KPI</option>
                {kpis.map((kpi: any) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.name} ({kpi.target_value} {kpi.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="startDate">
                  Start Date *
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="assign-goal-start-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="dueDate">
                  Due Date *
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-sm bg-background border-input"
                  required
                  data-agent="assign-goal-due-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalStatus">
                  Initial Status
                </label>
                <select
                  id="goalStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  data-agent="assign-goal-status-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalProgress">
                  Progress ({progress}%)
                </label>
                <Input
                  id="goalProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="rounded-sm bg-background border-input"
                  data-agent="assign-goal-progress-input"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="assign-goal-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="assign-goal-submit-btn"
              >
                {createMutation.isPending ? 'Assigning...' : 'Assign Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="w-full max-w-[400px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Update Progress</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify current status and completion percentage of: <span className="font-semibold text-slate-750">"{selectedGoal?.title}"</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="updateStatus">
                Goal Status
              </label>
              <select
                id="updateStatus"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-agent="update-goal-status-select"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="updateProgress">
                Progress Percentage ({updateProgress}%)
              </label>
              <Input
                id="updateProgress"
                type="number"
                min="0"
                max="100"
                value={updateProgress}
                onChange={(e) => setUpdateProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="rounded-sm bg-background border-input"
                data-agent="update-goal-progress-input"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="update-goal-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="update-goal-submit-btn"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Updates'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AssignGoalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamSubordinates: any[];
  selectedAssignee: string;
  setSelectedAssignee: (val: string) => void;
  goalTitle: string;
  setGoalTitle: (val: string) => void;
  goalDesc: string;
  setGoalDesc: (val: string) => void;
  goalStartDate: string;
  setGoalStartDate: (val: string) => void;
  goalDueDate: string;
  setGoalDueDate: (val: string) => void;
  goalStatus: string;
  setGoalStatus: (val: string) => void;
  goalProgress: number;
  setGoalProgress: (val: number) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssignGoalModal({
  isOpen,
  onOpenChange,
  teamSubordinates,
  selectedAssignee,
  setSelectedAssignee,
  goalTitle,
  setGoalTitle,
  goalDesc,
  setGoalDesc,
  goalStartDate,
  setGoalStartDate,
  goalDueDate,
  setGoalDueDate,
  goalStatus,
  setGoalStatus,
  goalProgress,
  setGoalProgress,
  isPending,
  onSubmit,
}: AssignGoalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-border/50 rounded-sm shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Assign New Goal</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Define and link a goal to an employee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="employee">
              Assignee Employee *
            </label>
            <select
              id="employee"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-slate-800 dark:text-slate-200"
              required
              data-agent="assign-employee-select"
            >
              <option value="">Select Employee...</option>
              {teamSubordinates.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
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
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Implement performance subtabs"
              className="rounded-sm bg-background border-input h-10"
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
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              placeholder="Key outcomes, expectations, and metrics..."
              className="rounded-sm bg-background border-input min-h-[60px]"
              data-agent="assign-goal-desc-textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="startDate">
                Start Date *
              </label>
              <Input
                id="startDate"
                type="date"
                value={goalStartDate}
                onChange={(e) => setGoalStartDate(e.target.value)}
                className="rounded-sm bg-background border-input h-10"
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
                value={goalDueDate}
                onChange={(e) => setGoalDueDate(e.target.value)}
                className="rounded-sm bg-background border-input h-10"
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
                value={goalStatus}
                onChange={(e) => setGoalStatus(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-slate-800 dark:text-slate-200"
                data-agent="assign-goal-status-select"
              >
                <option value="PENDING">Pending (To Do)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed (Done)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="goalProgress">
                Progress ({goalProgress}%)
              </label>
              <Input
                id="goalProgress"
                type="number"
                min="0"
                max="100"
                value={goalProgress}
                onChange={(e) => setGoalProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="rounded-sm bg-background border-input h-10"
                data-agent="assign-goal-progress-input"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm border-input hover:bg-slate-50 text-slate-700 h-10"
              data-agent="assign-goal-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md h-10 font-bold"
              data-agent="assign-goal-submit-btn"
            >
              {isPending ? 'Assigning...' : 'Assign Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

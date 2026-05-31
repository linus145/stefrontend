'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UpdateGoalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGoal: any;
  updateGoalStatus: string;
  setUpdateGoalStatus: (status: string) => void;
  updateGoalProgress: number;
  setUpdateGoalProgress: (progress: number) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function UpdateGoalModal({
  isOpen,
  onOpenChange,
  selectedGoal,
  updateGoalStatus,
  setUpdateGoalStatus,
  updateGoalProgress,
  setUpdateGoalProgress,
  isPending,
  onSubmit,
}: UpdateGoalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[400px] bg-white dark:bg-slate-900 border border-border/50 rounded-sm shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Update Goal Progress</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Modify current status and completion percentage of: <span className="font-semibold text-slate-750">"{selectedGoal?.title}"</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="updateStatus">
              Goal Status
            </label>
            <select
              id="updateStatus"
              value={updateGoalStatus}
              onChange={(e) => {
                const newStatus = e.target.value;
                setUpdateGoalStatus(newStatus);
                if (newStatus === 'COMPLETED') {
                  setUpdateGoalProgress(100);
                }
              }}
              className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-slate-800 dark:text-slate-200"
              data-agent="update-goal-status-select"
            >
              <option value="PENDING">Pending (To Do)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed (Done)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="updateProgress">
              Progress Percentage ({updateGoalProgress}%)
            </label>
            <Input
              id="updateProgress"
              type="number"
              min="0"
              max="100"
              value={updateGoalProgress}
              onChange={(e) => setUpdateGoalProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="rounded-sm bg-background border-input h-10"
              data-agent="update-goal-progress-input"
            />
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm border-input hover:bg-slate-50 text-slate-700 h-10"
              data-agent="update-goal-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md h-10 font-bold"
              data-agent="update-goal-submit-btn"
            >
              {isPending ? 'Saving...' : 'Save Updates'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

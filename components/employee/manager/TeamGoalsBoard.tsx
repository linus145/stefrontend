'use client';

import React from 'react';
import { Target, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface TeamGoalsBoardProps {
  goals: any[];
  onOpenAssignModal: () => void;
  onUpdateGoal: (id: string, updatedData: any) => void;
  onDeleteGoal: (id: string) => void;
}

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

function BoardColumn({ colStatus, label, badgeStyle, goals, onUpdateGoal, onDeleteGoal }: {
  colStatus: string;
  label: string;
  badgeStyle: string;
  goals: any[];
  onUpdateGoal: (id: string, updatedData: any) => void;
  onDeleteGoal: (id: string) => void;
}) {
  const colGoals = goals.filter((g: any) => g.status === colStatus);
  return (
    <div className="flex flex-col space-y-4 bg-slate-50/50 dark:bg-slate-950/20 p-6 rounded-sm border border-slate-200/50 dark:border-slate-800/50 min-h-[300px]">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
        <span className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-current text-slate-500" /> {label}
        </span>
        <Badge className={`${badgeStyle} border-none font-bold text-[10px] px-2.5 py-0.5 rounded-full`}>
          {colGoals.length}
        </Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] scrollbar-thin">
        {colGoals.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6 text-xs text-slate-400 italic font-medium">
            No tasks in this column
          </div>
        ) : (
          colGoals.map((g: any) => {
            const assigneeName = g.employee_detail ? `${g.employee_detail.first_name} ${g.employee_detail.last_name}` : 'Unassigned';
            return (
              <div key={g.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-sm shadow-sm hover:shadow-md transition-all group flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-[#0a66c2] transition-colors">{toSentenceCase(g.title)}</span>
                    {g.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mt-0.5">{g.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{g.progress_percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex">
                    <div
                      className="bg-[#0a66c2] transition-all duration-500"
                      style={{ width: `${g.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-6 w-6 rounded-sm border border-slate-200/50 dark:border-slate-800/50">
                      <AvatarFallback className="bg-[#0a66c2]/10 text-[#0a66c2] text-[9px] font-bold rounded-sm flex items-center justify-center">
                        {assigneeName.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{assigneeName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {colStatus !== 'COMPLETED' && (
                      <select
                        value={g.status}
                        onChange={(e) => onUpdateGoal(g.id, { status: e.target.value, progress_percentage: e.target.value === 'COMPLETED' ? 100 : g.progress_percentage })}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-[10px] font-bold text-slate-500 p-0.5 outline-none cursor-pointer"
                      >
                        <option value="PENDING">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Done</option>
                      </select>
                    )}

                    <button
                      onClick={() => {
                        toast('Remove this goal permanently?', {
                          description: 'This action cannot be undone.',
                          action: {
                            label: 'Delete',
                            onClick: () => onDeleteGoal(g.id),
                          },
                        });
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-sm bg-rose-500/5 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/10 transition-all cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  Due: {g.due_date}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function TeamGoalsBoard({ goals, onOpenAssignModal, onUpdateGoal, onDeleteGoal }: TeamGoalsBoardProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-6 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <Target className="h-4 w-4" /> Team goals & tasks (Jira board)
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            Track strategic OKRs, sprint tasks, and progress assigned to your subordinates.
          </CardDescription>
        </div>
        <Button
          onClick={onOpenAssignModal}
          size="sm"
          className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-sm flex items-center gap-1.5 shadow-md cursor-pointer"
          data-agent="manager-create-goal-btn"
        >
          <Plus className="h-4 w-4" /> Assign strategic goal
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <BoardColumn colStatus="PENDING" label="To do" badgeStyle="border-amber-500/20 bg-amber-500/5 text-amber-600" goals={goals} onUpdateGoal={onUpdateGoal} onDeleteGoal={onDeleteGoal} />
          {/* In Progress Column */}
          <BoardColumn colStatus="IN_PROGRESS" label="In progress" badgeStyle="border-blue-500/20 bg-blue-500/5 text-blue-600" goals={goals} onUpdateGoal={onUpdateGoal} onDeleteGoal={onDeleteGoal} />
          {/* Completed Column */}
          <BoardColumn colStatus="COMPLETED" label="Done" badgeStyle="border-emerald-500/20 bg-emerald-500/5 text-emerald-600" goals={goals} onUpdateGoal={onUpdateGoal} onDeleteGoal={onDeleteGoal} />
        </div>
      </CardContent>
    </Card>
  );
}

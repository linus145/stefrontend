'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, Save, ShieldCheck, Sparkles, Clock } from 'lucide-react';

interface AgentSchedulingData {
  id?: string;
  enabled: boolean;
  recurrence: string;
  execution_time: string;
  task_type: string;
  notification_email: string;
  day_of_week?: string;
  day_of_month?: number;
  month_of_year?: number;
}

const TASK_OPTIONS = [
  { id: 'employee_onboarding', label: 'Employee Onboarding & Salary Audit', desc: 'Audits active profiles and registers standard salary structures for new hires.' },
  { id: 'attendance_audit', label: 'Daily Attendance & Hours Audit', desc: 'Scans timesheet logs, clock-in activity, and logs overtime accounts.' },
  { id: 'leave_approval', label: 'Leave Request Processing', desc: 'Runs automated checks on pending leave forms and updates balances.' },
  { id: 'payroll_runs', label: 'Generate Monthly Payroll Drafts', desc: 'Compiles gross pay, deductions, tax slabs, and generates cycles.' },
  { id: 'add_bonus', label: 'Performance Bonus Adjustments', desc: 'Allocates performance incentive credits based on monthly targets.' },
  { id: 'reimbursement_audit', label: 'Expense Claims Verification', desc: 'Reviews pending reimbursement receipts and schedules approval cycles.' },
  { id: 'payslips_generation', label: 'Disburse Employee Payslips', desc: 'Compiles and emails secure PDF payslips to all registered workers.' },
  { id: 'performance_evaluation', label: 'Performance Scorecard Reviews', desc: 'Evaluates monthly KPIs, manager notes, and updates scorecards.' },
  { id: 'organization_compliance', label: 'Org Compliance & Role Audit', desc: 'Validates department head counts, hierarchical trees, and role rules.' },
  { id: 'screening', label: 'Resume Screening & Matching', desc: 'Processes inbound job applications against active career listings.' }
];

export function AgentSchedulingTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduling, setScheduling] = useState<AgentSchedulingData>({
    enabled: false,
    recurrence: 'daily',
    execution_time: '09:00:00',
    task_type: 'payroll_runs',
    notification_email: '',
    day_of_week: 'Monday',
    day_of_month: 1,
    month_of_year: 1,
  });

  // Convert 24-hour execution_time to 12-hour components
  const parseExecutionTime = () => {
    const timeStr = scheduling.execution_time || '09:00:00';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    const minuteStr = String(m).padStart(2, '0');
    return { hour: hour12, minute: minuteStr, period };
  };

  const { hour: hour12, minute: minuteStr, period } = parseExecutionTime();

  const handleTimeChange = (field: 'hour' | 'minute' | 'period', value: string) => {
    let currentHour = hour12;
    let currentMin = minuteStr;
    let currentPeriod = period;

    if (field === 'hour') currentHour = parseInt(value, 10);
    if (field === 'minute') currentMin = value;
    if (field === 'period') currentPeriod = value;

    let hour24 = currentHour;
    if (currentPeriod === 'PM' && hour24 < 12) hour24 += 12;
    if (currentPeriod === 'AM' && hour24 === 12) hour24 = 0;
    
    const timeStr = `${String(hour24).padStart(2, '0')}:${currentMin}:00`;
    setScheduling({ ...scheduling, execution_time: timeStr });
  };

  const selectedTasks = scheduling.task_type
    ? scheduling.task_type.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const handleTaskToggle = (taskId: string) => {
    const current = scheduling.task_type
      ? scheduling.task_type.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    let updated;
    if (current.includes(taskId)) {
      updated = current.filter(t => t !== taskId);
    } else {
      updated = [...current, taskId];
    }
    setScheduling({ ...scheduling, task_type: updated.join(',') });
  };

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get<any[]>('/autonomousagent1/executions/');
      if (res) {
        // Filter to only show runs triggered by scheduling agent
        const scheduledRuns = res.filter((run: any) => 
          run.agent_type === 'scheduling_agent' || 
          run.metadata?.trigger === 'celery_beat' || 
          run.metadata?.schedule_id
        );
        setHistory(scheduledRuns);
      }
    } catch (err) {
      console.error('Failed to load execution history', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const fetchScheduling = async () => {
      try {
        const res = await api.get<AgentSchedulingData>('/agentsettings/scheduling/');
        if (res) {
          setScheduling(res);
        }
      } catch (err) {
        console.error('Failed to load agent scheduling', err);
        toast.error('Failed to load agent scheduling');
      } finally {
        setIsLoading(false);
      }
    };
    fetchScheduling();
    fetchHistory();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch<AgentSchedulingData>('/agentsettings/scheduling/', scheduling);
      if (res) {
        setScheduling(res);
        toast.success('Agent scheduling updated successfully!');
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to save scheduling', err);
      toast.error('Failed to update agent scheduling');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0a66c2]" />
            Agent Scheduling Control Panel
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure recurrent execution triggers and cron configurations for autonomous agent processes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Configuration */}
          <Card className="lg:col-span-2 bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-[#0a66c2]" />
                <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Autonomous Cron Triggers
                </CardTitle>
              </div>
              <Badge className={scheduling.enabled ? "bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-sm" : "bg-slate-500/10 text-slate-500 border-none font-bold text-[9px] px-2 py-0.5 rounded-sm"}>
                {scheduling.enabled ? 'ACTIVE RUNTIME' : 'INACTIVE'}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm">
                <input
                  id="enabled-toggle"
                  type="checkbox"
                  checked={scheduling.enabled}
                  onChange={(e) => setScheduling({ ...scheduling, enabled: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-[#0a66c2] focus:ring-[#0a66c2] border-slate-300 dark:border-slate-700 bg-background cursor-pointer"
                />
                <label htmlFor="enabled-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer selection:bg-transparent">
                  Enable autonomous scheduled background runs for this tenant
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Execution Frequency
                  </label>
                  <select
                    value={scheduling.recurrence}
                    onChange={(e) => setScheduling({ ...scheduling, recurrence: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  >
                    <option value="daily">Everyday (Daily)</option>
                    <option value="weekly">Every Week (Weekly)</option>
                    <option value="monthly">Every Month (Monthly)</option>
                    <option value="yearly">Every Year (Yearly)</option>
                  </select>
                </div>

                {/* Conditional Weekly Day Selection */}
                {scheduling.recurrence === 'weekly' && (
                  <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-200">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Day of the Week
                    </label>
                    <select
                      value={scheduling.day_of_week || 'Monday'}
                      onChange={(e) => setScheduling({ ...scheduling, day_of_week: e.target.value })}
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                )}

                {/* Conditional Monthly Day Selection */}
                {scheduling.recurrence === 'monthly' && (
                  <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-200">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Day of the Month
                    </label>
                    <select
                      value={scheduling.day_of_month || 1}
                      onChange={(e) => setScheduling({ ...scheduling, day_of_month: parseInt(e.target.value, 10) })}
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Day {day}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Conditional Yearly Month & Day Selection */}
                {scheduling.recurrence === 'yearly' && (
                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-left-2 duration-200 col-span-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Month
                      </label>
                      <select
                        value={scheduling.month_of_year || 1}
                        onChange={(e) => setScheduling({ ...scheduling, month_of_year: parseInt(e.target.value, 10) })}
                        className="w-full h-9 px-2 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                      >
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Day
                      </label>
                      <select
                        value={scheduling.day_of_month || 1}
                        onChange={(e) => setScheduling({ ...scheduling, day_of_month: parseInt(e.target.value, 10) })}
                        className="w-full h-9 px-2 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Picker in 12-Hour format with AM/PM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Execution Target Time (12-Hour format)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={hour12}
                      onChange={(e) => handleTimeChange('hour', e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}
                        </option>
                      ))}
                    </select>

                    <span className="text-lg font-bold flex items-center">:</span>

                    <select
                      value={minuteStr}
                      onChange={(e) => handleTimeChange('minute', e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                    >
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={period}
                      onChange={(e) => handleTimeChange('period', e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Autonomous Target Actions Checklist (Tick items to automate)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TASK_OPTIONS.map((task) => {
                    const isChecked = selectedTasks.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskToggle(task.id)}
                        className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-all duration-200 ${
                          isChecked
                            ? 'bg-blue-50/5 border-[#0a66c2] dark:border-[#0a66c2]'
                            : 'bg-slate-50/30 dark:bg-[#1c1d30]/50 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by outer div onClick
                          className="w-4 h-4 mt-0.5 rounded-sm text-[#0a66c2] focus:ring-[#0a66c2] border-slate-300 dark:border-slate-700 bg-background cursor-pointer"
                        />
                        <div className="space-y-0.5 select-none">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {task.label}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal">
                            {task.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Notification / Report Recipient Email
                  </label>
                  <input
                    type="email"
                    value={scheduling.notification_email}
                    onChange={(e) => setScheduling({ ...scheduling, notification_email: e.target.value })}
                    placeholder="alerts@yourcompany.com"
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Guidelines */}
          <Card className="bg-slate-50 dark:bg-[#151628]/40 border border-slate-150 dark:border-slate-800 rounded-sm shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Schedules Policy
              </CardTitle>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>When active, the agent wakes up at the designated target time using server-side tasks to process payroll or resume matching.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>All compiled reports are sent directly to the configured recipient email address after completion.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>Celery workers must be active to schedule and trigger background tasks.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase">Engine Version:</span>
                <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px] px-2 py-0.5 rounded-sm">
                  V2.5-CRON
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 h-9 rounded-sm shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? 'Updating schedule...' : (
              <>
                <Save className="h-4 w-4" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Execution Report Card */}
      <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm mt-8">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#151624]/20">
          <CardTitle className="text-xs font-extrabold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-[#0a66c2]" />
            Agent Execution Logs & History Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isHistoryLoading ? (
            <div className="py-8"><LocalLoader /></div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide bg-slate-50 dark:bg-slate-900/30">
              No executions logged yet. Scheduled agent tasks will report runs here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-[#151624]/10">
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Agent / Tasks</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Status</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Started At</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Duration</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Actions Performed / Error</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((run: any) => {
                    const durationStr = run.execution_time ? `${run.execution_time.toFixed(1)}s` : '-';
                    const dateStr = new Date(run.started_at).toLocaleString();
                    
                    let taskName = 'Interactive Session';
                    if (run.metadata?.task_type) {
                      const tasksArray = run.metadata.task_type.split(',').map((t: string) => {
                        const matched = TASK_OPTIONS.find(o => o.id === t.trim());
                        return matched ? matched.label : t.trim();
                      });
                      taskName = tasksArray.join(', ');
                    } else if (run.agent_type === 'scheduling_agent') {
                      taskName = 'Scheduled Task';
                    }

                    return (
                      <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {taskName}
                          <div className="text-[9px] text-slate-400 font-semibold">{run.agent_type}</div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <Badge className={`font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none ${
                            run.status === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            run.status === 'running' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 animate-pulse' :
                            'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {run.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{dateStr}</td>
                        <td className="py-3 px-4 text-xs text-slate-650 dark:text-slate-400 font-semibold">{durationStr}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-450 max-w-md break-words">
                          {run.status === 'failed' ? (
                            <span className="text-red-500 font-semibold">{run.metadata?.error || 'Execution failed.'}</span>
                          ) : run.actions_performed && run.actions_performed.length > 0 ? (
                            <div className="space-y-1">
                              {run.actions_performed.map((act: any, idx: number) => (
                                <div key={idx} className="flex flex-col gap-0.5">
                                  <span className="font-bold text-[10px] text-[#0a66c2] dark:text-[#3b8fd9]">{act.action}:</span>
                                  <span className="text-[10px] pl-2">{act.result}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No specific actions recorded.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

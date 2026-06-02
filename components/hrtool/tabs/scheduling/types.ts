export type { AgentSchedulingData, CommandStep } from '@/types/scheduling.types';
import type { AgentSchedulingData } from '@/types/scheduling.types';

export const TASK_OPTIONS = [
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

export const DEFAULT_SCHEDULING: AgentSchedulingData = {
  enabled: false,
  recurrence: '12h',
  execution_time: '09:00:00',
  task_type: 'payroll_runs',
  notification_email: '',
  day_of_week: 'Monday',
  day_of_month: 1,
  month_of_year: 1,
  command: 'Execute default task audit and sync pipeline',
  max_executions: 5,
  run_count: 0,
};

/** Convert 24h time string (HH:MM:SS) to 12h AM/PM format */
export const formatTimeStr = (timeStr: string) => {
  try {
    if (!timeStr) return '09:00:00 AM';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    const period = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    const hStr = String(hour12).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    return `${hStr}:${mStr}:${sStr} ${period}`;
  } catch (e) {
    return timeStr;
  }
};

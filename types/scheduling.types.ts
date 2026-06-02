export interface AgentSchedulingData {
  id?: string;
  enabled: boolean;
  recurrence: string;
  execution_time: string;
  task_type: string;
  notification_email: string;
  day_of_week?: string;
  day_of_month?: number;
  month_of_year?: number;
  command: string;
  max_executions: number;
  run_count?: number;
}

export interface CommandStep {
  task: string;
  recurrence: string;
  command: string;
  execution_time: string;
}

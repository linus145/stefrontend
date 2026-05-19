export interface WorkSession {
  id: string;
  check_in: string | null;
  check_out: string | null;
  location_in: string | null;
  location_out: string | null;
}

export interface EmployeeDetail {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employee: string;
  employee_detail: EmployeeDetail;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  is_late: boolean;
  total_work_hours: string;
  overtime_hours: string;
  sessions: WorkSession[];
}

export interface ShiftSettings {
  id: string;
  startup: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period: number;
  min_hours_full_day: string;
  min_hours_half_day: string;
}

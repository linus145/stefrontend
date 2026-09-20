export interface ToolParameterSchema {
  type: string;
  description: string;
  required: boolean;
}

export interface AvailableTool {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  parameters: Record<string, ToolParameterSchema>;
}

export interface IntentParseResult {
  intent_detected: boolean;
  tool_id: string | null;
  parameters: {
    month?: number | null;
    year?: number | null;
    [key: string]: any;
  };
  reason: string;
}

export interface PayrollRecordItem {
  id: string;
  employee_name: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  tax_amount: number;
}

export interface PayrollExecutionData {
  is_simulation: boolean;
  status: string;
  payroll_id: string | null;
  employee_count: number;
  total_gross: number;
  total_deductions: number;
  total_net_payout: number;
  records: PayrollRecordItem[];
  message?: string;
  error?: string;
}

export interface ToolExecutionResult {
  status: 'SUCCESS' | 'FAILED';
  tool_activated: string | null;
  parameters: {
    month?: number | null;
    year?: number | null;
    startup_id?: string | null;
    [key: string]: any;
  };
  summary: string;
  audit_logs: string[];
  data: PayrollExecutionData | Record<string, any>;
}

export interface ExecuteToolOptions {
  query?: string;
  month?: number;
  year?: number;
  startup_id?: string;
}

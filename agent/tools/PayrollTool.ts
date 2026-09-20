import { ToolApiService } from './ToolApiService';
import {
  ToolExecutionResult,
  IntentParseResult,
  PayrollExecutionData,
} from './ToolTypes';

export class PayrollTool {
  private static instance: PayrollTool;
  private apiService: ToolApiService;

  private constructor() {
    this.apiService = ToolApiService.getInstance();
  }

  public static getInstance(): PayrollTool {
    if (!PayrollTool.instance) {
      PayrollTool.instance = new PayrollTool();
    }
    return PayrollTool.instance;
  }

  /**
   * Fast check if the user query is intended for payroll operations.
   */
  public async isPayrollRequest(query: string): Promise<IntentParseResult> {
    return await this.apiService.parseIntent(query);
  }

  /**
   * Runs the payroll automation pipeline using natural language prompt.
   * Example: "run payroll for October 2026"
   */
  public async runFromPrompt(query: string): Promise<ToolExecutionResult> {
    return await this.apiService.executeTool({ query });
  }

  /**
   * Runs the payroll automation pipeline using explicit month and year numbers.
   */
  public async runExplicit(
    month: number,
    year: number,
    startupId?: string
  ): Promise<ToolExecutionResult> {
    return await this.apiService.executeTool({
      month,
      year,
      startup_id: startupId,
    });
  }

  /**
   * Helper to format financial totals in Indian Rupee format.
   */
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Extracts typed payroll data from the generic tool execution result.
   */
  public getPayrollData(result: ToolExecutionResult): PayrollExecutionData | null {
    if (result.status === 'SUCCESS' && result.data && typeof result.data === 'object') {
      return result.data as PayrollExecutionData;
    }
    return null;
  }
}

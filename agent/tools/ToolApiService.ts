import { api } from '../../lib/api';
import {
  AvailableTool,
  IntentParseResult,
  ToolExecutionResult,
  ExecuteToolOptions,
} from './ToolTypes';

export class ToolApiService {
  private static instance: ToolApiService;

  private constructor() {}

  public static getInstance(): ToolApiService {
    if (!ToolApiService.instance) {
      ToolApiService.instance = new ToolApiService();
    }
    return ToolApiService.instance;
  }

  /**
   * Dry-run endpoint: checks whether user text matches a deterministic tool
   * and extracts parameters (e.g. month, year) without executing anything.
   */
  public async parseIntent(query: string): Promise<IntentParseResult> {
    try {
      const response = await api.post<IntentParseResult>('/agenttaskexecution/parse-intent/', {
        query,
      });
      return response;
    } catch (error: any) {
      return {
        intent_detected: false,
        tool_id: null,
        parameters: {},
        reason: error?.message || 'Failed to connect to intent parser',
      };
    }
  }

  /**
   * Executes a deterministic automation tool (e.g. Payroll generation pipeline)
   * in the backend without invoking any LLM or AI APIs.
   */
  public async executeTool(options: ExecuteToolOptions): Promise<ToolExecutionResult> {
    try {
      const payload: Record<string, any> = {};
      if (options.query) payload.query = options.query;
      if (options.month !== undefined) payload.month = options.month;
      if (options.year !== undefined) payload.year = options.year;
      if (options.startup_id) payload.startup_id = options.startup_id;

      const response = await api.post<ToolExecutionResult>(
        '/agenttaskexecution/execute/',
        payload
      );
      return response;
    } catch (error: any) {
      const errorData = (error as any)?.data || error?.response?.data;
      return {
        status: 'FAILED',
        tool_activated: errorData?.tool_activated || null,
        parameters: errorData?.parameters || {},
        summary: errorData?.summary || error?.message || 'Tool execution request failed',
        audit_logs: errorData?.audit_logs || [
          `[ERROR] Execution failed: ${error?.message || 'Unknown network error'}`,
        ],
        data: errorData?.data || {},
      };
    }
  }

  /**
   * Fetches the registered deterministic tools and parameter schemas.
   */
  public async getAvailableTools(): Promise<AvailableTool[]> {
    try {
      const response = await api.get<{ tools: AvailableTool[]; count: number }>(
        '/agenttaskexecution/tools/'
      );
      return response.tools || [];
    } catch (error) {
      console.error('[ToolApiService] Failed to fetch tools registry:', error);
      return [];
    }
  }
}

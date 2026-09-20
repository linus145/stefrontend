import { ToolApiService } from './ToolApiService';
import { PayrollTool } from './PayrollTool';
import { ToolExecutionResult, IntentParseResult } from './ToolTypes';
import { AgentRealtimeStream } from '../core/AgentRealtimeStream';

export interface ToolExecutionCallbacks {
  onLog?: (logMessage: string, type?: 'info' | 'task' | 'action' | 'success' | 'error') => void;
  onStatus?: (statusMessage: string) => void;
  onComplete?: (result: ToolExecutionResult) => void;
  onError?: (error: string) => void;
}

/**
 * Controller for deterministic tools.
 * Built to completely bypass Playwright / DOM scraping and cloud LLM latency
 * when the user asks for backend automation (e.g. Payroll generation).
 */
export class AgentToolController {
  private static instance: AgentToolController;
  private apiService: ToolApiService;
  private payrollTool: PayrollTool;
  private stream: AgentRealtimeStream;

  private constructor() {
    this.apiService = ToolApiService.getInstance();
    this.payrollTool = PayrollTool.getInstance();
    this.stream = AgentRealtimeStream.getInstance();
  }

  public static getInstance(): AgentToolController {
    if (!AgentToolController.instance) {
      AgentToolController.instance = new AgentToolController();
    }
    return AgentToolController.instance;
  }

  /**
   * Fast check to see if the user's goal matches any registered deterministic tool.
   */
  public async canHandle(goal: string): Promise<{ canHandle: boolean; intent: IntentParseResult }> {
    if (!goal || !goal.trim()) {
      return {
        canHandle: false,
        intent: {
          intent_detected: false,
          tool_id: null,
          parameters: {},
          reason: 'Empty query',
        },
      };
    }

    const intent = await this.apiService.parseIntent(goal);
    return {
      canHandle: intent.intent_detected,
      intent,
    };
  }

  /**
   * Executes the deterministic tool workflow without any Playwright or LLM calls.
   * Streams logs and updates real-time state.
   */
  public async executeGoal(
    goal: string,
    callbacks?: ToolExecutionCallbacks
  ): Promise<ToolExecutionResult> {
    const notifyStatus = (msg: string) => {
      this.stream.emit('status', msg);
      callbacks?.onStatus?.(msg);
    };

    const notifyLog = (msg: string, type: 'info' | 'task' | 'action' | 'success' | 'error' = 'info') => {
      callbacks?.onLog?.(msg, type);
    };

    notifyStatus(`Checking automation tool for goal: "${goal}"...`);

    // 1. Check intent
    const { canHandle, intent } = await this.canHandle(goal);

    if (!canHandle || !intent.tool_id) {
      const failResult: ToolExecutionResult = {
        status: 'FAILED',
        tool_activated: null,
        parameters: {},
        summary: 'No deterministic tool matches this query.',
        audit_logs: ['[DETECTION] No matching tool found.'],
        data: {},
      };
      notifyStatus('No matching tool found.');
      notifyLog('No matching automation tool found for query.', 'error');
      callbacks?.onError?.(failResult.summary);
      return failResult;
    }

    notifyStatus(`Activated Tool: ${intent.tool_id} (Zero AI / Deterministic)`);
    notifyLog(`Found tool: ${intent.tool_id}`, 'task');

    // 2. Dispatch tool execution to backend LangGraph engine
    notifyStatus('Running backend LangGraph pipeline...');
    const result = await this.apiService.executeTool({ query: goal });

    // 3. Stream backend audit logs to UI
    if (result.audit_logs && result.audit_logs.length > 0) {
      for (const log of result.audit_logs) {
        this.stream.emit('status', log);
        if (log.includes('[ERROR]') || log.includes('[FAILED]')) {
          notifyLog(log, 'error');
        } else if (log.includes('[OK]') || log.includes('[COMPLETION]')) {
          notifyLog(log, 'success');
        } else {
          notifyLog(log, 'action');
        }
      }
    }

    // 4. Handle final state
    if (result.status === 'SUCCESS') {
      this.stream.emit('status', `✓ ${result.summary}`);
      this.stream.emit('goal_complete', goal);

      // Dispatch global window events so all active views (PayrollRuns, Dashboard, Approvals) instantly re-render without page refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('payroll-updated', { detail: result.data }));
        window.dispatchEvent(new CustomEvent('agent-payroll-generated', { detail: result.data }));
      }

      callbacks?.onComplete?.(result);
    } else {
      this.stream.emit('status', `✗ ${result.summary}`);
      this.stream.emit('task_failed', {
        task: { description: goal },
        error: result.summary,
      });
      callbacks?.onError?.(result.summary);
    }

    return result;
  }
}

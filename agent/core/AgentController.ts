import { AgentPlanner, AgentPlan, AgentTask } from '@/agent/planner/AgentPlanner';
import { AgentExecutor } from '@/agent/executor/AgentExecutor';
import { AgentMemory } from '@/agent/memory/AgentMemory';
import { AgentMonitor } from '@/agent/monitoring/AgentMonitor';
import { AgentRealtimeStream } from '@/agent/core/AgentRealtimeStream';
import { StateObserver } from '@/agent/core/StateObserver';
import { api } from '@/lib/api';
import { aiAgentService } from '@/services/ai-agents.service';

interface LLMAction {
  action_type: string;
  selector?: string;
  value?: string;
  wait_after_ms?: number;
  description?: string;
  thinking?: string;
  options?: string[];
  error?: string;
}

export class AgentController {
  private static instance: AgentController;
  private planner: AgentPlanner;
  private executor: AgentExecutor;
  private memory: AgentMemory;
  private monitor: AgentMonitor;
  private stream: AgentRealtimeStream;
  private observer: StateObserver;

  private isRunning: boolean = false;
  private currentPlan: AgentPlan | null = null;
  private _isLLMMode: boolean = false;
  private llmGoal: string = '';
  private llmActionHistory: LLMAction[] = [];
  private llmIteration: number = 0;
  private _isWaitingForUser: boolean = false;
  private _userResponse: string | null = null;
  private lastQuestion: string = '';
  private originalGoal: string = '';
  private currentExecutionId: string | null = null;
  private legacyActionHistory: any[] = [];

  private static MAX_LLM_ITERATIONS = 30;

  private constructor() {
    this.planner = AgentPlanner.getInstance();
    this.executor = AgentExecutor.getInstance();
    this.memory = AgentMemory.getInstance();
    this.monitor = AgentMonitor.getInstance();
    this.stream = AgentRealtimeStream.getInstance();
    this.observer = StateObserver.getInstance();

    this.initAsync();
  }

  private getTabId(): string {
    if (typeof window === 'undefined') return '';
    let tabId = sessionStorage.getItem('agent_tab_id');
    if (!tabId) {
      tabId = 'tab_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('agent_tab_id', tabId);
    }
    return tabId;
  }

  public static getInstance(): AgentController {
    if (!AgentController.instance) {
      AgentController.instance = new AgentController();
    }
    return AgentController.instance;
  }

  private shouldUseLLM(goal: string): boolean {
    if (!goal) return false;

    // UUID goals (programmatic candidate screening) → ALWAYS use legacy plan
    const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    if (uuidPattern.test(goal)) return false;

    return true;
  }

  public get isLLMMode(): boolean {
    return this._isLLMMode;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Async initialization to rehydrate execution state from Django DB
   */
  public async initAsync() {
    if (typeof window === 'undefined') return;

    // Parse URL query parameter for cross-tab execution handover
    const urlParams = new URLSearchParams(window.location.search);
    const executionId = urlParams.get('execution_id');

    let activeExecution: any = null;

    try {
      if (executionId) {
        console.log(`[AgentController] Recovering execution from URL param: ${executionId}`);
        activeExecution = await aiAgentService.getExecutionState(executionId);
      } else {
        // Query the database for the active running execution for this session/user
        activeExecution = await aiAgentService.getActiveExecution();
      }
    } catch (e) {
      console.error('[AgentController] Error loading state from backend DB:', e);
    }

    // Guard against race conditions: if a goal has already been triggered, abort rehydration
    if (this.isRunning) {
      console.log('[AgentController] Aborting initAsync rehydration because agent is already running.');
      return;
    }

    // Check if we retrieved a valid running execution (Terminal check)
    if (activeExecution && activeExecution.active !== false && (activeExecution.status === 'running' || activeExecution.status === 'pending')) {
      console.log(`[AgentController] Rehydrating active execution from backend: ${activeExecution.id}`);
      this.currentExecutionId = activeExecution.id;
      
      const goalDetails = activeExecution.goal_details;
      this.llmGoal = goalDetails?.goal || activeExecution.metadata?.goal || '';
      this.originalGoal = goalDetails?.goal || activeExecution.metadata?.goal || '';
      this._isLLMMode = this.shouldUseLLM(this.llmGoal);

      // Restore action history from backend
      if (activeExecution.agent_actions && activeExecution.agent_actions.length > 0) {
        this.llmActionHistory = activeExecution.agent_actions.map((act: any) => ({
          action_type: act.action_type,
          selector: act.action_payload?.selector,
          value: act.action_payload?.value,
          description: act.action_payload?.description,
          thinking: act.action_payload?.thinking,
        }));
      } else if (activeExecution.actions_performed && activeExecution.actions_performed.length > 0) {
        this.llmActionHistory = activeExecution.actions_performed.map((act: any) => ({
          action_type: act.type || act.action_type || '',
          selector: act.selector,
          value: act.value,
          description: act.description,
        }));
      } else {
        this.llmActionHistory = [];
      }

      this.llmIteration = this.llmActionHistory.length;

      // Sync AgentMemory history with backend memories
      const memoryInstance = AgentMemory.getInstance();
      memoryInstance.setExecutionId(activeExecution.id);
      if (activeExecution.memories && activeExecution.memories.length > 0) {
        const parsedHistory = activeExecution.memories.map((m: any) => ({
          timestamp: new Date(m.created_at).getTime(),
          type: m.memory_type as any,
          content: m.memory_value,
        }));
        memoryInstance.loadHistory(parsedHistory);
      }

      // If there's a legacy plan saved in metadata, load it
      if (!this._isLLMMode && activeExecution.metadata?.plan) {
        this.currentPlan = activeExecution.metadata.plan;
      }

      // Double execution prevention check for cross-tab active owner
      if (typeof window !== 'undefined') {
        const activeTabId = localStorage.getItem('agent_active_tab_id');
        if (activeTabId && activeTabId !== this.getTabId()) {
          console.log(`[AgentController] Suppressing auto-resume in tab ${this.getTabId()} because active tab is ${activeTabId}`);
          return;
        }
        localStorage.setItem('agent_active_tab_id', this.getTabId());
      }

      // Resume execution
      this.isRunning = true;
      this.stream.emit('status', `🔄 Resuming active goal: ${this.originalGoal}`);
      
      setTimeout(() => {
        if (this._isLLMMode) {
          this.runLLMLoop(this.llmGoal, undefined, true);
        } else if (this.currentPlan) {
          this.executePlan();
        }
      }, 1000);

    } else {
      console.log('[AgentController] Safe initialization completed. No active goals.');
      // Clean local runtime
      this.isRunning = false;
      this.currentExecutionId = null;
      AgentMemory.getInstance().setExecutionId(null);
    }
  }

  public async startGoal(goal: string) {
    if (this.isRunning) return;
    this.isRunning = true;

    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_active_tab_id', this.getTabId());
    }

    if (!goal.toLowerCase().includes('regarding my previous request')) {
      this.originalGoal = goal;
    }

    this.llmActionHistory = [];
    this.legacyActionHistory = [];

    if (this.shouldUseLLM(goal)) {
      this._isLLMMode = true;
      this.stream.emit('status', `🤖 Starting AI-powered autonomous agent...`);
      await this.createBackendExecution(goal);
      await this.runLLMLoop(goal);
    } else {
      this._isLLMMode = false;
      this.stream.emit('status', `Planning goal: ${goal}`);
      const plan = await this.planner.generatePlan(goal);

      if (!this.isRunning) return;

      this.currentPlan = plan;
      this.memory.remember('decision', { goal, plan: this.currentPlan });
      await this.createBackendExecution(goal, plan);
      this.executePlan();
    }
  }

  public stopAgent() {
    this.isRunning = false;
    this.updateBackendExecution('failed').catch(e => console.error(e));
    if (typeof window !== 'undefined') {
      const activeTabId = localStorage.getItem('agent_active_tab_id');
      if (activeTabId === this.getTabId()) {
        localStorage.removeItem('agent_active_tab_id');
      }
    }
    this.stream.emit('task_failed', { task: { description: 'Manual Stop' }, error: 'Execution terminated' });
  }

  public async resumeAgent() {
    if (this.isRunning) return;

    if (!this.llmGoal && !this.currentPlan) {
      this.stream.emit('status', `⚠️ No active task found to resume.`);
      return;
    }

    this.isRunning = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_active_tab_id', this.getTabId());
    }

    if (this.currentExecutionId) {
      await this.updateBackendExecution('running');
    }

    if (this.llmGoal) {
      this._isLLMMode = true;
      this.stream.emit('status', `🔄 Resuming AI-powered autonomous agent...`);
      await this.runLLMLoop(this.llmGoal, undefined, true);
    } else if (this.currentPlan) {
      this.stream.emit('status', `🔄 Resuming planned execution...`);
      this.executePlan();
    } else {
      this.stream.emit('status', `⚠️ Resume failed: state inconsistent.`);
      this.isRunning = false;
    }
  }

  private async runLLMLoop(goal: string, userResponse?: string, isResume: boolean = false) {
    this.llmGoal = goal;
    if (!isResume) {
      this.llmIteration = 0;
      this.llmActionHistory = [];
    }

    try {
      while (this.isRunning && this.llmIteration < AgentController.MAX_LLM_ITERATIONS) {
        this.llmIteration++;
        this.stream.emit('status', `Iteration ${this.llmIteration}/${AgentController.MAX_LLM_ITERATIONS} — Observing page...`);

        await this.wait(800);

        const pageState = this.observer.capture();
        this.stream.emit('status', `📸 Captured ${pageState.visible_elements.length} elements | ${pageState.active_step || pageState.url}`);

        if (!this.isRunning) break;
        this.stream.emit('status', `🧠 Analyzing with AI...`);

        let action: LLMAction;
        try {
          action = await api.post<LLMAction>('/autonomousagent1/llm/think/', {
            goal: this.llmGoal,
            original_goal: this.originalGoal,
            page_state: pageState,
            action_history: this.llmActionHistory.slice(-10),
            iteration: this.llmIteration,
            user_response: userResponse || null,
          });
          userResponse = undefined;
        } catch (error: any) {
          this.stream.emit('status', `⚠️ LLM request failed: ${error.message}. Retrying...`);
          await this.wait(3000);
          continue;
        }

        if (action.thinking) {
          this.stream.emit('status', `🧠 ${action.thinking}`);
          // Save Decision to backend
          if (this.currentExecutionId) {
            aiAgentService.saveDecision(this.currentExecutionId, {
              decision_type: action.action_type,
              decision_data: action,
              reasoning_data: { thinking: action.thinking }
            }).catch(e => console.error(e));
          }
        }

        if (action.action_type === 'done') {
          this.stream.emit('goal_complete', this.llmGoal);
          await this.updateBackendExecution('success', this.llmActionHistory);
          break;
        }

        if (action.action_type === 'ask_user') {
          this.stream.emit('status', `❓ Agent is asking you a question...`);
          this._isWaitingForUser = true;
          this._userResponse = null;

          window.dispatchEvent(new CustomEvent('agent-ask-user', {
            detail: {
              message: action.value || 'I need more information.',
              options: action.options || []
            }
          }));

          const waitStart = Date.now();
          while (this._isWaitingForUser && (Date.now() - waitStart) < 300000) {
            await this.wait(500);
          }

          if (this._userResponse) {
            const reply = this._userResponse;
            this.stream.emit('status', `✅ User responded: "${reply}"`);
            userResponse = reply;
            this._userResponse = null;

            this.llmActionHistory.push({
              action_type: 'ask_user',
              value: action.value,
              description: `Asked user: ${action.value} → User said: ${userResponse}`,
            });

            // Save Action to backend
            if (this.currentExecutionId) {
              aiAgentService.saveAction(this.currentExecutionId, {
                action_type: 'ask_user',
                action_payload: { value: action.value, user_reply: userResponse }
              }).catch(e => console.error(e));
            }

            await this.updateBackendExecution('running', this.llmActionHistory);
            continue;
          } else {
            this.stream.emit('status', `⏱️ No response received. Stopping.`);
            this.isRunning = false;
            this.stream.emit('task_failed', { task: { description: 'Waiting for Input' }, error: 'Execution terminated' });
            await this.updateBackendExecution('failed', this.llmActionHistory);
            break;
          }
        }

        const description = action.description || action.action_type;
        this.stream.emit('action_start', { type: action.action_type, selector: action.selector || '', description });

        if (!this.isRunning) break;

        this.stream.emit('status', `⚡ Executing: ${description}`);

        // Save Checkpoint before execution
        if (this.currentExecutionId) {
          aiAgentService.saveCheckpoint(this.currentExecutionId, {
            checkpoint_data: {
              iteration: this.llmIteration,
              url: window.location.href,
              action_type: action.action_type,
              selector: action.selector,
              value: action.value
            }
          }).catch(e => console.error(e));
        }

        let success = true;
        try {
          await this.executeLLMAction(action);
          this.stream.emit('action_complete', { type: action.action_type, description });
        } catch (error: any) {
          success = false;
          this.stream.emit('status', `❌ Action failed: ${error.message}`);
        }

        const historyItem = {
          ...action,
          ...(success ? {} : { error: 'Action failed' }),
        };
        this.llmActionHistory.push(historyItem);

        // Save Action to backend
        if (this.currentExecutionId) {
          aiAgentService.saveAction(this.currentExecutionId, {
            action_type: action.action_type,
            action_payload: historyItem
          }).catch(e => console.error(e));
        }

        await this.updateBackendExecution('running', this.llmActionHistory);

        const currentUrl = window.location.href;
        const isOnPipeline = currentUrl.includes('/AIInterviews') || currentUrl.includes('/recruiter/AIInterviews');
        const hasReturnedToPipeline = this.llmActionHistory.some(
          a => a.selector === 'return-to-pipeline-button' && a.action_type === 'click'
        );

        if (isOnPipeline && hasReturnedToPipeline && this.llmIteration > 3) {
          this.stream.emit('status', `✅ Full flow completed. Returned to pipeline. Stopping.`);
          this.stream.emit('goal_complete', this.llmGoal);
          await this.updateBackendExecution('success', this.llmActionHistory);
          break;
        }

        const waitTime = action.wait_after_ms || 1000;
        if (waitTime > 0) {
          await this.wait(waitTime);
        }
      }

      if (this.llmIteration >= AgentController.MAX_LLM_ITERATIONS) {
        this.stream.emit('status', `⚠️ Reached max iterations (${AgentController.MAX_LLM_ITERATIONS}). Stopping.`);
        await this.updateBackendExecution('failed', this.llmActionHistory);
      }

    } catch (error: any) {
      this.stream.emit('task_failed', { task: { description: this.llmGoal }, error: error.message });
      await this.updateBackendExecution('failed', this.llmActionHistory);
    } finally {
      this.isRunning = false;
      this._isLLMMode = false;
      this._isWaitingForUser = false;
      if (typeof window !== 'undefined') {
        const activeTabId = localStorage.getItem('agent_active_tab_id');
        if (activeTabId === this.getTabId()) {
          localStorage.removeItem('agent_active_tab_id');
        }
      }
    }
  }

  private async executeLLMAction(action: LLMAction): Promise<void> {
    switch (action.action_type) {
      case 'click':
        if (!action.selector) throw new Error('No selector for click');
        await this.executor.execute({ type: 'click', selector: action.selector });
        break;

      case 'type':
        if (!action.selector || action.value === undefined) throw new Error('No selector/value for type');
        await this.executor.execute({ type: 'type', selector: action.selector, value: action.value });
        break;

      case 'select':
        if (!action.selector || action.value === undefined) throw new Error('No selector/value for select');
        await this.executor.execute({ type: 'select', selector: action.selector, value: action.value });
        break;

      case 'scroll':
        await this.executor.execute({ type: 'scroll', direction: 'down', amount: 400 });
        break;

      case 'wait':
        break;

      case 'open_new_tab':
        if (!action.value) throw new Error('No URL for open_new_tab');

        // Pass execution ID in URL query parameters for stateless recovery
        const targetUrl = new URL(action.value, window.location.origin);
        if (this.currentExecutionId) {
          targetUrl.searchParams.set('execution_id', this.currentExecutionId);
        }

        if (typeof window !== 'undefined') {
          const activeTabId = localStorage.getItem('agent_active_tab_id');
          if (activeTabId === this.getTabId()) {
            localStorage.removeItem('agent_active_tab_id');
          }
        }

        window.open(targetUrl.toString(), '_blank');
        this.stream.emit('status', 'Handing over execution to new tab...');
        this.isRunning = false;
        break;

      case 'navigate':
        if (!action.value) throw new Error('No path for navigate');
        
        // Pass execution ID to next page
        const navUrl = new URL(action.value, window.location.origin);
        if (this.currentExecutionId) {
          navUrl.searchParams.set('execution_id', this.currentExecutionId);
        }
        
        window.location.href = navUrl.toString();
        break;

      case 'click-skill':
        if (!action.value) throw new Error('No skill name for click-skill');
        await this.executor.execute({ type: 'click-skill', value: action.value });
        break;

      default:
        console.warn(`[AgentController] Unknown LLM action type: ${action.action_type}`);
    }
  }

  public sendPlaywrightResponse(response: string) {
    this._userResponse = response;
    this._isWaitingForUser = false;

    if (!this._isLLMMode) {
      this.isRunning = false;
      this.startGoal(`Regarding my previous request: ${this.lastQuestion}\nUser Reply: ${response}`);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async createBackendExecution(goal: string, plan?: any) {
    try {
      // 1. Create backend Goal record
      const goalRes = await aiAgentService.createGoal({
        goal,
        goal_type: this.shouldUseLLM(goal) ? 'autonomous' : 'legacy',
        status: 'running',
        priority: 'medium'
      });

      // 2. Create Execution record
      const res = await aiAgentService.createExecution({
        agent_type: 'browser_agent',
        status: 'running',
        actions_performed: [],
        metadata: { goal, plan: plan || null, goal_id: goalRes.id }
      });
      
      if (res && res.id) {
        this.currentExecutionId = res.id;
        AgentMemory.getInstance().setExecutionId(res.id);
        
        // Link execution to goal
        await aiAgentService.updateExecution(res.id, {
          goal: goalRes.id
        });
      }
    } catch (e) {
      console.error('Failed to create backend execution record:', e);
    }
  }

  private async updateBackendExecution(status: string, actions?: any[]) {
    if (!this.currentExecutionId) return;
    try {
      const data: any = { status };
      if (actions) {
        data.actions_performed = actions.map(a => ({
          type: a.action_type || a.type,
          selector: a.selector || '',
          value: a.value || '',
          description: a.description || ''
        }));
      }
      if (status === 'success' || status === 'failed') {
        data.completed_at = new Date().toISOString();
        // Disconnect memory context
        AgentMemory.getInstance().setExecutionId(null);
      }
      await aiAgentService.updateExecution(this.currentExecutionId, data);
      if (status === 'success' || status === 'failed') {
        this.currentExecutionId = null;
      }
    } catch (e) {
      console.error('Failed to update backend execution record:', e);
    }
  }

  private loadPersistedPlan() {
    // Legacy compatibility for run execution state rehydration
    if (this.currentPlan && this.isRunning) {
      this.executePlan();
    }
  }

  private async executePlan() {
    if (!this.currentPlan) return;

    for (const task of this.currentPlan.tasks) {
      if (task.status === 'completed' || task.status === 'failed') continue;

      this.stream.emit('task_start', task);
      task.status = 'running';

      try {
        const startIndex = task.currentActionIndex || 0;

        for (let i = startIndex; i < task.actions.length; i++) {
          if (!this.isRunning) return;

          const action = task.actions[i];
          task.currentActionIndex = i;

          this.stream.emit('action_start', action);

          if (!this.isRunning) break;

          await this.executor.execute(action);
          this.memory.remember('action', action);
          this.stream.emit('action_complete', action);

          const historyItem = {
            action_type: action.type,
            selector: action.selector || '',
            value: action.value || '',
            description: action.description || action.message || action.type
          };
          this.legacyActionHistory.push(historyItem);

          if (this.currentExecutionId) {
            aiAgentService.saveAction(this.currentExecutionId, {
              action_type: action.type,
              action_payload: historyItem
            }).catch(e => console.error(e));
          }

          await this.updateBackendExecution('running', this.legacyActionHistory);

          if (action.type === 'ask_user') {
            this.lastQuestion = action.message || '';
            task.status = 'paused';
            this.stream.emit('task_paused', task);
            this.isRunning = false;
            await this.updateBackendExecution('running', this.legacyActionHistory);
            return;
          }

          if (action.type === 'open_new_tab') {
            let isPausedAtThisIndex = false;
            if (typeof window !== 'undefined') {
              isPausedAtThisIndex = sessionStorage.getItem('agent_paused_tab_transition') === i.toString();
            }

            if (!isPausedAtThisIndex) {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('agent_paused_tab_transition', i.toString());
              }
              task.status = 'paused';
              this.stream.emit('status', `🔔 Phase Completed. Ready to proceed to the next tab.`);
              this.stream.emit('task_paused', task);

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('agent-ask-user', {
                  detail: {
                    message: `AI Screening completed successfully! 📊 Would you like to proceed to the Interview Pipeline (${action.value}) now? Click the Play (Continue) button in the sidebar to proceed.`,
                    options: ['Click the Play/Continue button to proceed']
                  }
                }));
              }

              this.isRunning = false;
              await this.updateBackendExecution('running', this.legacyActionHistory);
              return;
            }

            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('agent_paused_tab_transition');
            }

            const targetUrl = new URL(action.value, window.location.origin);
            if (this.currentExecutionId) {
              targetUrl.searchParams.set('execution_id', this.currentExecutionId);
            }

            task.currentActionIndex = i + 1;
            task.status = 'paused';
            this.stream.emit('status', 'Continuing execution on new page...');
            this.isRunning = false;
            
            window.open(targetUrl.toString(), '_blank');
            return;
          }

          task.currentActionIndex = i + 1;
        }

        task.status = 'completed';
        this.stream.emit('task_complete', task);
      } catch (error) {
        task.status = 'failed';
        this.stream.emit('task_failed', { task, error: (error as Error).message });
        this.isRunning = false;
        
        const errItem = {
          action_type: 'error',
          description: `Task failed: ${(error as Error).message}`
        };
        this.legacyActionHistory.push(errItem);

        if (this.currentExecutionId) {
          aiAgentService.saveAction(this.currentExecutionId, {
            action_type: 'error',
            action_payload: errItem
          }).catch(e => console.error(e));
        }

        await this.updateBackendExecution('failed', this.legacyActionHistory);
        return;
      }
    }

    this.isRunning = false;
    this.stream.emit('goal_complete', this.originalGoal || this.currentPlan.goal);
    await this.updateBackendExecution('success', this.legacyActionHistory);
  }

  public stop() {
    this.isRunning = false;
    this._isWaitingForUser = false;
    this._isLLMMode = false;
    if (typeof window !== 'undefined') {
      const activeTabId = localStorage.getItem('agent_active_tab_id');
      if (activeTabId === this.getTabId()) {
        localStorage.removeItem('agent_active_tab_id');
      }
    }
    this.stream.emit('status', 'Agent stopped');
  }

  public get isPlaywrightMode(): boolean {
    return this._isLLMMode;
  }
}

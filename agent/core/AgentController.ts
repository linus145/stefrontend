
import { AgentPlanner, AgentPlan } from '@/agent/planner/AgentPlanner';
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

/**
 * AgentController — orchestrates both:
 *  1. Legacy DOM-based agent (for simple tasks like job posting)
 *  2. LLM-powered observe→think→act loop (for complex autonomous tasks)
 * 
 * The LLM mode runs ENTIRELY in-browser:
 *  - StateObserver captures the page state
 *  - Backend LLM planner (Gemini) decides the next action
 *  - AgentExecutor executes the action in the DOM
 *  - Loop until done
 */
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
    
    this.loadLLMContext();
    this.checkCrossTabContinuation();
    this.loadPersistedPlan();

    // Sync across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'agent_active_plan' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          this.currentPlan = parsed.plan;
        }
      });
    }
  }

  public static getInstance(): AgentController {
    if (!AgentController.instance) {
      AgentController.instance = new AgentController();
    }
    return AgentController.instance;
  }

  /**
   * Detect if this goal should use the LLM-powered agent.
   * Complex tasks that involve navigation, interview pipeline,
   * or multi-step flows benefit from the AI-driven agent.
   * NOTE: UUID goals should NOT use LLM — they go through the legacy 
   * screening plan first. LLM mode is only for cross-tab continuation
   * (interview config in Tab 2) or explicit interview commands.
   */
  private shouldUseLLM(goal: string): boolean {
    if (!goal) return false;
    const lower = goal.toLowerCase();

    // UUID goals → ALWAYS use legacy plan (screening → open tab → handover)
    const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    if (uuidPattern.test(goal)) return false;

    // Only use LLM for explicit interview config keywords 
    // (typically when user is ALREADY on the AI Interviews page)
    const llmKeywords = [
      'configure', 'reconfigure',
      'orchestrate', 'dispatch',
      'autonomous interview', 'interview setup',
      'pipeline', 'candidate', 'architecture'
    ];
    return llmKeywords.some(kw => lower.includes(kw));
  }

  public get isLLMMode(): boolean {
    return this._isLLMMode;
  }

  public async startGoal(goal: string) {
    if (this.isRunning) return;
    this.isRunning = true;

    // Track original goal for clean completion message
    // If it's a continuation, we keep the existing originalGoal
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
      await this.createBackendExecution(goal);
      const plan = await this.planner.generatePlan(goal);
      
      if (!this.isRunning) return; // Stop if user cancelled during planning
      
      this.currentPlan = plan;
      this.memory.remember('decision', { goal, plan: this.currentPlan });
      this.persistPlan();
      this.executePlan();
    }
  }

  public stopAgent() {
    this.isRunning = false;
    localStorage.removeItem('agent_llm_context'); // Clear memory on manual stop
    this.stream.emit('task_failed', { task: { description: 'Manual Stop' }, error: 'Execution terminated' });
  }

  public async resumeAgent() {
    if (this.isRunning) return;
    
    // Safety check: if no state exists, we can't resume
    if (!this.llmGoal && !this.currentPlan) {
      this.stream.emit('status', `⚠️ No active task found to resume.`);
      return;
    }

    this.isRunning = true;

    if (this._isLLMMode && this.llmGoal) {
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

  // ── LLM-Powered Observe → Think → Act Loop ──────────────────

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

        // Small delay to let page settle after last action
        await this.wait(800);
 
        // 1. OBSERVE — capture current page state
        const pageState = this.observer.capture();
        this.stream.emit('status', `📸 Captured ${pageState.visible_elements.length} elements | ${pageState.active_step || pageState.url}`);

        // 2. THINK — ask backend LLM for next action
        if (!this.isRunning) break; // STOP CHECK: Before thinking
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
          // Clear user response after using it once
          userResponse = undefined;
        } catch (error: any) {
          this.stream.emit('status', `⚠️ LLM request failed: ${error.message}. Retrying...`);
          await this.wait(3000);
          continue;
        }

        // Show the LLM's thinking
        if (action.thinking) {
          this.stream.emit('status', `🧠 ${action.thinking}`);
          try {
            await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: `🧠 [Thinking]: ${action.thinking}` });
          } catch (e) {
            console.error("Failed to save agent thinking to chat history:", e);
          }
        }

        // 3. CHECK — is the goal complete?
        if (action.action_type === 'done') {
          this.stream.emit('goal_complete', this.llmGoal);
          localStorage.removeItem('agent_llm_context'); // Clear memory on completion
          await this.updateBackendExecution('success', this.llmActionHistory);
          break;
        }

        // 4. CHECK — does the LLM need user input?
        if (action.action_type === 'ask_user') {
          this.stream.emit('status', `❓ Agent is asking you a question...`);
          this._isWaitingForUser = true;
          this._userResponse = null;

          // Save agent's question to conversational chat history
          try {
            await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: `🤖 [Autonomous Question]: ${action.value}` });
          } catch (e) {
            console.error("Failed to save agent question to chat history:", e);
          }

          // Dispatch event so the sidebar shows the question
          window.dispatchEvent(new CustomEvent('agent-ask-user', {
            detail: { 
              message: action.value || 'I need more information.',
              options: action.options || []
            }
          }));

          // Wait for user response (poll every 500ms, max 5 min)
          const waitStart = Date.now();
          while (this._isWaitingForUser && (Date.now() - waitStart) < 300000) {
            await this.wait(500);
          }

          if (this._userResponse) {
            const reply = this._userResponse;
            this.stream.emit('status', `✅ User responded: "${reply}"`);
            userResponse = reply;
            this._userResponse = null;

            // Save user response to conversational chat history
            try {
              await api.post('/autonomousagent1/chat/history/', { sender: 'user', text: reply });
            } catch (e) {
              console.error("Failed to save user response to chat history:", e);
            }

            // Record in history
            this.llmActionHistory.push({
              action_type: 'ask_user',
              value: action.value,
              description: `Asked user: ${action.value} → User said: ${userResponse}`,
            });
            await this.updateBackendExecution('running', this.llmActionHistory);
            continue; // Go back to THINK with user's response
          } else {
            this.stream.emit('status', `⏱️ No response received. Stopping.`);
            this.isRunning = false;
            this.stream.emit('task_failed', { task: { description: 'Waiting for Input' }, error: 'Execution terminated' });
            await this.updateBackendExecution('failed', this.llmActionHistory);
            break;
          }
        }

        // 5. ACT — execute the action via DOM executor
        const description = action.description || action.action_type;
        this.stream.emit('action_start', { type: action.action_type, selector: action.selector || '', description });
        
        if (!this.isRunning) break; // STOP CHECK: Before execution

        this.stream.emit('status', `⚡ Executing: ${description}`);

        let success = true;
        try {
          await this.executeLLMAction(action);
          this.stream.emit('action_complete', { type: action.action_type, description });
        } catch (error: any) {
          success = false;
          this.stream.emit('status', `❌ Action failed: ${error.message}`);
        }

        // Record in history
        this.llmActionHistory.push({
          ...action,
          ...(success ? {} : { error: 'Action failed' }),
        });
        await this.updateBackendExecution('running', this.llmActionHistory);

        // AUTO-STOP: If we just returned to the pipeline page after a full flow, STOP.
        // This prevents the agent from looping after a successful dispatch + return.
        const currentUrl = window.location.href;
        const isOnPipeline = currentUrl.includes('/AIInterviews') || currentUrl.includes('/recruiter/AIInterviews');
        const hasReturnedToPipeline = this.llmActionHistory.some(
          a => a.selector === 'return-to-pipeline-button' && a.action_type === 'click'
        );
        
        if (isOnPipeline && hasReturnedToPipeline && this.llmIteration > 3) {
          this.stream.emit('status', `✅ Full flow completed. Returned to pipeline. Stopping.`);
          this.stream.emit('goal_complete', this.llmGoal);
          localStorage.removeItem('agent_llm_context');
          await this.updateBackendExecution('success', this.llmActionHistory);
          break;
        }

        // Wait after action
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
      const finalStatus = this.llmActionHistory.some(a => a.error) ? 'failed' : 'success';
      await this.updateBackendExecution(finalStatus, this.llmActionHistory);
    }
  }

  /**
   * Execute a single LLM-decided action using the existing DOM executor.
   */
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
        // Wait is handled by the wait_after_ms field
        break;

      case 'open_new_tab':
        if (!action.value) throw new Error('No URL for open_new_tab');
        
        // Save continuation for the NEW tab to pick up
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_cross_tab_continuation', JSON.stringify({
            goal: this.llmGoal, // Keep the current goal
            timestamp: Date.now(),
            sourceUrl: window.location.href,
          }));
        }

        window.open(action.value, '_blank');
        this.stream.emit('status', 'Handing over execution to new tab...');
        this.isRunning = false; // Stop in current tab
        break;

      case 'navigate':
        if (!action.value) throw new Error('No path for navigate');
        this.persistLLMContext();
        window.location.href = action.value;
        break;

      default:
        console.warn(`[AgentController] Unknown LLM action type: ${action.action_type}`);
    }
  }

  private persistLLMContext() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('agent_llm_context', JSON.stringify({
      goal: this.llmGoal,
      originalGoal: this.originalGoal,
      history: this.llmActionHistory,
      timestamp: Date.now()
    }));
  }

  private loadLLMContext() {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem('agent_llm_context');
    if (!data) return;

    try {
      const context = JSON.parse(data);
      const age = Date.now() - (context.timestamp || 0);

      // Only pick up if it's very fresh (less than 30s)
      if (age < 30000) {
        this.originalGoal = context.originalGoal || context.goal;
        this.llmActionHistory = context.history || [];
        localStorage.removeItem('agent_llm_context'); // Clear it so we don't loop
        
        this.stream.emit('status', `🔄 Resuming autonomous goal: ${this.originalGoal}`);
        setTimeout(() => {
          if (!this.isRunning) {
            this.isRunning = true;
            this._isLLMMode = true;
            this.runLLMLoop(context.goal);
          }
        }, 1000);
      } else {
        localStorage.removeItem('agent_llm_context');
      }
    } catch (e) {
      localStorage.removeItem('agent_llm_context');
    }
  }

  /**
   * Called when the user provides a response to an agent question (LLM mode).
   */
  public sendPlaywrightResponse(response: string) {
    this._userResponse = response;
    this._isWaitingForUser = false;

    // If we are NOT in LLM mode (Legacy), we need to re-trigger the plan generation
    // based on the user's answer.
    if (!this._isLLMMode) {
      this.isRunning = false; // Reset to allow startGoal to run
      this.startGoal(`Regarding my previous request: ${this.lastQuestion}\nUser Reply: ${response}`);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async createBackendExecution(goal: string) {
    try {
      const res = await aiAgentService.createExecution({
        agent_type: 'browser_agent',
        status: 'running',
        actions_performed: [],
        metadata: { goal }
      });
      if (res && res.id) {
        this.currentExecutionId = res.id;
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
      }
      await aiAgentService.updateExecution(this.currentExecutionId, data);
    } catch (e) {
      console.error('Failed to update backend execution record:', e);
    }
  }

  /**
   * Check if another tab left a continuation goal for us.
   * This is how the agent "follows" across tabs:
   *   Tab 1 (recruiter dashboard) → completes screening → opens AI Interviews in Tab 2
   *   Tab 1 saves continuation goal to localStorage
   *   Tab 2 loads → AgentController initializes → calls this method
   *   This method finds the goal → auto-starts the LLM agent loop
   */
  private checkCrossTabContinuation() {
    if (typeof window === 'undefined') return;

    const data = localStorage.getItem('agent_cross_tab_continuation');
    if (!data) return;

    try {
      const continuation = JSON.parse(data);
      const age = Date.now() - (continuation.timestamp || 0);

      // Only pick up continuations that are less than 5 minutes old
      if (age > 5 * 60 * 1000) {
        // console.log('[AgentController] Cross-tab continuation expired, ignoring');
        localStorage.removeItem('agent_cross_tab_continuation');
        return;
      }

      // Allow same-page continuation if it's very recent (less than 30s) to handle reloads
      if (continuation.sourceUrl && window.location.href === continuation.sourceUrl && age > 30000) {
        // console.log('[AgentController] Same page as source and not a fresh reload, ignoring');
        return;
      }

      // Clear it immediately so we don't pick it up again
      localStorage.removeItem('agent_cross_tab_continuation');

      // console.log('[AgentController] 🔄 Cross-tab continuation detected! Starting LLM agent...');
      this.stream.emit('status', '🔄 Agent handover detected from previous tab — continuing autonomously...');

      // Give the page a moment to fully render before starting
      setTimeout(() => {
        if (!this.isRunning) {
          this.isRunning = true;
          this._isLLMMode = true;
          this.runLLMLoop(continuation.goal);
        }
      }, 1000);

    } catch (e) {
      // console.error('[AgentController] Failed to parse cross-tab continuation:', e);
      localStorage.removeItem('agent_cross_tab_continuation');
    }
  }

  // ── Legacy DOM Agent (unchanged) ─────────────────────────────

  private persistPlan() {
    if (typeof window !== 'undefined' && this.currentPlan) {
      localStorage.setItem('agent_active_plan', JSON.stringify({
        plan: this.currentPlan,
        isRunning: this.isRunning
      }));
    }
  }

  private loadPersistedPlan() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('agent_active_plan');
      if (data) {
        const parsed = JSON.parse(data);
        this.currentPlan = parsed.plan;
        if (parsed.isRunning && this.currentPlan) {
          this.isRunning = true;
          this.executePlan();
        }
      }
    }
  }

  private clearPersistedPlan() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agent_active_plan');
    }
  }

  private async executePlan() {
    if (!this.currentPlan) return;

    for (const task of this.currentPlan.tasks) {
      if (task.status === 'completed' || task.status === 'failed') continue;

      this.stream.emit('task_start', task);
      task.status = 'running';
      this.persistPlan();

      try {
        const startIndex = task.currentActionIndex || 0;
        
        for (let i = startIndex; i < task.actions.length; i++) {
          if (!this.isRunning) return; // Immediate stop check

          const action = task.actions[i];
          task.currentActionIndex = i;
          
          this.stream.emit('action_start', action);
          
          if (!this.isRunning) break; // Check before executing
          
          await this.executor.execute(action);
          this.memory.remember('action', action);
          this.stream.emit('action_complete', action);

          this.legacyActionHistory.push({
            action_type: action.type,
            selector: action.selector || '',
            value: action.value || '',
            description: action.description || action.message || action.type
          });
          await this.updateBackendExecution('running', this.legacyActionHistory);

          if (action.type === 'ask_user') {
            this.lastQuestion = action.message || '';
            try {
              await api.post('/autonomousagent1/chat/history/', { sender: 'bot', text: `🤖 [Plan Question]: ${this.lastQuestion}` });
            } catch (e) {
              console.error("Failed to save agent plan question to chat history:", e);
            }
            task.status = 'paused';
            this.persistPlan();
            this.stream.emit('task_paused', task);
            this.isRunning = false;
            await this.updateBackendExecution('running', this.legacyActionHistory);
            return; 
          }

          if (action.type === 'open_new_tab') {
            // Save a continuation goal for the new tab to pick up
            const continuationGoal = `You are now in the Interview Pipeline. 
1. Click 'Sync Pipeline' (data-agent="sync-pipeline-button") first.
2. Observe the candidates (data-agent="candidate-name") and their roles.
3. ASK THE USER: "Which candidate would you like to configure the interview for?"
4. Wait for the user's response. Once identified, click the 'Configure' or 'Reconfigure' button (data-agent="configure-interview-button") for that specific candidate.
5. In the Architecture step, read the job title (data-agent="target-job-title").
6. Based on the job title and seniority (e.g., 'Senior', 'Frontend', 'Backend'), autonomously select the most appropriate interview rounds. Add them using the 'Add' button (data-agent="add-round-button") and configure them (Strategy, Depth, Format).
7. If the user mentioned a specific number of rounds or types, respect those instructions first.
8. If unsure about the perfect round types for this specific role, ASK THE USER for advice.
9. Be fast, precise, and professional.`;
            if (typeof window !== 'undefined') {
              localStorage.setItem('agent_cross_tab_continuation', JSON.stringify({
                goal: continuationGoal,
                timestamp: Date.now(),
                sourceUrl: window.location.href,
              }));
            }

            task.currentActionIndex = i + 1;
            task.status = 'paused';
            this.persistPlan();
            this.stream.emit('status', 'Continuing execution on new page...');
            this.isRunning = false;
            await this.updateBackendExecution('running', this.legacyActionHistory);
            return;
          }

          task.currentActionIndex = i + 1;
          this.persistPlan();
        }
        
        task.status = 'completed';
        this.persistPlan();
        this.stream.emit('task_complete', task);
      } catch (error) {
        task.status = 'failed';
        this.persistPlan();
        this.stream.emit('task_failed', { task, error: (error as Error).message });
        this.isRunning = false;
        this.legacyActionHistory.push({
          action_type: 'error',
          description: `Task failed: ${(error as Error).message}`
        });
        await this.updateBackendExecution('failed', this.legacyActionHistory);
        return;
      }
    }

    this.isRunning = false;
    this.clearPersistedPlan();
    this.stream.emit('goal_complete', this.originalGoal || this.currentPlan.goal);
    await this.updateBackendExecution('success', this.legacyActionHistory);
  }

  public stop() {
    this.isRunning = false;
    this._isWaitingForUser = false;
    this._isLLMMode = false;
    this.stream.emit('status', 'Agent stopped');
  }

  public get isPlaywrightMode(): boolean {
    return this._isLLMMode;
  }
}

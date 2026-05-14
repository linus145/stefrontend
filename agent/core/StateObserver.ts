/**
 * StateObserver — Captures the current page state for the LLM to analyze.
 * 
 * This runs inside the user's browser and gathers:
 * - Current URL and page title
 * - All visible interactive elements with their data-agent selectors
 * - Active step indicators (for multi-step wizards)
 * - Toast/alert messages
 * - Modal/dialog presence
 * 
 * The captured state is sent to the backend LLM planner which
 * uses Gemini to decide the next action.
 */

export interface RoundSnapshot {
  index: number;
  designation: string;
  designation_label: string;
  strategy_tier: string;
  difficulty: string;
  question_format: string;
  question_count: number;
  timer_seconds: number;
  has_questions: boolean;
  questions_preview: string[];  // First 3 question texts for context
}

export interface PipelineCandidate {
  index: number;
  candidate_name: string;
  job_title: string;
  status: string;
  rounds_count: string;
  is_orchestrated: boolean;  // true = Reconfigure, false = Configure
  has_exam_credentials: boolean;
}

export interface PageState {
  url: string;
  title: string;
  active_step: string | null;
  has_modal: boolean;
  toasts: string[];
  visible_elements: VisibleElement[];
  existing_rounds: RoundSnapshot[];  // Structured round data for the LLM
  pipeline_candidates: PipelineCandidate[];  // All candidates in the pipeline table
}

export interface VisibleElement {
  tag: string;
  data_agent: string;
  text: string;
  disabled: boolean;
  type: string;        // input type or element role
  value: string;       // current value for inputs
  placeholder: string; // placeholder text
  checked?: boolean;    // For checkboxes and radio buttons
  selected?: boolean;   // For options
  options?: { value: string; text: string }[]; // For select elements
}

export class StateObserver {
  private static instance: StateObserver;

  private constructor() {}

  public static getInstance(): StateObserver {
    if (!StateObserver.instance) {
      StateObserver.instance = new StateObserver();
    }
    return StateObserver.instance;
  }

  /**
   * Capture the current page state.
   * This is called before each "think" step to give the LLM context.
   */
  public capture(): PageState {
    return {
      url: window.location.href,
      title: document.title,
      active_step: this.detectActiveStep(),
      has_modal: this.detectModal(),
      toasts: this.captureToasts(),
      visible_elements: this.captureVisibleElements(),
      existing_rounds: this.captureExistingRounds(),
      pipeline_candidates: this.capturePipelineCandidates(),
    };
  }

  /**
   * Capture all visible interactive elements with their data-agent selectors.
   */
  private captureVisibleElements(): VisibleElement[] {
    const elements: VisibleElement[] = [];
    const seen = new Set<string>();
    const agentCounts = new Map<string, number>();  // Track duplicate data-agent counts

    // 1. All data-agent elements (highest priority)
    // IMPORTANT: Allow duplicates with auto-indexing (e.g., candidate-name, candidate-name-1, etc.)
    document.querySelectorAll('[data-agent]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return; // Skip hidden elements
      
      const baseAgent = el.getAttribute('data-agent') || '';
      
      // Handle duplicate data-agent values by appending index
      let agent = baseAgent;
      const count = agentCounts.get(baseAgent) || 0;
      if (count > 0) {
        agent = `${baseAgent}-${count}`;  // e.g., candidate-name-1, candidate-name-2
      }
      agentCounts.set(baseAgent, count + 1);
      
      const elementData: VisibleElement = {
        tag: el.tagName.toLowerCase(),
        data_agent: agent,
        text: (el.textContent || '').trim().substring(0, 120),
        disabled: (el as HTMLButtonElement).disabled || false,
        type: el.getAttribute('type') || el.getAttribute('role') || '',
        value: (el as HTMLInputElement).value || '',
        placeholder: el.getAttribute('placeholder') || '',
        checked: (el as HTMLInputElement).checked || false,
      };

      // Capture options for select elements with data-agent
      if (el.tagName.toLowerCase() === 'select') {
        elementData.text = (el as HTMLSelectElement).selectedOptions?.[0]?.text || '';
        elementData.options = Array.from((el as HTMLSelectElement).options).map(o => ({ value: o.value, text: o.text }));
      }

      elements.push(elementData);
      seen.add(agent);
    });

    // 2. Important buttons/links without data-agent (limited set)
    document.querySelectorAll('button, a[role="button"], [role="tab"]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;
      
      const text = (el.textContent || '').trim().substring(0, 80);
      if (!text || text.length < 2) return;
      
      // Skip if already captured via data-agent
      const agent = el.getAttribute('data-agent');
      if (agent && seen.has(agent)) return;
      
      // Create a unique key to avoid duplicates
      const key = `btn_${text.substring(0, 30)}`;
      if (seen.has(key)) return;
      
      elements.push({
        tag: el.tagName.toLowerCase(),
        data_agent: agent || '',
        text,
        disabled: (el as HTMLButtonElement).disabled || false,
        type: el.getAttribute('type') || el.getAttribute('role') || 'button',
        value: '',
        placeholder: '',
      });
      seen.add(key);
    });

    // 3. Visible form inputs (limited set)
    document.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;
      
      const agent = el.getAttribute('data-agent');
      if (agent && seen.has(agent)) return;
      
      const id = el.id || el.getAttribute('name') || '';
      const key = `input_${agent || id || Math.random().toString(36).substr(2, 5)}`;
      if (seen.has(key)) return;
      
      elements.push({
        tag: el.tagName.toLowerCase(),
        data_agent: agent || '',
        text: (el as HTMLSelectElement).selectedOptions?.[0]?.text || '',
        disabled: (el as HTMLInputElement).disabled || false,
        type: el.getAttribute('type') || el.tagName.toLowerCase(),
        value: (el as HTMLInputElement).value || '',
        placeholder: el.getAttribute('placeholder') || '',
        checked: (el as HTMLInputElement).checked || false,
        selected: (el as HTMLOptionElement).selected || false,
        options: el.tagName.toLowerCase() === 'select' 
          ? Array.from((el as HTMLSelectElement).options).map(o => ({ value: o.value, text: o.text }))
          : undefined
      });
      seen.add(key);
    });

    // 4. Key text content (step headers, status indicators, etc.)
    document.querySelectorAll('h1, h2, h3, [data-agent-role]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;
      
      const text = (el.textContent || '').trim().substring(0, 120);
      if (!text || text.length < 3) return;
      
      const key = `heading_${text.substring(0, 30)}`;
      if (seen.has(key)) return;
      
      elements.push({
        tag: el.tagName.toLowerCase(),
        data_agent: el.getAttribute('data-agent') || el.getAttribute('data-agent-role') || '',
        text,
        disabled: false,
        type: 'heading',
        value: '',
        placeholder: '',
      });
      seen.add(key);
    });

    return elements.slice(0, 80); // Increased to 80 to capture all pipeline + round elements
  }

  /**
   * Capture structured data about ALL candidates in the pipeline table.
   * This ensures the LLM sees every single candidate, not just the first.
   */
  private capturePipelineCandidates(): PipelineCandidate[] {
    const candidates: PipelineCandidate[] = [];
    
    // Find all table rows in the pipeline
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
      const nameEl = row.querySelector('[data-agent="candidate-name"]');
      if (!nameEl) return; // Skip non-candidate rows (loading skeletons, empty state)
      
      const candidateName = nameEl.textContent?.trim() || 'Unknown';
      
      // Get job title from the next cell
      const cells = row.querySelectorAll('td');
      const jobTitle = cells[1]?.textContent?.trim() || '';
      const statusText = cells[2]?.textContent?.trim() || '';
      const roundsCount = cells[3]?.textContent?.trim() || '0';
      
      // Check the action button to determine if orchestrated
      const configButton = row.querySelector('[data-agent="configure-interview-button"]');
      const buttonText = configButton?.textContent?.trim() || '';
      const isOrchestrated = buttonText.toLowerCase() === 'reconfigure';
      
      // Check for exam credentials
      const hasExamCreds = !!row.querySelector('.font-mono');
      
      candidates.push({
        index,
        candidate_name: candidateName,
        job_title: jobTitle,
        status: statusText,
        rounds_count: roundsCount,
        is_orchestrated: isOrchestrated,
        has_exam_credentials: hasExamCreds,
      });
    });

    return candidates;
  }

  /**
   * Capture structured data about existing interview rounds.
   * This gives the LLM a clear picture of what rounds already exist,
   * their configuration, and whether they have questions.
   */
  private captureExistingRounds(): RoundSnapshot[] {
    const rounds: RoundSnapshot[] = [];
    let index = 0;

    while (true) {
      const designationSelect = document.querySelector(`[data-agent="round-designation-select-${index}"]`) as HTMLSelectElement;
      if (!designationSelect) break; // No more rounds

      const strategySelect = document.querySelector(`[data-agent="strategy-tier-select-${index}"]`) as HTMLSelectElement;
      const difficultySelect = document.querySelector(`[data-agent="evaluation-depth-select-${index}"]`) as HTMLSelectElement;
      const formatSelect = document.querySelector(`[data-agent="question-format-select-${index}"]`) as HTMLSelectElement;
      const countInput = document.querySelector(`[data-agent="question-count-input-${index}"]`) as HTMLInputElement;
      const timerInput = document.querySelector(`[data-agent="allocated-time-input-${index}"]`) as HTMLInputElement;

      // Count questions for this round: look for question textareas within the round's container
      const roundContainer = designationSelect.closest('[class*="rounded-sm border"]');
      const questionTextareas = roundContainer
        ? roundContainer.querySelectorAll('[data-agent="question-text-textarea"]')
        : [];
      
      const questionsPreview: string[] = [];
      questionTextareas.forEach((textarea, i) => {
        if (i < 3) { // Only first 3 for preview
          const text = (textarea as HTMLTextAreaElement).value?.trim();
          if (text) questionsPreview.push(text.substring(0, 100));
        }
      });

      rounds.push({
        index,
        designation: designationSelect.value || '',
        designation_label: designationSelect.selectedOptions?.[0]?.text || '',
        strategy_tier: strategySelect?.value || '',
        difficulty: difficultySelect?.value || '',
        question_format: formatSelect?.value || '',
        question_count: questionTextareas.length,
        timer_seconds: parseInt(timerInput?.value || '600'),
        has_questions: questionTextareas.length > 0,
        questions_preview: questionsPreview,
      });

      index++;
    }

    return rounds;
  }

  /**
   * Detect the active step in a multi-step wizard (like interview configuration).
   */
  private detectActiveStep(): string | null {
    // Look for step indicators with active styling
    const stepButtons = document.querySelectorAll('[class*="opacity-100"]');
    for (const btn of Array.from(stepButtons)) {
      const text = btn.textContent?.trim();
      if (text && ['Candidates', 'Architecture', 'Dispatch'].some(s => text.includes(s))) {
        return text;
      }
    }

    // Check for specific page content
    if (document.querySelector('[data-agent="proceed-to-architecture-button"]')) {
      return 'Step 1: Candidates';
    }
    if (document.querySelector('[data-agent="dispatch-interviews-button"]')) {
      return 'Step 2: Architecture';
    }
    if (document.body.textContent?.includes('Orchestration Complete')) {
      return 'Step 3: Dispatch (Complete)';
    }

    // Check for pipeline view
    if (document.querySelector('[data-agent="sync-pipeline-button"]')) {
      return 'Pipeline View';
    }

    return null;
  }

  /**
   * Detect if a modal/dialog is currently open.
   */
  private detectModal(): boolean {
    return !!document.querySelector('[role="dialog"], [role="alertdialog"], .modal-open');
  }

  /**
   * Capture any visible toast/alert messages.
   */
  private captureToasts(): string[] {
    const toasts: string[] = [];
    
    // Sonner toasts
    document.querySelectorAll('[data-sonner-toast]').forEach((t) => {
      const text = t.textContent?.trim();
      if (text) toasts.push(text);
    });

    // Role alerts
    document.querySelectorAll('[role="alert"]').forEach((t) => {
      const text = t.textContent?.trim();
      if (text) toasts.push(text);
    });

    // Status messages
    document.querySelectorAll('[role="status"]').forEach((t) => {
      const text = t.textContent?.trim();
      if (text) toasts.push(text);
    });

    return toasts.slice(0, 5);
  }
}

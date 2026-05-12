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

export interface PageState {
  url: string;
  title: string;
  active_step: string | null;
  has_modal: boolean;
  toasts: string[];
  visible_elements: VisibleElement[];
}

export interface VisibleElement {
  tag: string;
  data_agent: string;
  text: string;
  disabled: boolean;
  type: string;        // input type or element role
  value: string;       // current value for inputs
  placeholder: string; // placeholder text
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
    };
  }

  /**
   * Capture all visible interactive elements with their data-agent selectors.
   */
  private captureVisibleElements(): VisibleElement[] {
    const elements: VisibleElement[] = [];
    const seen = new Set<string>();

    // 1. All data-agent elements (highest priority)
    document.querySelectorAll('[data-agent]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return; // Skip hidden elements
      
      const agent = el.getAttribute('data-agent') || '';
      if (seen.has(agent)) return;
      seen.has(agent);
      
      elements.push({
        tag: el.tagName.toLowerCase(),
        data_agent: agent,
        text: (el.textContent || '').trim().substring(0, 120),
        disabled: (el as HTMLButtonElement).disabled || false,
        type: el.getAttribute('type') || el.getAttribute('role') || '',
        value: (el as HTMLInputElement).value || '',
        placeholder: el.getAttribute('placeholder') || '',
      });
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

    return elements.slice(0, 40); // Limit to 40 elements to keep payload reasonable
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

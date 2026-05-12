
import { AgentAction } from '@/agent/actions/AgentActionRegistry';

export class AgentExecutor {
  private static instance: AgentExecutor;
  private lastTypedJobUid: string = ''; // Track the UID typed by the agent

  private constructor() { }

  public static getInstance(): AgentExecutor {
    if (!AgentExecutor.instance) {
      AgentExecutor.instance = new AgentExecutor();
    }
    return AgentExecutor.instance;
  }

  public async execute(action: AgentAction): Promise<any> {
    // console.log(`[AgentExecutor] Executing action: ${action.type}`, action);

    // Handle optional actions — if element not found, skip gracefully
    const isOptional = (action as any).optional === true;

    try {
      switch (action.type) {
        case 'click':
          if (!action.selector) throw new Error('Selector is required for click action');
          return await this.handleClick(action.selector);
        case 'type':
          if (!action.selector || action.value === undefined) throw new Error('Selector and value are required for type action');
          return await this.handleType(action.selector, String(action.value));
        case 'select':
          if (!action.selector || action.value === undefined) throw new Error('Selector and value required for select');
          return await this.handleType(action.selector, String(action.value));
        case 'open_new_tab':
          if (!action.value) throw new Error('open_new_tab requires a value (url)');
          // console.log(`[AgentExecutor] Executing open_new_tab to ${action.value}`);
          window.open(action.value, '_blank');
          await this.handleWait(1000);
          break;
        case 'navigate':
          if (!action.path) throw new Error('Path is required for navigate action');
          return await this.handleNavigate(action.path);
        case 'scroll':
          return await this.handleScroll(action.direction || 'down', action.amount);
        case 'wait':
          if (action.duration === undefined) throw new Error('Duration is required for wait action');
          return await this.handleWait(action.duration);
        case 'observe':
          if (!action.selector) throw new Error('Selector is required for observe action');
          return await this.handleObserve(action.selector);
        case 'extract':
          if (!action.selector) throw new Error('Selector is required for extract action');
          return await this.handleExtract(action.selector);
        case 'click-skill':
          if (!action.value) throw new Error('Value (skill name) is required for click-skill action');
          return await this.handleSkill(String(action.value));
        case 'backend_call':
          if (!action.task) throw new Error('Task is required for backend_call action');
          return await this.handleBackendCall(action.task, action);
        case 'status':
          // return console.log(`[Agent Status] ${action.message}`);
          return;
        case 'ask_user':
          this.handleAskUser(action.message || 'I need more information to proceed.');
          return;
        case 'done':
          // console.log('[AgentExecutor] Goal achieved.');
          return;
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    } catch (error: any) {
      if (isOptional) {
        // console.log(`[AgentExecutor] Optional action skipped (${action.type} on ${action.selector}): ${error.message}`);
        return; // Skip gracefully
      }
      throw error; // Re-throw for non-optional actions
    }
  }

  private handleAskUser(message: string): void {
    console.log(`[Agent Question] ${message}`);
    // Dispatch event to UI to show prompt/input
    window.dispatchEvent(new CustomEvent('agent-ask-user', {
      detail: { message }
    }));
    // We don't throw error, but we want the loop to stop. 
    // The Controller will catch this if we return a specific signal.
  }

  private async handleBackendCall(task: string, action: AgentAction): Promise<any> {
    console.log(`[AgentExecutor] Calling backend task: ${task}`);
    const { api } = await import('@/lib/api');
    const result = await api.post('/autonomousagent1/run/', {
      task_type: task,
      job_id: action.job_id,
      target_count: action.target_count
    });

    // After backend screening finishes, tell the UI to refresh results
    // console.log('[AgentExecutor] Backend call completed. Dispatching refresh event...');
    window.dispatchEvent(new CustomEvent('agent-screening-complete', {
      detail: { jobId: action.job_id, task }
    }));

    return result;
  }

  private async handleSkill(skillName: string): Promise<void> {
    const lowerSkill = skillName.toLowerCase().trim();
    // console.log(`[AgentExecutor] Handling skill: ${skillName}`);

    // Helper to find skill button by exact text
    const findSkillButton = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      for (const btn of Array.from(buttons)) {
        if (btn.textContent?.toLowerCase().trim() === lowerSkill) {
          return btn as HTMLElement;
        }
      }
      return null;
    };

    // 1. Ensure dropdown is open
    let searchInput = this.findElement('skills-search-input') as HTMLInputElement;
    if (!searchInput) {
      // console.log('[AgentExecutor] Dropdown not open, clicking trigger...');
      const trigger = this.findElement('skills-dropdown-trigger') as HTMLElement;
      if (trigger) {
        trigger.click();
        await new Promise(r => setTimeout(r, 600)); // Wait for animation
        searchInput = this.findElement('skills-search-input') as HTMLInputElement;
      }
    }

    if (!searchInput) {
      throw new Error('Could not find skills search input even after clicking trigger');
    }

    // 2. Type skill name into search box
    // console.log(`[AgentExecutor] Typing skill name: ${skillName}`);
    searchInput.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    nativeSetter?.call(searchInput, skillName);
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 600)); // Wait for filtering/custom button to appear

    // 3. Try to find the exact skill button in filtered list
    let foundElement = findSkillButton();

    // 4. If not found in list, use the "Add Custom Skill" button
    if (!foundElement) {
      // console.log(`[AgentExecutor] Skill "${skillName}" not in list, looking for custom add button...`);
      foundElement = this.findElement('add-custom-skill-button') as HTMLElement;

      // Verification: double check text if it's the right custom button
      if (foundElement && !foundElement.textContent?.toLowerCase().includes(lowerSkill)) {
        // console.warn('[AgentExecutor] Found custom button but text mismatch, falling back to text search');
        foundElement = null;
      }
    }

    // 5. Final fallback: text search for "Add Custom Skill"
    if (!foundElement) {
      const customSelector = `text='Add Custom Skill: "${skillName}"'`;
      foundElement = this.findElement(customSelector) as HTMLElement;
    }

    if (foundElement) {
      // console.log('[AgentExecutor] Skill element found, clicking...');
      foundElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 300));
      foundElement.click();
      await new Promise(r => setTimeout(r, 300)); // Wait for state update
    } else {
      throw new Error(`Could not find skill "${skillName}" or any way to add it.`);
    }
  }

  private async handleClick(selector: string): Promise<void> {
    // Special handling: if agent clicks "Screen" button, dispatch custom event
    const isScreenClick = selector === 'text=Screen' ||
      selector === "text='Screen'" ||
      selector === 'manual-screen-button';

    if (isScreenClick && this.lastTypedJobUid) {
      // console.log(`[AgentExecutor] Detected Screen click — dispatching agent-trigger-screen with jobId: ${this.lastTypedJobUid}`);
      window.dispatchEvent(new CustomEvent('agent-trigger-screen', {
        detail: { jobId: this.lastTypedJobUid }
      }));
      return;
    }

    // Add small retry logic for finding element
    let element: Element | null = null;
    for (let i = 0; i < 5; i++) {
      element = this.findElement(selector);
      if (element) break;
      await new Promise(r => setTimeout(r, 200));
    }

    if (element instanceof HTMLElement) {
      // If it's a button and it's disabled, wait for it to become enabled (up to 20 seconds)
      if (element instanceof HTMLButtonElement && element.disabled) {
        // console.log(`[AgentExecutor] Element is disabled, waiting up to 20s for it to enable...`);
        for (let i = 0; i < 40; i++) {
          if (!element.disabled) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 300)); // Wait for scroll

      // Special handling for new tab links to ensure they open reliably for the agent
      if (element instanceof HTMLAnchorElement && element.target === '_blank') {
        // console.log(`[AgentExecutor] Opening new tab for: ${element.href}`);
        window.open(element.href, '_blank');
      } else {
        element.click();
      }
    } else {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  private async handleType(selector: string, value: string): Promise<void> {
    const element = this.findElement(selector);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 300)); // Wait for scroll
      // Use native setter to work with React controlled inputs
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));

      // Track the UID if this is the manual job UID input
      if (element.getAttribute('data-agent') === 'manual-job-uid-input' ||
        element.getAttribute('placeholder')?.includes('Paste Job UID')) {
        this.lastTypedJobUid = value;
        // console.log(`[AgentExecutor] Stored job UID for screen trigger: ${value}`);
      }
    } else if (element instanceof HTMLSelectElement) {
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      throw new Error(`Element not found or not an input/select: ${selector}`);
    }
  }

  private async handleNavigate(path: string): Promise<void> {
    // In Next.js, we should probably use the router, but for a global executor, 
    // we might need to hook into the router or use window.location if necessary.
    // Better to use a callback registered from the UI layer.
    window.location.href = path;
  }

  private async handleScroll(direction: 'up' | 'down', amount?: number): Promise<void> {
    const scrollAmount = amount || 500;
    window.scrollBy({
      top: direction === 'down' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }

  private async handleWait(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  private async handleObserve(selector: string): Promise<boolean> {
    return !!this.findElement(selector);
  }

  private async handleExtract(selector: string): Promise<string | null> {
    const element = this.findElement(selector);
    return element ? element.textContent : null;
  }

  private findElement(selector: string): Element | null {
    // text: prefix support
    if (selector.startsWith('text=')) {
      let targetText = selector.substring(5).trim();
      if ((targetText.startsWith("'") && targetText.endsWith("'")) ||
        (targetText.startsWith('"') && targetText.endsWith('"'))) {
        targetText = targetText.substring(1, targetText.length - 1);
      }
      targetText = targetText.toLowerCase();

      // Search all interactive elements first
      const elements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [data-agent]');
      for (const el of Array.from(elements)) {
        if (el.textContent?.toLowerCase().includes(targetText)) {
          return el;
        }
      }

      // Fallback: search all elements (more expensive but thorough)
      const allElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, li');
      for (const el of Array.from(allElements)) {
        // Only return if it's a leaf-ish element or has the text directly
        if (el.children.length < 5 && el.textContent?.toLowerCase().includes(targetText)) {
          return el;
        }
      }
      return null;
    }

    // Priority: data-agent, data-agent-group, data-agent-role, then standard selectors
    let element = document.querySelector(`[data-agent="${selector}"]`);
    if (!element) element = document.querySelector(`[data-agent-group="${selector}"]`);
    if (!element) element = document.querySelector(`[data-agent-role="${selector}"]`);
    if (!element) element = document.querySelector(selector);
    return element;
  }
}

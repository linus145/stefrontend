
export class AgentMonitor {
  private static instance: AgentMonitor;
  private observer: MutationObserver | null = null;

  private constructor() {}

  public static getInstance(): AgentMonitor {
    if (!AgentMonitor.instance) {
      AgentMonitor.instance = new AgentMonitor();
    }
    return AgentMonitor.instance;
  }

  public startMonitoring(onUpdate: (mutations: MutationRecord[]) => void) {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      onUpdate(mutations);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    
    console.log('[AgentMonitor] Started monitoring UI state');
  }

  public stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('[AgentMonitor] Stopped monitoring UI state');
    }
  }

  public async waitForElement(selector: string, timeout: number = 5000): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = document.querySelector(`[data-agent="${selector}"]`) || document.querySelector(selector);
      if (element) return resolve(element);

      const observer = new MutationObserver(() => {
        const element = document.querySelector(`[data-agent="${selector}"]`) || document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
}

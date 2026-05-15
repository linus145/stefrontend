export class AgentUIController {
  private static instance: AgentUIController;
  private isVisible: boolean = false;
  private isExternalOpen: boolean = false;

  private constructor() {}

  public static getInstance(): AgentUIController {
    if (!AgentUIController.instance) {
      AgentUIController.instance = new AgentUIController();
    }
    return AgentUIController.instance;
  }

  public toggleSidebar() {
    this.isVisible = !this.isVisible;
    this.updateUI();
  }

  public openSidebar(goal?: string) {
    this.isVisible = true;
    this.updateUI(goal);
  }

  public setExternalPanelOpen(isOpen: boolean) {
    this.isExternalOpen = isOpen;
    const event = new CustomEvent('external-panel-toggle', { detail: { isOpen } });
    window.dispatchEvent(event);
  }

  public showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    console.log(`[AgentUI] Notification: ${message} (${type})`);
  }

  private updateUI(goal?: string) {
    const event = new CustomEvent('agent-ui-toggle', { detail: { isVisible: this.isVisible, goal } });
    window.dispatchEvent(event);
  }
}


export class AgentUIController {
  private static instance: AgentUIController;
  private isVisible: boolean = false;

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

  public showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    console.log(`[AgentUI] Notification: ${message} (${type})`);
    // This would trigger a toast or a custom notification UI
  }

  private updateUI(goal?: string) {
    // This would communicate with the React components to update the visibility
    const event = new CustomEvent('agent-ui-toggle', { detail: { isVisible: this.isVisible, goal } });
    window.dispatchEvent(event);
  }
}

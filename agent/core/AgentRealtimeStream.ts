
type AgentEvent = 'status' | 'task_start' | 'task_complete' | 'task_failed' | 'task_paused' | 'action_start' | 'action_complete' | 'goal_complete';

export class AgentRealtimeStream {
  private static instance: AgentRealtimeStream;
  private listeners: Map<AgentEvent, Function[]> = new Map();

  private constructor() {}

  public static getInstance(): AgentRealtimeStream {
    if (!AgentRealtimeStream.instance) {
      AgentRealtimeStream.instance = new AgentRealtimeStream();
    }
    return AgentRealtimeStream.instance;
  }

  public on(event: AgentEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  public off(event: AgentEvent, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== callback));
    }
  }

  public emit(event: AgentEvent, data: any) {
    // console.log(`[AgentStream] ${event}:`, data);
    this.listeners.get(event)?.forEach(callback => callback(data));
    
    // In a real implementation, this would also send via WebSockets to the backend
    // if the backend needs to sync state.
  }
}

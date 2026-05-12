
export interface MemoryEntry {
  timestamp: number;
  type: 'action' | 'observation' | 'decision';
  content: any;
}

export class AgentMemory {
  private static instance: AgentMemory;
  private history: MemoryEntry[] = [];
  private preferences: Record<string, any> = {};

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AgentMemory {
    if (!AgentMemory.instance) {
      AgentMemory.instance = new AgentMemory();
    }
    return AgentMemory.instance;
  }

  public remember(type: MemoryEntry['type'], content: any) {
    const entry: MemoryEntry = {
      timestamp: Date.now(),
      type,
      content
    };
    this.history.push(entry);
    this.saveToStorage();
  }

  public getHistory(): MemoryEntry[] {
    return this.history;
  }

  public setPreference(key: string, value: any) {
    this.preferences[key] = value;
    this.saveToStorage();
  }

  public getPreference(key: string): any {
    return this.preferences[key];
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_memory', JSON.stringify({
        history: this.history.slice(-100), // Keep last 100 entries
        preferences: this.preferences
      }));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('agent_memory');
      if (data) {
        const parsed = JSON.parse(data);
        this.history = parsed.history || [];
        this.preferences = parsed.preferences || {};
      }
    }
  }
}

import { aiAgentService } from '@/services/ai-agents.service';

export interface MemoryEntry {
  timestamp: number;
  type: 'action' | 'observation' | 'decision';
  content: any;
}

export class AgentMemory {
  private static instance: AgentMemory;
  private history: MemoryEntry[] = [];
  private preferences: Record<string, any> = {};
  private executionId: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AgentMemory {
    if (!AgentMemory.instance) {
      AgentMemory.instance = new AgentMemory();
    }
    return AgentMemory.instance;
  }

  public setExecutionId(executionId: string | null) {
    this.executionId = executionId;
  }

  public loadHistory(history: MemoryEntry[]) {
    this.history = history;
  }

  public remember(type: MemoryEntry['type'], content: any) {
    const entry: MemoryEntry = {
      timestamp: Date.now(),
      type,
      content
    };
    this.history.push(entry);
    
    // Asynchronously save to backend if we have a valid execution context
    if (this.executionId) {
      aiAgentService.saveMemory(this.executionId, {
        memory_type: type,
        memory_key: `history_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        memory_value: content
      }).catch(err => {
        console.error('[AgentMemory] Failed to save memory to backend:', err);
      });
    }

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
      // Local storage is restricted to preferences only (Category A)
      localStorage.setItem('agent_preferences', JSON.stringify(this.preferences));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('agent_preferences');
      if (data) {
        try {
          this.preferences = JSON.parse(data) || {};
        } catch (e) {
          console.error('[AgentMemory] Failed to parse preferences:', e);
          this.preferences = {};
        }
      } else {
        // Migration/backward compatibility: try checking old agent_memory key
        const legacyData = localStorage.getItem('agent_memory');
        if (legacyData) {
          try {
            const parsed = JSON.parse(legacyData);
            this.preferences = parsed.preferences || {};
            // Immediately write to clean key and clean up old key
            localStorage.setItem('agent_preferences', JSON.stringify(this.preferences));
            localStorage.removeItem('agent_memory');
          } catch (e) {
            this.preferences = {};
          }
        }
      }
    }
  }
}

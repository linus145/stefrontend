
import { AgentAction } from '@/agent/actions/AgentActionRegistry';
import { api } from '@/lib/api';

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  actions: AgentAction[];
  currentActionIndex?: number;
}

export interface AgentPlan {
  goal: string;
  tasks: AgentTask[];
}

export class AgentPlanner {
  private static instance: AgentPlanner;

  private constructor() {}

  public static getInstance(): AgentPlanner {
    if (!AgentPlanner.instance) {
      AgentPlanner.instance = new AgentPlanner();
    }
    return AgentPlanner.instance;
  }

  public async generatePlan(goal: string): Promise<AgentPlan> {
    // console.log(`[AgentPlanner] Generating plan for goal: ${goal}`);
    
    try {
      const data = await api.post<{ plan: AgentAction[] }>('/autonomousagent1/plan/', { goal });
      
      return {
        goal,
        tasks: [
          {
            id: 'task-1',
            description: `Execute autonomous actions for: ${goal}`,
            status: 'pending',
            actions: data.plan
          }
        ]
      };
    } catch (error) {
      // console.error('Error generating plan:', error);
      return {
        goal,
        tasks: [
          {
            id: 'error-task',
            description: 'Failed to generate plan',
            status: 'failed',
            actions: []
          }
        ]
      };
    }
  }
}

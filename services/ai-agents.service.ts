import { api } from '@/lib/api';

export interface AIAgentTaskPayload {
  task_type: string;
  payload: Record<string, any>;
}

export interface AIAgentTaskResponse {
  status: string;
  message: string;
  details?: Record<string, any>;
}

export const aiAgentService = {
  executeTask: (data: AIAgentTaskPayload): Promise<AIAgentTaskResponse> => {
    return api.post<AIAgentTaskResponse>('/AIAgents/execute/', data);
  },
  getExecutions: (): Promise<any[]> => {
    return api.get<any[]>('/autonomousagent1/executions/');
  },
  createExecution: (data: { agent_type: string; status: string; actions_performed?: any[]; metadata?: Record<string, any>; goal?: string }): Promise<any> => {
    return api.post<any>('/autonomousagent1/executions/', data);
  },
  updateExecution: (id: string, data: Partial<{ status: string; completed_at?: string; execution_time?: number; actions_performed?: any[]; metadata?: Record<string, any>; goal?: string }>): Promise<any> => {
    return api.put<any>(`/autonomousagent1/executions/${id}/`, data);
  },
  deleteExecution: (id: string): Promise<any> => {
    return api.delete<any>(`/autonomousagent1/executions/${id}/`);
  },
  clearChatHistory: (): Promise<any> => {
    return api.delete<any>('/autonomousagent1/chat/clear/');
  },

  // New Enterprise memory architecture methods
  getActiveExecution: (): Promise<any> => {
    return api.get<any>('/autonomousagent1/executions/active/');
  },
  getExecutionState: (id: string): Promise<any> => {
    return api.get<any>(`/autonomousagent1/executions/${id}/`);
  },
  createGoal: (data: { goal: string; organization_id?: string; goal_type?: string; status?: string; priority?: string }): Promise<any> => {
    return api.post<any>('/autonomousagent1/goals/', data);
  },
  saveMemory: (executionId: string, data: { memory_type: string; memory_key: string; memory_value: any }): Promise<any> => {
    return api.post<any>(`/autonomousagent1/executions/${executionId}/memories/`, data);
  },
  saveDecision: (executionId: string, data: { decision_type: string; decision_data: any; reasoning_data: any }): Promise<any> => {
    return api.post<any>(`/autonomousagent1/executions/${executionId}/decisions/`, data);
  },
  saveAction: (executionId: string, data: { action_type: string; action_payload: any }): Promise<any> => {
    return api.post<any>(`/autonomousagent1/executions/${executionId}/actions/`, data);
  },
  saveCheckpoint: (executionId: string, data: { checkpoint_data: any }): Promise<any> => {
    return api.post<any>(`/autonomousagent1/executions/${executionId}/checkpoints/`, data);
  },
  getCheckpoint: (executionId: string): Promise<any[]> => {
    return api.get<any[]>(`/autonomousagent1/executions/${executionId}/checkpoints/`);
  }
};

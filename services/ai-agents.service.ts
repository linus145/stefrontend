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
  createExecution: (data: { agent_type: string; status: string; actions_performed?: any[]; metadata?: Record<string, any> }): Promise<any> => {
    return api.post<any>('/autonomousagent1/executions/', data);
  },
  updateExecution: (id: string, data: Partial<{ status: string; completed_at?: string; execution_time?: number; actions_performed?: any[]; metadata?: Record<string, any> }>): Promise<any> => {
    return api.put<any>(`/autonomousagent1/executions/${id}/`, data);
  },
  deleteExecution: (id: string): Promise<any> => {
    return api.delete<any>(`/autonomousagent1/executions/${id}/`);
  },
  clearChatHistory: (): Promise<any> => {
    return api.delete<any>('/autonomousagent1/chat/clear/');
  }
};

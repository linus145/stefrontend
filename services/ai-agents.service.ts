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
  }
};

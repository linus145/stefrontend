
export type ActionType = 
  | 'click' 
  | 'type' 
  | 'navigate' 
  | 'select' 
  | 'scroll' 
  | 'open_modal' 
  | 'close_modal' 
  | 'switch_tab' 
  | 'wait' 
  | 'submit' 
  | 'observe' 
  | 'extract' 
  | 'hover' 
  | 'drag' 
  | 'upload' 
  | 'click-skill'
  | 'backend_call'
  | 'status'
  | 'ask_user'
  | 'open_new_tab'
  | 'done'
  | 'multi_step_flow';

export interface AgentAction {
  type: ActionType;
  selector?: string;
  value?: any;
  path?: string;
  duration?: number;
  direction?: 'up' | 'down';
  amount?: number;
  [key: string]: any;
}

export class AgentActionRegistry {
  private static actions: Map<string, AgentAction> = new Map();

  public static register(name: string, action: AgentAction) {
    this.actions.set(name, action);
  }

  public static getAction(name: string): AgentAction | undefined {
    return this.actions.get(name);
  }
}

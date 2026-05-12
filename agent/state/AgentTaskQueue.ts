
import { AgentTask } from '@/agent/planner/AgentPlanner';

export class AgentTaskQueue {
  private static instance: AgentTaskQueue;
  private queue: AgentTask[] = [];

  private constructor() {}

  public static getInstance(): AgentTaskQueue {
    if (!AgentTaskQueue.instance) {
      AgentTaskQueue.instance = new AgentTaskQueue();
    }
    return AgentTaskQueue.instance;
  }

  public enqueue(task: AgentTask) {
    this.queue.push(task);
    this.notifyUpdate();
  }

  public dequeue(): AgentTask | undefined {
    const task = this.queue.shift();
    this.notifyUpdate();
    return task;
  }

  public getQueue(): AgentTask[] {
    return [...this.queue];
  }

  public clear() {
    this.queue = [];
    this.notifyUpdate();
  }

  private notifyUpdate() {
    const event = new CustomEvent('agent-task-queue-update', { detail: { queue: this.queue } });
    window.dispatchEvent(event);
  }
}

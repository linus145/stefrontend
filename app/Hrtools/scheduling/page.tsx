import { Metadata } from 'next';
import { AgentSchedulingTab } from '@/components/hrtool/tabs/scheduling/agent-scheduling-tab';

export const metadata: Metadata = {
  title: 'Agent Scheduling | HR Suite',
  description: 'Configure recurrent execution triggers and cron configurations for autonomous agent processes.',
};

export default function AgentSchedulingPage() {
  return <AgentSchedulingTab />;
}

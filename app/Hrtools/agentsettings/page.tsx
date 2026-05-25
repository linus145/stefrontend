import { Metadata } from 'next';
import { AgentSettingsTab } from '@/components/hrtool/tabs/agentsetting/agent-settings-tab';

export const metadata: Metadata = {
  title: 'Agent Settings | HR Suite',
  description: 'Configure the default LLM engine model, temperature bounds, iteration thresholds, and autonomy behaviors.',
};

export default function AgentSettingsPage() {
  return <AgentSettingsTab />;
}

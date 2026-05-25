import React from 'react';
import { HRSubLayoutClient } from '@/components/hrtool/hr-sub-layout-client';

export default function AgentSettingsLayout({ children }: { children: React.ReactNode }) {
  return <HRSubLayoutClient activeTab="agent-settings">{children}</HRSubLayoutClient>;
}

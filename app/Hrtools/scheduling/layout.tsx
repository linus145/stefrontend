import React from 'react';
import { HRSubLayoutClient } from '@/components/hrtool/hr-sub-layout-client';

export default function AgentSchedulingLayout({ children }: { children: React.ReactNode }) {
  return <HRSubLayoutClient activeTab="agent-scheduling">{children}</HRSubLayoutClient>;
}

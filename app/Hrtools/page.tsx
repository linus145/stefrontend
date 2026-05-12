import { HRShell } from '@/components/hrtool/hr-shell';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HR Suite | Management System',
  description: 'Enterprise-grade HR management tools for your organization.',
};

export default function HRToolsPage() {
  return <HRShell />;
}

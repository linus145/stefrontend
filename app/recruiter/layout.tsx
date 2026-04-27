import { Metadata } from 'next';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard | B2linq',
  description: 'Manage your job postings, applications, and hiring pipeline.',
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardThemeProvider>{children}</DashboardThemeProvider>;
}

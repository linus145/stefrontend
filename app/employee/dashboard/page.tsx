import { EmployeeDashboardSwitcher } from '@/components/employee/dashboard-switcher';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Dashboard | B2linq Portal',
  description: 'Manage timecards, shift logs, leave balances, and review team requests.',
};

export default function EmployeeDashboardPage() {
  return (
    <DashboardThemeProvider>
      <EmployeeDashboardSwitcher />
    </DashboardThemeProvider>
  );
}

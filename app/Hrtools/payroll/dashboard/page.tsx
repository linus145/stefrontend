import { Metadata } from 'next';
import { PayrollDashboardClient } from '@/components/hrtool/tabs/payroll/payroll-dashboard-client';

export const metadata: Metadata = {
  title: 'Payroll Dashboard | HR Suite',
  description: 'Comprehensive real-time startup payouts ledger & compliance monitoring.',
};

export default function PayrollDashboardPage() {
  return <PayrollDashboardClient />;
}

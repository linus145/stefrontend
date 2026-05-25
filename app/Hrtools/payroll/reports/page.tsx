import { Metadata } from 'next';
import { PayrollReportsClient } from '@/components/hrtool/tabs/payroll/payroll-reports-client';

export const metadata: Metadata = {
  title: 'Payroll Reports | HR Suite',
  description: 'Generate statutory tax reports, monitor startup payout graphs, and download payroll balances.',
};

export default function ReportsPage() {
  return <PayrollReportsClient />;
}

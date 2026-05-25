import { Metadata } from 'next';
import { PayrollRuns } from '@/components/hrtool/tabs/payroll/payroll-runs';

export const metadata: Metadata = {
  title: 'Payroll Runs | HR Suite',
  description: 'Manage employee payroll compilation, adjustments, and final approvals.',
};

export default function PayrollRunsPage() {
  return <PayrollRuns />;
}

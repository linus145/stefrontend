import { Metadata } from 'next';
import { PayrollApprovalsClient } from '@/components/hrtool/tabs/payroll/payroll-approvals-client';

export const metadata: Metadata = {
  title: 'Payroll Approvals | HR Suite',
  description: 'Executive payroll approvals queue and drilldown verification.',
};

export default function ApprovalsPage() {
  return <PayrollApprovalsClient />;
}

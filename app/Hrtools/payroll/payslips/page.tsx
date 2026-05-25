import { Metadata } from 'next';
import { PayrollPayslipsClient } from '@/components/hrtool/tabs/payroll/payroll-payslips-client';

export const metadata: Metadata = {
  title: 'Payslips | HR Suite',
  description: 'Access history sheets, verify issued payslips, and dispatch monthly receipts.',
};

export default function PayslipsPage() {
  return <PayrollPayslipsClient />;
}

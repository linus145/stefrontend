import { Metadata } from 'next';
import { PayrollAdjustmentsClient } from '@/components/hrtool/tabs/payroll/payroll-adjustments-client';

export const metadata: Metadata = {
  title: 'Payroll Adjustments | HR Suite',
  description: 'Allocate yearly bonuses, direct performance incentives, and correct monthly payout entries.',
};

export default function AdjustmentsPage() {
  return <PayrollAdjustmentsClient />;
}

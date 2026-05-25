import { Metadata } from 'next';
import { PayrollSettingsClient } from '@/components/hrtool/tabs/payroll/payroll-settings-client';

export const metadata: Metadata = {
  title: 'Payroll Settings | HR Suite',
  description: 'Customize corporate payout automation models, default currency tokens, and compliance metrics.',
};

export default function SettingsPage() {
  return <PayrollSettingsClient />;
}

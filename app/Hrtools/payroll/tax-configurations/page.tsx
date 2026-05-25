import { Metadata } from 'next';
import { TaxSlabs } from '@/components/hrtool/tabs/payroll/tax-slabs';

export const metadata: Metadata = {
  title: 'Tax Configurations | HR Suite',
  description: 'Configure progressive tax bracket thresholds for statutory compliance withholding.',
};

export default function TaxConfigurationsPage() {
  return <TaxSlabs />;
}

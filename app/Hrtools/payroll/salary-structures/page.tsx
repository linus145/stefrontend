import { Metadata } from 'next';
import { SalaryStructures } from '@/components/hrtool/tabs/payroll/salary-structures';

export const metadata: Metadata = {
  title: 'Salary Structures | HR Suite',
  description: 'Configure base salary ratios, tax percentages, overtime hourly rates, and statures.',
};

export default function SalaryStructuresPage() {
  return <SalaryStructures />;
}

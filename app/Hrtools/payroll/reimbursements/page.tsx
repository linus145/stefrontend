import { Metadata } from 'next';
import { ExpenseClaims } from '@/components/hrtool/tabs/payroll/expense-claims';

export const metadata: Metadata = {
  title: 'Expense Reimbursements | HR Suite',
  description: 'Employee expense claims requesting HR validation to add to next month payroll payout.',
};

export default function ReimbursementsPage() {
  return <ExpenseClaims />;
}

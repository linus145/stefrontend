import React from 'react';
import { PayrollLayoutClient } from '@/components/hrtool/tabs/payroll/payroll-layout-client';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return <PayrollLayoutClient>{children}</PayrollLayoutClient>;
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LocalLoader } from '@/components/ui/local-loader';

export function PayrollTab() {
  const router = useRouter();

  useEffect(() => {
    router.push('/Hrtools/payroll/dashboard');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-2">
        <LocalLoader />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider animate-pulse">Launching modular payroll suite...</p>
      </div>
    </div>
  );
}

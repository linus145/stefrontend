'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { LocalLoader } from '@/components/ui/local-loader';
import { TaxSlabs } from '@/components/hrtool/tabs/payroll/tax-slabs';

export default function TaxConfigurationsPage() {
  const queryClient = useQueryClient();
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxForm, setTaxForm] = useState({
    slab_name: '',
    percentage: '',
    min_amount: '',
    max_amount: ''
  });

  const { data: taxConfigs, isLoading: isLoadingTax } = useQuery({
    queryKey: ['payroll-tax-configs'],
    queryFn: () => hrPayrollService.getTaxConfigs(),
  });

  const taxMutation = useMutation({
    mutationFn: (data: any) => hrPayrollService.createTaxConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-tax-configs'] });
      setIsTaxModalOpen(false);
      toast.success('Tax bracket registered successfully!');
    },
    onError: () => {
      toast.error('Failed to create custom tax config.');
    }
  });

  if (isLoadingTax) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Income Tax & TDS Brackets</h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage progressive taxable thresholds, customize local corporate TDS percentages, and retain legal compliance logs.</p>
      </div>

      <TaxSlabs
        taxConfigs={taxConfigs}
        taxForm={taxForm}
        setTaxForm={setTaxForm}
        isTaxModalOpen={isTaxModalOpen}
        setIsTaxModalOpen={setIsTaxModalOpen}
        onTaxSubmit={(data) => taxMutation.mutate(data)}
        taxPending={taxMutation.isPending}
      />
    </div>
  );
}

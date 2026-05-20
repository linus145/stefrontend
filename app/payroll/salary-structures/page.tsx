'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { toast } from 'sonner';
import { LocalLoader } from '@/components/ui/local-loader';
import { SalaryStructures } from '@/components/hrtool/tabs/payroll/salary-structures';

export default function SalaryStructuresPage() {
  const queryClient = useQueryClient();
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureForm, setStructureForm] = useState({
    employee_id: '',
    basic_salary: '',
    hra: '',
    overtime_rate: '',
    tax_percentage: '',
    pf_percentage: '',
    esi_percentage: '',
    status: 'ACTIVE'
  });

  // Queries
  const { data: structures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['payroll-structures'],
    queryFn: () => hrPayrollService.getSalaryStructures(),
  });

  // Mutations
  const structureMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedStructure) {
        return hrPayrollService.updateSalaryStructure(selectedStructure.id, data);
      }
      return hrPayrollService.createSalaryStructure(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      setIsStructureModalOpen(false);
      setSelectedStructure(null);
      toast.success('Salary structure configured successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to configure salary structure.');
    }
  });

  if (isLoadingStructures) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-black">Employee Salary Profiles</h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Define corporate salary schemes, base income ratios, dynamic tax rates, and provident fund ratios.</p>
      </div>

      <SalaryStructures
        structures={structures}
        isLoadingStructures={isLoadingStructures}
        selectedStructure={selectedStructure}
        setSelectedStructure={setSelectedStructure}
        structureForm={structureForm}
        setStructureForm={setStructureForm}
        isStructureModalOpen={isStructureModalOpen}
        setIsStructureModalOpen={setIsStructureModalOpen}
        onStructureSubmit={(data) => structureMutation.mutate(data)}
        structurePending={structureMutation.isPending}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, X } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';

interface QuickSalaryConfigModalProps {
  employee: any;
  onClose: () => void;
  salaryForm: {
    basic_salary: string;
    hra: string;
    overtime_rate: string;
    tax_percentage: string;
    pf_percentage: string;
    esi_percentage: string;
    status: string;
  };
  setSalaryForm: React.Dispatch<React.SetStateAction<{
    basic_salary: string;
    hra: string;
    overtime_rate: string;
    tax_percentage: string;
    pf_percentage: string;
    esi_percentage: string;
    status: string;
  }>>;
  saveSalaryMutation: UseMutationResult<any, any, any, any>;
  settingsRes?: any;
}

export function QuickSalaryConfigModal({
  employee,
  onClose,
  salaryForm,
  setSalaryForm,
  saveSalaryMutation,
  settingsRes,
}: QuickSalaryConfigModalProps) {
  const router = useRouter();

  if (!employee) return null;

  const isTaxEnabled = settingsRes?.data?.enable_tax_deductions !== false;
  const isStatutoryEnabled = settingsRes?.data?.enable_statutory_deductions !== false;
  const basic = parseFloat(salaryForm.basic_salary || '0') || 0;
  const hra = parseFloat(salaryForm.hra || '0') || 0;
  const gross = basic + hra;
  const taxPct = parseFloat(salaryForm.tax_percentage || '0') || 0;
  const pfPct = parseFloat(salaryForm.pf_percentage || '0') || 0;
  const esiPct = parseFloat(salaryForm.esi_percentage || '0') || 0;
  const taxAmt = isTaxEnabled ? gross * (taxPct / 100) : 0;
  const pfAmt = isStatutoryEnabled ? basic * (pfPct / 100) : 0;
  const esiAmt = isStatutoryEnabled ? basic * (esiPct / 100) : 0;
  const totalDed = taxAmt + pfAmt + esiAmt;
  const net = Math.max(0, gross - totalDed);

  return (
    <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-none">
      <div className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/80 rounded-xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-md bg-[#0a66c2]/10 text-[#0a66c2]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {employee.salary_structure_detail ? 'Update Salary Structure' : 'Configure Salary Structure'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {employee.first_name} {employee.last_name} ({employee.employee_id || 'ID: N/A'})
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Basic Monthly Salary (₹)</label>
              <Input
                type="number"
                value={salaryForm.basic_salary}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, basic_salary: e.target.value }))}
                placeholder="e.g. 45000"
                className="h-9 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">HRA Allowance (₹)</label>
              <Input
                type="number"
                value={salaryForm.hra}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, hra: e.target.value }))}
                placeholder="e.g. 18000"
                className="h-9 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Overtime Hourly Rate (₹)</label>
              <Input
                type="number"
                value={salaryForm.overtime_rate}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, overtime_rate: e.target.value }))}
                placeholder="e.g. 250"
                className="h-9 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Tax Deduction %</label>
              <Input
                type="number"
                value={salaryForm.tax_percentage}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, tax_percentage: e.target.value }))}
                placeholder="10"
                className="h-9 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Statutory PF %</label>
              <Input
                type="number"
                value={salaryForm.pf_percentage}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, pf_percentage: e.target.value }))}
                placeholder="12"
                className="h-9 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Statutory ESI %</label>
              <Input
                type="number"
                value={salaryForm.esi_percentage}
                onChange={(e) => setSalaryForm((prev) => ({ ...prev, esi_percentage: e.target.value }))}
                placeholder="1.75"
                className="h-9 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Live Gross & Net Preview */}
          <div className="p-3 bg-slate-50 dark:bg-[#151624]/60 border border-slate-200 dark:border-slate-800/80 rounded-md space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Gross Monthly:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{gross.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Net Income After Tax:</span>
              <span>₹{net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/Hrtools/payroll/salary-structures');
              }}
              className="text-xs font-semibold text-[#0a66c2] hover:underline bg-transparent border-none cursor-pointer"
            >
              Open in Salary Structures →
            </button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saveSalaryMutation.isPending}
                onClick={() => {
                  saveSalaryMutation.mutate({
                    employee: employee.employee_id || employee.id,
                    basic_salary: parseFloat(salaryForm.basic_salary || '0'),
                    hra: parseFloat(salaryForm.hra || '0'),
                    overtime_rate: parseFloat(salaryForm.overtime_rate || '0'),
                    tax_percentage: parseFloat(salaryForm.tax_percentage || '10'),
                    pf_percentage: parseFloat(salaryForm.pf_percentage || '12'),
                    esi_percentage: parseFloat(salaryForm.esi_percentage || '1.75'),
                    status: salaryForm.status,
                    deduct_absent_leaves: true,
                  });
                }}
                className="bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold h-9 px-4"
              >
                {saveSalaryMutation.isPending ? 'Saving...' : 'Save Structure'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

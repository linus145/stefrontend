'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SalaryStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStructure: any;
  structureForm: {
    employee_id: string;
    basic_salary: string;
    hra: string;
    overtime_rate: string;
    tax_percentage: string;
    pf_percentage: string;
    esi_percentage: string;
    deduct_absent_leaves: boolean;
    status: string;
  };
  setStructureForm: React.Dispatch<React.SetStateAction<any>>;
  onStructureSubmit: (data: any) => void;
  structurePending: boolean;
  employeesList: any[];
  currencySymbol: string;
  settingsRes: any;
}

export function SalaryStructureModal({
  isOpen,
  onClose,
  selectedStructure,
  structureForm,
  setStructureForm,
  onStructureSubmit,
  structurePending,
  employeesList,
  currencySymbol,
  settingsRes,
}: SalaryStructureModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const isTaxEnabled = settingsRes?.data?.enable_tax_deductions !== false;
  const isStatutoryEnabled = settingsRes?.data?.enable_statutory_deductions !== false;
  const modalBasic = parseFloat(structureForm.basic_salary || '0') || 0;
  const modalHra = parseFloat(structureForm.hra || '0') || 0;
  const modalGross = modalBasic + modalHra;
  const modalTaxPct = parseFloat(structureForm.tax_percentage || '0') || 0;
  const modalPfPct = parseFloat(structureForm.pf_percentage || '0') || 0;
  const modalEsiPct = parseFloat(structureForm.esi_percentage || '0') || 0;
  const modalTaxAmt = isTaxEnabled ? modalGross * (modalTaxPct / 100) : 0;
  const modalPfAmt = isStatutoryEnabled ? modalBasic * (modalPfPct / 100) : 0;
  const modalEsiAmt = isStatutoryEnabled ? modalBasic * (modalEsiPct / 100) : 0;
  const modalTotalDed = modalTaxAmt + modalPfAmt + modalEsiAmt;
  const modalNetAfterTax = Math.max(0, modalGross - modalTotalDed);

  return (
    <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-none">
      <div className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/80 rounded-sm w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
          {selectedStructure ? 'Update employee compensation profile' : 'Add employee compensation profile'}
        </h3>
        <p className="text-xs text-slate-500 mb-5">Set exact base salary multipliers, tax parameters, and statutory contributions.</p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 tracking-wide">Employee</label>
            {selectedStructure ? (
              <input
                type="text"
                value={`${selectedStructure.employee_name || ''} ${selectedStructure.employee_last_name || ''} (${selectedStructure.employee_code || ''})`}
                disabled
                className="w-full bg-[#f8fafc]/80 dark:bg-[#151624]/80 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none disabled:opacity-60 font-semibold"
              />
            ) : (
              <select
                value={structureForm.employee_id}
                onChange={(e) => setStructureForm({ ...structureForm, employee_id: e.target.value })}
                data-agent="payroll-salary-employee-id-input"
                className="w-full h-9 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-850 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer font-semibold"
              >
                <option value="">Select an employee ({employeesList.length} active)...</option>
                {employeesList.map((emp: any) => (
                  <option key={emp.id} value={emp.employee_id || emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'}) - {emp.designation_detail?.title || emp.role || 'Employee'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Basic monthly salary ({currencySymbol})</label>
              <input
                type="number"
                value={structureForm.basic_salary}
                onChange={(e) => setStructureForm({ ...structureForm, basic_salary: e.target.value })}
                data-agent="payroll-salary-basic-salary-input"
                placeholder="e.g. 5000"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">HRA allowance ({currencySymbol})</label>
              <input
                type="number"
                value={structureForm.hra}
                onChange={(e) => setStructureForm({ ...structureForm, hra: e.target.value })}
                data-agent="payroll-salary-hra-input"
                placeholder="e.g. 1500"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-850 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Overtime hourly rate ({currencySymbol})</label>
              <input
                type="number"
                value={structureForm.overtime_rate}
                onChange={(e) => setStructureForm({ ...structureForm, overtime_rate: e.target.value })}
                data-agent="payroll-salary-ot-rate-input"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Default tax %</label>
              <input
                type="number"
                value={structureForm.tax_percentage}
                onChange={(e) => setStructureForm({ ...structureForm, tax_percentage: e.target.value })}
                data-agent="payroll-salary-tax-percentage-input"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Statutory PF %</label>
              <input
                type="number"
                value={structureForm.pf_percentage}
                onChange={(e) => setStructureForm({ ...structureForm, pf_percentage: e.target.value })}
                data-agent="payroll-salary-pf-percentage-input"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 tracking-wide">Statutory ESI %</label>
              <input
                type="number"
                value={structureForm.esi_percentage}
                onChange={(e) => setStructureForm({ ...structureForm, esi_percentage: e.target.value })}
                data-agent="payroll-salary-esi-percentage-input"
                className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Absence LOP Notice */}
          <div className="p-3 bg-slate-50 dark:bg-[#151624]/60 border border-slate-200 dark:border-slate-800/80 rounded-sm flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Absence & Leave Penalty (LOP)</span>
              <span className="text-[10px] text-slate-400 font-medium">
                Governed globally by Payroll Settings ({settingsRes?.data?.enable_leave_deductions !== false ? 'Automatic Deductions Active' : 'Exempt / Manual Mode'}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/Hrtools/payroll/settings');
              }}
              className="text-[10px] font-bold text-[#0a66c2] hover:underline cursor-pointer bg-transparent border-none shrink-0"
            >
              Configure in Settings →
            </button>
          </div>

          {/* Live Calculation Preview */}
          <div className="p-3 bg-slate-50 dark:bg-[#151624]/60 border border-slate-200 dark:border-slate-800/80 rounded-sm space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Monthly Gross:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currencySymbol}{modalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 text-[11px]">
              <span>
                Deductions:
                {isTaxEnabled ? ` Tax (${modalTaxPct}%)` : ' Tax (Exempt)'} + 
                {isStatutoryEnabled ? ` PF/ESI (${modalPfPct + modalEsiPct}%)` : ' PF/ESI (Exempt)'}
              </span>
              <span className="font-bold">-{currencySymbol}{modalTotalDed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[11px]">Total Income After Tax (Net):</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">{currencySymbol}{modalNetAfterTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              className="border border-slate-200 bg-transparent text-slate-600 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const parsedData = {
                  basic_salary: parseFloat(structureForm.basic_salary),
                  hra: parseFloat(structureForm.hra),
                  overtime_rate: parseFloat(structureForm.overtime_rate),
                  tax_percentage: parseFloat(structureForm.tax_percentage),
                  pf_percentage: parseFloat(structureForm.pf_percentage),
                  esi_percentage: parseFloat(structureForm.esi_percentage),
                  deduct_absent_leaves: Boolean(structureForm.deduct_absent_leaves),
                  status: structureForm.status,
                  employee: structureForm.employee_id
                };
                onStructureSubmit(parsedData);
              }}
              disabled={structurePending}
              data-agent="payroll-salary-modal-save-btn"
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
            >
              Save profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

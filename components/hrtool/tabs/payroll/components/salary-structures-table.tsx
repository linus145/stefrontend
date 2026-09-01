'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UseMutationResult } from '@tanstack/react-query';

interface SalaryStructuresTableProps {
  isLoadingStructures: boolean;
  structures: any;
  page: number;
  currencySymbol: string;
  settingsRes: any;
  setSelectedStructure: (str: any) => void;
  setStructureForm: (form: any) => void;
  setIsStructureModalOpen: (open: boolean) => void;
  deleteStructureMutation: UseMutationResult<any, any, any, any>;
}

export function SalaryStructuresTable({
  isLoadingStructures,
  structures,
  page,
  currencySymbol,
  settingsRes,
  setSelectedStructure,
  setStructureForm,
  setIsStructureModalOpen,
  deleteStructureMutation,
}: SalaryStructuresTableProps) {
  const router = useRouter();

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
              <th className="py-2.5 px-3 w-10 text-[10px] font-bold tracking-wide text-slate-400 text-center">#</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee ID</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Designation</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Basic monthly</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">HRA</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Gross monthly</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">OT hourly rate</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Tax deduct %</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Statutory PF %</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">ESI %</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-emerald-600 dark:text-emerald-400">Total income after tax</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Absence LOP</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Status</th>
              <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingStructures ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td colSpan={15} className="py-4 text-center">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-sm w-3/4 mx-auto" />
                  </td>
                </tr>
              ))
            ) : structures?.data?.results?.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">
                  No salary structures configured yet.
                </td>
              </tr>
            ) : (
              structures?.data?.results?.map((str: any, index: number) => {
                const serialNumber = (page - 1) * 10 + index + 1;
                const basic = parseFloat(str.basic_salary || 0);
                const hra = parseFloat(str.hra || 0);
                const gross = basic + hra;
                const taxPct = parseFloat(str.tax_percentage || 0);
                const pfPct = parseFloat(str.pf_percentage || 0);
                const esiPct = parseFloat(str.esi_percentage || 0);
                const isTaxEnabled = settingsRes?.data?.enable_tax_deductions !== false;
                const isStatutoryEnabled = settingsRes?.data?.enable_statutory_deductions !== false;
                const taxDeduction = isTaxEnabled ? gross * (taxPct / 100) : 0;
                const pfDeduction = isStatutoryEnabled ? basic * (pfPct / 100) : 0;
                const esiDeduction = isStatutoryEnabled ? basic * (esiPct / 100) : 0;
                const totalDeductions = taxDeduction + pfDeduction + esiDeduction;
                const netIncomeAfterTax = Math.max(0, gross - totalDeductions);

                return (
                  <tr
                    key={str.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="py-3 px-3 text-center text-xs font-bold text-slate-400">
                      {serialNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                            str.is_employee_deleted
                              ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-200/20'
                              : 'bg-[#0a66c2]/10 text-[#0a66c2]'
                          }`}
                        >
                          {str.is_employee_deleted ? '?' : str.employee_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-1">
                            {str.is_employee_deleted && !str.employee_name ? (
                              <span className="text-rose-600 dark:text-rose-450 italic">Deleted Profile</span>
                            ) : (
                              <>
                                {str.employee_name} {str.employee_last_name}
                              </>
                            )}
                            {str.is_employee_deleted && (
                              <Badge className="font-extrabold text-[8px] tracking-wide px-1.5 py-0 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 shadow-none rounded-[2px] ml-1">
                                DELETED
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {str.employee_code || '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                      {str.employee_designation || 'Team Member'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-bold">
                      {currencySymbol}{basic.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-850 dark:text-slate-400 font-semibold">
                      {currencySymbol}{hra.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-900 dark:text-white font-bold">
                      {currencySymbol}{gross.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-850 dark:text-slate-400 font-semibold">
                      {currencySymbol}{parseFloat(str.overtime_rate || 0).toLocaleString()} / hr
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-[#0a66c2]">
                      {isTaxEnabled ? `${taxPct}%` : <span className="text-slate-400 font-semibold text-[10px]">Exempt (0%)</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-semibold">
                      {isStatutoryEnabled ? `${pfPct}%` : <span className="text-slate-400 font-semibold text-[10px]">Exempt</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-semibold">
                      {isStatutoryEnabled ? `${esiPct}%` : <span className="text-slate-400 font-semibold text-[10px]">Exempt</span>}
                    </td>
                    <td className="py-3 px-4 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{netIncomeAfterTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => router.push('/Hrtools/payroll/settings')}
                        title="Governed globally in Payroll Settings. Click to configure."
                        className="inline-flex items-center group cursor-pointer border-none bg-transparent p-0 outline-none"
                      >
                        <Badge
                          className={`font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none transition-all group-hover:scale-105 ${
                            settingsRes?.data?.enable_leave_deductions !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}
                        >
                          {settingsRes?.data?.enable_leave_deductions !== false ? 'Global: Deduct' : 'Global: Exempt'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none ${
                          str.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {toSentenceCase(str.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedStructure(str);
                            setStructureForm({
                              employee_id: str.employee_code || str.employee,
                              basic_salary: str.basic_salary,
                              hra: str.hra,
                              overtime_rate: str.overtime_rate,
                              tax_percentage: str.tax_percentage,
                              pf_percentage: str.pf_percentage,
                              esi_percentage: str.esi_percentage,
                              deduct_absent_leaves: str.deduct_absent_leaves ?? true,
                              status: str.status
                            });
                            setIsStructureModalOpen(true);
                          }}
                          disabled={str.is_employee_deleted}
                          title={str.is_employee_deleted ? "Cannot edit profile of a deleted employee" : "Edit profile"}
                          data-agent={`payroll-salary-edit-btn-${str.id}`}
                          className="border border-[#0a66c2]/15 dark:border-[#0a66c2]/30 bg-transparent hover:bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#3b8fd9] h-8 w-8 rounded-sm cursor-pointer transition-all duration-300 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to permanently delete this compensation profile? This cannot be undone.")) {
                              deleteStructureMutation.mutate(str.id);
                            }
                          }}
                          data-agent={`payroll-salary-delete-btn-${str.id}`}
                          className="border border-rose-200/50 dark:border-rose-900/30 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 h-8 w-8 rounded-sm cursor-pointer transition-all duration-300 flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

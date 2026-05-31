 'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService, hrEmployeeService } from '@/services/hr';
import { toast } from 'sonner';

export function SalaryStructures() {
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

  const { data: employeesRes } = useQuery({
    queryKey: ['payroll-employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ limit: 100 }),
  });

  const employeesList = employeesRes?.data?.results || [];

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

  const deleteStructureMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.deleteSalaryStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      toast.success('Salary structure permanently deleted!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete salary structure.');
    }
  });

  const onStructureSubmit = (data: any) => structureMutation.mutate(data);
  const structurePending = structureMutation.isPending;
  
  const { data: settingsRes } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  const getCurrencySymbol = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'د.إ ';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(settingsRes?.data?.currency);

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-medium">Employee compensation profiles</h3>
          <p className="text-xs text-slate-500 font-medium">Configure base salary ratios, tax percentages, overtime hourly rates, and statures.</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedStructure(null);
            setStructureForm({
              employee_id: '',
              basic_salary: '',
              hra: '',
              overtime_rate: '0',
              tax_percentage: '10',
              pf_percentage: '12',
              esi_percentage: '1.75',
              status: 'ACTIVE'
            });
            setIsStructureModalOpen(true);
          }}
          data-agent="payroll-salary-add-btn"
          className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-sm text-xs font-bold py-2 px-3 flex items-center gap-1 cursor-pointer transition-all duration-300"
        >
          <Plus className="h-4 w-4" /> Add compensation profile
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee ID</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Designation</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Basic monthly</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">HRA</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">OT hourly rate</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Tax deduct %</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Statutory PF %</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">ESI %</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Status</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStructures ? (
                [1, 2].map(i => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={11} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                  </tr>
                ))
              ) : structures?.data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No salary structures configured yet.</td>
                </tr>
              ) : (
                structures?.data?.results?.map((str: any) => (
                  <tr key={str.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          str.is_employee_deleted 
                            ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-200/20' 
                            : 'bg-[#0a66c2]/10 text-[#0a66c2]'
                        }`}>
                          {str.is_employee_deleted ? '?' : (str.employee_name?.charAt(0) || 'E')}
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
                    <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-bold">{currencySymbol}{parseFloat(str.basic_salary || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-850 dark:text-slate-400 font-semibold">{currencySymbol}{parseFloat(str.hra || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-850 dark:text-slate-400 font-semibold">{currencySymbol}{parseFloat(str.overtime_rate || 0).toLocaleString()} / hr</td>
                    <td className="py-3 px-4 text-xs font-bold text-[#0a66c2]">{str.tax_percentage}%</td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{str.pf_percentage}%</td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{str.esi_percentage}%</td>
                    <td className="py-3 px-4">
                      <Badge className={`font-bold text-[9px] px-2 py-0.5 rounded-sm border shadow-none ${str.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-800'}`}>
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
                            toast('Permanently delete this salary structure?', {
                              description: 'This action cannot be undone.',
                              action: {
                                label: 'Delete',
                                onClick: () => deleteStructureMutation.mutate(str.id),
                              },
                              cancel: {
                                label: 'Cancel',
                                onClick: () => {},
                              },
                            });
                          }}
                          disabled={deleteStructureMutation.isPending}
                          title="Delete salary structure"
                          data-agent={`payroll-salary-delete-btn-${str.id}`}
                          className="border border-rose-200/60 dark:border-rose-900/40 bg-transparent hover:bg-rose-500/10 text-rose-600 dark:text-rose-450 h-8 w-8 rounded-sm cursor-pointer transition-all duration-300 flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Compensation Profile Modal */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/15 dark:bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/80 rounded-sm w-full max-w-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
            <button 
              onClick={() => setIsStructureModalOpen(false)}
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
                    onChange={(e) => setStructureForm({...structureForm, employee_id: e.target.value})}
                    data-agent="payroll-salary-employee-id-input"
                    className="w-full h-9 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-850 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer font-semibold"
                  >
                    <option value="">Select an employee...</option>
                    {employeesList.map((emp: any) => (
                      <option key={emp.id} value={emp.employee_id || emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'})
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
                    onChange={(e) => setStructureForm({...structureForm, basic_salary: e.target.value})}
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
                    onChange={(e) => setStructureForm({...structureForm, hra: e.target.value})}
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
                    onChange={(e) => setStructureForm({...structureForm, overtime_rate: e.target.value})}
                    data-agent="payroll-salary-ot-rate-input"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 tracking-wide">Default tax %</label>
                  <input 
                    type="number" 
                    value={structureForm.tax_percentage}
                    onChange={(e) => setStructureForm({...structureForm, tax_percentage: e.target.value})}
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
                    onChange={(e) => setStructureForm({...structureForm, pf_percentage: e.target.value})}
                    data-agent="payroll-salary-pf-percentage-input"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 tracking-wide">Statutory ESI %</label>
                  <input 
                    type="number" 
                    value={structureForm.esi_percentage}
                    onChange={(e) => setStructureForm({...structureForm, esi_percentage: e.target.value})}
                    data-agent="payroll-salary-esi-percentage-input"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  onClick={() => setIsStructureModalOpen(false)}
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
      )}

    </div>
  );
}

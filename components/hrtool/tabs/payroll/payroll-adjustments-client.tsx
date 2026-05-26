'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService, hrEmployeeService } from '@/services/hr';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { Plus, X, Sparkles, AlertCircle } from 'lucide-react';

export function PayrollAdjustmentsClient() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    adjustment_type: 'BONUS',
    amount: '',
    description: ''
  });

  const { data: adjustmentsRes, isLoading } = useQuery({
    queryKey: ['payroll-adjustments'],
    queryFn: () => hrPayrollService.getPayrollAdjustments(),
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['payroll-employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ limit: 100 }),
  });

  const employeesList = employeesRes?.data?.results || [];

  const mutation = useMutation({
    mutationFn: (data: any) => hrPayrollService.createPayrollAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-adjustments'] });
      setIsOpen(false);
      setForm({ employee_id: '', adjustment_type: 'BONUS', amount: '', description: '' });
      toast.success('Adjustment allocated successfully!');
    },
    onError: () => {
      toast.error('Failed to save payroll adjustment.');
    }
  });

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const list = adjustmentsRes?.data?.results || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bonuses & Manual Adjustments</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Allocate yearly bonuses, direct performance incentives, and correct monthly payout entries.</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-sm text-xs font-bold py-2 px-3 flex items-center gap-1 cursor-pointer transition-all duration-300"
        >
          <Plus className="h-4 w-4" /> Add manual adjustment
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Employee details</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Adjustment type</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Amount</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Description</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2].map(i => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-850">
                    <td colSpan={5} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No adjustments recorded yet.</td>
                </tr>
              ) : (
                list.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center">
                          {item.employee_name?.charAt(0) || 'E'}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.employee_name} {item.employee_last_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-none font-bold text-[9px] px-2 py-0.5 rounded-sm">
                        {toSentenceCase(item.adjustment_type)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-extrabold text-slate-900 dark:text-white">${parseFloat(item.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-450 truncate max-w-xs">{item.description}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[9px] px-2 py-0.5 rounded-sm">
                        Processed
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjustments Entry Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/15 dark:bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/80 rounded-sm w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0a66c2]" /> Record custom payout adjustment
            </h3>
            <p className="text-xs text-slate-500 mb-5">Manually post a bonus credit or attendance correction offset directly into the next processed payroll sheet.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">Employee</label>
                <select
                  value={form.employee_id}
                  onChange={(e) => setForm({...form, employee_id: e.target.value})}
                  data-agent="payroll-adjustment-employee-id-select"
                  className="w-full h-9 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-850 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer font-semibold"
                >
                  <option value="">Select an employee...</option>
                  {employeesList.map((emp: any) => (
                    <option key={emp.id} value={emp.employee_id || emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">Adjustment category</label>
                <select 
                  value={form.adjustment_type} 
                  onChange={(e) => setForm({...form, adjustment_type: e.target.value})}
                  className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="BONUS">Bonus Reward</option>
                  <option value="INCENTIVE">Direct Incentive</option>
                  <option value="DEDUCTION">Manual Deduction Penalty</option>
                  <option value="CORRECTION">Attendance Offset Correction</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">Adjustment amount ($)</label>
                <input 
                  type="number" 
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  placeholder="e.g. 1000"
                  className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">Reason / Description</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Provide explicit audit notes..."
                  className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2 text-xs text-slate-900 dark:text-white outline-none h-16 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="border border-slate-200 bg-transparent text-slate-600 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const parsedData = {
                      employee: form.employee_id,
                      adjustment_type: form.adjustment_type,
                      amount: parseFloat(form.amount),
                      description: form.description
                    };
                    mutation.mutate(parsedData);
                  }}
                  disabled={mutation.isPending}
                  className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Post adjustment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

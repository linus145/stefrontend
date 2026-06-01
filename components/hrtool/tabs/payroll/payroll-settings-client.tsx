'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService, hrEmployeeService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LocalLoader } from '@/components/ui/local-loader';
import { Landmark, Cpu, Save, RefreshCw, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PayrollSettingsClient() {
  const queryClient = useQueryClient();
  
  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['payroll-employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ limit: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => hrPayrollService.updateSettingsConfigs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-settings'] });
      alert('Payroll settings updated successfully!');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to update settings');
    }
  });

  const [formState, setFormState] = React.useState({
    currency: 'INR',
    statutory_pf_percentage: 12.00,
    statutory_esi_percentage: 1.75,
    automation_enabled: true,
    finance_approval_required: false,
    finance_manager: '',
    director_approval_required: false,
    director: ''
  });

  // Hydrate local form state when data finishes loading
  React.useEffect(() => {
    if (settingsRes?.data) {
      setFormState({
        currency: settingsRes.data.currency || 'INR',
        statutory_pf_percentage: settingsRes.data.statutory_pf_percentage || 12.00,
        statutory_esi_percentage: settingsRes.data.statutory_esi_percentage || 1.75,
        automation_enabled: settingsRes.data.automation_enabled ?? true,
        finance_approval_required: settingsRes.data.finance_approval_required ?? false,
        finance_manager: settingsRes.data.finance_manager || '',
        director_approval_required: settingsRes.data.director_approval_required ?? false,
        director: settingsRes.data.director || ''
      });
    }
  }, [settingsRes]);

  if (isLoading) {
    return <LocalLoader />;
  }

  const employeesList = employeesRes?.data?.results || [];
  // Filter active employees with linked user profile
  const activeLinkedEmployees = employeesList.filter((emp: any) => emp.user);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formState);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Payroll Settings & Automation</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Customize corporate payout automation models, default currency tokens, and compliance metrics.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* General Configurations */}
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Payout Parameters</CardTitle>
              <Landmark className="h-4.5 w-4.5 text-[#0a66c2]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Ledger Currency Symbol</label>
                <select
                  value={formState.currency}
                  onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (د.إ - UAE Dirham)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Statutory PF (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.statutory_pf_percentage}
                    onChange={(e) => setFormState({ ...formState, statutory_pf_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Statutory ESI (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.statutory_esi_percentage}
                    onChange={(e) => setFormState({ ...formState, statutory_esi_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Automation Configurations */}
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Automation & Compliance</CardTitle>
              <Cpu className="h-4.5 w-4.5 text-[#0a66c2]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Automated Calculation Process</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, automation_enabled: true })}
                    className={`flex-1 h-9 rounded-sm font-extrabold text-xs transition-all border ${
                      formState.automation_enabled
                        ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                        : 'bg-white dark:bg-[#1c1d30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, automation_enabled: false })}
                    className={`flex-1 h-9 rounded-sm font-extrabold text-xs transition-all border ${
                      !formState.automation_enabled
                        ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                        : 'bg-white dark:bg-[#1c1d30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-550 font-bold uppercase">Compliance status:</span>
                <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-none font-black text-[9px] px-2.5 py-1 rounded-sm">
                  COMPLIANT
                </Badge>
              </div>

            </CardContent>
          </Card>

          {/* Card 3: Approval Stages & Hierarchy Settings */}
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm md:col-span-2">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Approval Hierarchy Settings</CardTitle>
              <Workflow className="h-4.5 w-4.5 text-[#0a66c2]" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level 1: Finance Manager Stage */}
                <div className="space-y-4 p-4 rounded-sm bg-slate-50/50 dark:bg-[#151624]/30 border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Level 1: Finance Manager Approval</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ 
                        ...formState, 
                        finance_approval_required: !formState.finance_approval_required,
                        finance_manager: formState.finance_approval_required ? '' : formState.finance_manager 
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                        formState.finance_approval_required ? 'bg-[#0a66c2]' : 'bg-slate-200 dark:bg-slate-800/80'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
                          formState.finance_approval_required ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {formState.finance_approval_required && (
                    <div className="space-y-1.5 animate-in fade-in duration-205">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Designated Finance Manager</label>
                      <select
                        value={formState.finance_manager}
                        onChange={(e) => setFormState({ ...formState, finance_manager: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm font-semibold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                      >
                        <option value="">Select Finance Manager...</option>
                        {activeLinkedEmployees.map((emp: any) => (
                          <option key={emp.id} value={emp.user}>
                            {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Level 2: Director Stage */}
                <div className="space-y-4 p-4 rounded-sm bg-slate-50/50 dark:bg-[#151624]/30 border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Level 2: Director Approval</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ 
                        ...formState, 
                        director_approval_required: !formState.director_approval_required,
                        director: formState.director_approval_required ? '' : formState.director 
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                        formState.director_approval_required ? 'bg-[#0a66c2]' : 'bg-slate-200 dark:bg-slate-800/80'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
                          formState.director_approval_required ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {formState.director_approval_required && (
                    <div className="space-y-1.5 animate-in fade-in duration-205">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Designated Director</label>
                      <select
                        value={formState.director}
                        onChange={(e) => setFormState({ ...formState, director: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-sm font-semibold focus:outline-none focus:border-[#0a66c2] cursor-pointer"
                      >
                        <option value="">Select Director...</option>
                        {activeLinkedEmployees.map((emp: any) => (
                          <option key={emp.id} value={emp.user}>
                            {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 h-9 rounded-sm shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving settings...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

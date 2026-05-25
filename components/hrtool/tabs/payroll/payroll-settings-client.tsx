'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LocalLoader } from '@/components/ui/local-loader';
import { Landmark, Cpu, Save, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PayrollSettingsClient() {
  const queryClient = useQueryClient();
  
  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
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
    automation_enabled: true
  });

  // Hydrate local form state when data finishes loading
  React.useEffect(() => {
    if (settingsRes?.data) {
      setFormState({
        currency: settingsRes.data.currency || 'INR',
        statutory_pf_percentage: settingsRes.data.statutory_pf_percentage || 12.00,
        statutory_esi_percentage: settingsRes.data.statutory_esi_percentage || 1.75,
        automation_enabled: settingsRes.data.automation_enabled ?? true
      });
    }
  }, [settingsRes]);

  if (isLoading) {
    return <LocalLoader />;
  }

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
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm">
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-[#0a66c2]"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Statutory ESI (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.statutory_esi_percentage}
                    onChange={(e) => setFormState({ ...formState, statutory_esi_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Automation Configurations */}
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm">
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
                    className={`flex-1 h-9 rounded-md font-extrabold text-xs transition-all border ${
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
                    className={`flex-1 h-9 rounded-md font-extrabold text-xs transition-all border ${
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
                <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-none font-black text-[9px] px-2.5 py-1 rounded-md">
                  COMPLIANT
                </Badge>
              </div>

            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 h-9 rounded-md shadow-sm flex items-center gap-2"
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

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrLeaveService } from '@/services/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocalLoader } from '@/components/ui/local-loader';
import {
  Settings, Sliders, ShieldCheck, Users, Save,
  Calendar, Check, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export function LeaveSettingsView() {
  const queryClient = useQueryClient();

  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['leave-settings'],
    queryFn: () => hrLeaveService.getLeaveSettings(),
  });

  const [applyToAll, setApplyToAll] = useState(true);
  const [quotasState, setQuotasState] = useState<{
    [category: string]: {
      max_days_per_year: number | '';
      is_paid: boolean;
      carry_forward: boolean;
      description: string;
      name: string;
    };
  }>({
    ANNUAL: { max_days_per_year: 18, is_paid: true, carry_forward: true, description: 'Standard annual paid vacation entitlement.', name: 'Annual Leave' },
    SICK: { max_days_per_year: 10, is_paid: true, carry_forward: false, description: 'Medical and health-related emergency leave.', name: 'Sick Leave' },
    CASUAL: { max_days_per_year: 7, is_paid: true, carry_forward: false, description: 'Unplanned personal time-off or short casual absences.', name: 'Casual Leave' },
    OCCASIONAL: { max_days_per_year: 30, is_paid: true, carry_forward: false, description: 'Parental leave for childbirth or adoption.', name: 'Maternity/Paternity Leave' },
    NATIONAL: { max_days_per_year: 0, is_paid: true, carry_forward: false, description: 'Gazetted public holidays and optional cultural leaves.', name: 'National Holiday / Leave' },
  });

  const [policiesState, setPoliciesState] = useState({
    advance_notice_days: 3,
    require_medical_cert_days: 2,
    max_consecutive_days: 14,
    allow_negative_balance: false,
  });

  useEffect(() => {
    if (settingsRes?.data?.quotas) {
      const fetchedQuotas = settingsRes.data.quotas;
      setQuotasState(prev => {
        const next = { ...prev };
        Object.keys(fetchedQuotas).forEach(cat => {
          if (next[cat]) {
            next[cat] = {
              ...next[cat],
              max_days_per_year: fetchedQuotas[cat].max_days_per_year ?? next[cat].max_days_per_year,
              is_paid: fetchedQuotas[cat].is_paid ?? next[cat].is_paid,
              carry_forward: fetchedQuotas[cat].carry_forward ?? next[cat].carry_forward,
              description: fetchedQuotas[cat].description || next[cat].description,
              name: fetchedQuotas[cat].name || next[cat].name,
            };
          }
        });
        return next;
      });
    }

    if (settingsRes?.data?.policies) {
      setPoliciesState(prev => ({
        ...prev,
        ...settingsRes.data.policies,
      }));
    }
  }, [settingsRes]);

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: any) => hrLeaveService.updateLeaveSettings(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['leave-settings'] });
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      queryClient.invalidateQueries({ queryKey: ['employee-leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr-employees-all'] });
      const count = res?.data?.applied_employee_count ?? 0;
      toast.success(`Leave settings saved and successfully applied to ${count} employees!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save settings');
    }
  });

  const handleSave = () => {
    const payload = {
      quotas: quotasState,
      policies: policiesState,
      apply_to_all_employees: applyToAll,
    };
    updateSettingsMutation.mutate(payload);
  };

  const handleQuotaChange = (category: string, field: string, value: any) => {
    setQuotasState(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <LocalLoader />
      </div>
    );
  }

  const totalEmployees = settingsRes?.data?.total_employees || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-[#0a66c2]" /> Company Leave Settings & Policies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Define global annual leave allotments and propagation rules for all organization team members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold px-5 h-9 rounded-sm shadow-md shadow-blue-500/15 cursor-pointer flex items-center gap-1.5"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Applying Settings...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save & Apply to All Employees
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#121320] border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400">Total Team Members</p>
            <h4 className="text-base font-normal text-slate-900 dark:text-white">{totalEmployees} Employees</h4>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#121320] border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400">Leave Categories</p>
            <h4 className="text-base font-normal text-slate-900 dark:text-white">5 Active Quota Types</h4>
          </div>
        </Card>

        <Card className="bg-white dark:bg-[#121320] border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400">Effective Cycle</p>
            <h4 className="text-base font-normal text-slate-900 dark:text-white">Calendar Year {new Date().getFullYear()}</h4>
          </div>
        </Card>
      </div>

      {/* Global Category Quotas */}
      <Card className="bg-white dark:bg-[#121320] border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <CardTitle className="text-sm font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#0a66c2]" /> Standard Annual Leave Allotments
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-normal">
            Set the default number of leave days allocated per employee per calendar year for each leave type.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Annual Leave */}
            <div className="p-4 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-white/[0.01] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20 text-[10px] rounded-sm font-normal">
                    ANNUAL
                  </Badge>
                  Annual Leave
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-normal">Carry Forward</label>
                  <input
                    type="checkbox"
                    checked={quotasState.ANNUAL.carry_forward}
                    onChange={(e) => handleQuotaChange('ANNUAL', 'carry_forward', e.target.checked)}
                    className="accent-[#0a66c2] h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-600 dark:text-slate-400 block mb-1">
                  Default Days / Year
                </label>
                <Input
                  type="number"
                  min="0"
                  value={quotasState.ANNUAL.max_days_per_year}
                  onChange={(e) => handleQuotaChange('ANNUAL', 'max_days_per_year', e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-8.5 text-xs rounded-sm font-normal"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                Standard earned vacation time. Employees can take paid vacation throughout the year.
              </p>
            </div>

            {/* Sick Leave */}
            <div className="p-4 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-white/[0.01] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] rounded-sm font-normal">
                    SICK
                  </Badge>
                  Sick Leave
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-normal">Paid Leave</label>
                  <input
                    type="checkbox"
                    checked={quotasState.SICK.is_paid}
                    onChange={(e) => handleQuotaChange('SICK', 'is_paid', e.target.checked)}
                    className="accent-[#0a66c2] h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-600 dark:text-slate-400 block mb-1">
                  Default Days / Year
                </label>
                <Input
                  type="number"
                  min="0"
                  value={quotasState.SICK.max_days_per_year}
                  onChange={(e) => handleQuotaChange('SICK', 'max_days_per_year', e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-8.5 text-xs rounded-sm font-normal"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                Paid sick days for medical conditions, appointments, and recovery.
              </p>
            </div>

            {/* Casual Leave */}
            <div className="p-4 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-white/[0.01] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] rounded-sm font-normal">
                    CASUAL
                  </Badge>
                  Casual Leave
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-normal">Paid Leave</label>
                  <input
                    type="checkbox"
                    checked={quotasState.CASUAL.is_paid}
                    onChange={(e) => handleQuotaChange('CASUAL', 'is_paid', e.target.checked)}
                    className="accent-[#0a66c2] h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-600 dark:text-slate-400 block mb-1">
                  Default Days / Year
                </label>
                <Input
                  type="number"
                  min="0"
                  value={quotasState.CASUAL.max_days_per_year}
                  onChange={(e) => handleQuotaChange('CASUAL', 'max_days_per_year', e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-8.5 text-xs rounded-sm font-normal"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                Short personal leave for urgent unplanned errands or personal events.
              </p>
            </div>

            {/* Maternity / Paternity */}
            <div className="p-4 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-white/[0.01] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] rounded-sm font-normal">
                    PARENTAL
                  </Badge>
                  Maternity/Paternity Leave
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500 font-normal">Paid Leave</label>
                  <input
                    type="checkbox"
                    checked={quotasState.OCCASIONAL.is_paid}
                    onChange={(e) => handleQuotaChange('OCCASIONAL', 'is_paid', e.target.checked)}
                    className="accent-[#0a66c2] h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-600 dark:text-slate-400 block mb-1">
                  Default Days / Year
                </label>
                <Input
                  type="number"
                  min="0"
                  value={quotasState.OCCASIONAL.max_days_per_year}
                  onChange={(e) => handleQuotaChange('OCCASIONAL', 'max_days_per_year', e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-8.5 text-xs rounded-sm font-normal"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                Extended parental leave for newborn care or adoption.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Propagation & Action Box */}
      <Card className="bg-[#0a66c2]/5 border border-[#0a66c2]/20 rounded-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="apply-all-checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="accent-[#0a66c2] h-4 w-4 mt-0.5 cursor-pointer"
            />
            <div>
              <label htmlFor="apply-all-checkbox" className="text-xs font-normal text-slate-900 dark:text-white cursor-pointer">
                Automatically propagate and update leave quotas for all {totalEmployees} active employees
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                When checked, any changes to standard days will be immediately applied to each team member&apos;s annual leave account.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-normal px-6 h-9 rounded-sm shadow-sm cursor-pointer shrink-0"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

    </div>
  );
}

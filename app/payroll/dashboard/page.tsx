'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalLoader } from '@/components/ui/local-loader';
import { 
  DollarSign, TrendingUp, Percent, ShieldAlert, AlertCircle, 
  ArrowRight, CreditCard, ChevronRight, Activity, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function PayrollDashboardPage() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['payroll-analytics'],
    queryFn: () => hrPayrollService.getDashboardAnalytics(),
  });

  const { data: payrolls, isLoading: isPayrollsLoading } = useQuery({
    queryKey: ['payrolls'],
    queryFn: () => hrPayrollService.getPayrolls(),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  if (isAnalyticsLoading || isPayrollsLoading) {
    return <LocalLoader />;
  }

  const data = analytics?.data || {};
  const recentRuns = payrolls?.data?.results?.slice(0, 5) || [];

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

  const getMonthName = (m: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[m - 1] || 'Unknown';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DRAFT': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400';
      case 'PROCESSED': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Payroll Executive Hub</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Comprehensive real-time startup payouts ledger & compliance monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/payroll/runs">
            <Button className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/10 rounded-md py-2 px-4 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all duration-300">
              Run payroll ledger <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Total disbursed</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {currencySymbol}{data.total_payroll_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> +8.4% MoM growth
              </p>
            </div>
            <div className="w-10 h-10 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Taxes withheld</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {currencySymbol}{data.total_tax_deductions?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">TDS deposits automatic track</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-[#0a66c2]/10 text-[#0a66c2] dark:bg-[#0a66c2]/20 dark:text-[#3b8fd9] flex items-center justify-center">
              <Percent className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">PF & insurance</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {currencySymbol}{data.total_pf_deductions?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">Ready for compliance submission</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Pending approvals</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {data.pending_approvals || '0'} Run(s)
              </h3>
              <p className="text-[10px] text-amber-500 font-semibold">Requires executive sign-off</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Runs Card */}
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 lg:col-span-2 rounded-md shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-[#0a66c2]" /> Recent payroll execution runs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {recentRuns.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">No payroll runs found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRuns.map((run: any) => (
                  <div key={run.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2]">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {getMonthName(run.month)} {run.year}
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">Contains {run.records_count || 0} payroll entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusBadgeColor(run.status)} font-bold text-[9px] px-2 py-0.5 rounded-md border shadow-none`}>
                        {run.status}
                      </Badge>
                      <Link href="/payroll/runs">
                        <Button className="h-7 px-2.5 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-55 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-extrabold cursor-pointer">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-[#0a66c2]" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Link href="/payroll/runs" className="block">
                <div className="p-3 bg-[#f8fafc] dark:bg-[#151624] hover:bg-[#0a66c2]/5 dark:hover:bg-[#0a66c2]/10 border border-slate-200/50 dark:border-slate-805 rounded-md transition-all flex items-center justify-between cursor-pointer group">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Process Payroll Run</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Calculate monthly attendance payouts.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0a66c2] transition-colors" />
                </div>
              </Link>

              <Link href="/payroll/salary-structures" className="block">
                <div className="p-3 bg-[#f8fafc] dark:bg-[#151624] hover:bg-[#0a66c2]/5 dark:hover:bg-[#0a66c2]/10 border border-slate-200/50 dark:border-slate-805 rounded-md transition-all flex items-center justify-between cursor-pointer group">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Configure Compensation</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Add basic salary or allowance rules.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0a66c2] transition-colors" />
                </div>
              </Link>

              <Link href="/payroll/reimbursements" className="block">
                <div className="p-3 bg-[#f8fafc] dark:bg-[#151624] hover:bg-[#0a66c2]/5 dark:hover:bg-[#0a66c2]/10 border border-slate-200/50 dark:border-slate-805 rounded-md transition-all flex items-center justify-between cursor-pointer group">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Verify Expense Claims</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Approve outstanding reimbursement files.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0a66c2] transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}

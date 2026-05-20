'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LocalLoader } from '@/components/ui/local-loader';
import { BarChart3, Users, Landmark, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ['payroll-reports'],
    queryFn: () => hrPayrollService.getReportsAnalytics(),
  });

  if (isLoading) {
    return <LocalLoader />;
  }

  const reports = reportsRes?.data || { departments: [], active_employees: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Reports & Ledger Summaries</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Generate statutory tax reports, monitor startup payout graphs, and download payroll balances.</p>
        </div>
        <Button className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-md text-xs font-bold py-2 px-3 flex items-center gap-1.5 cursor-pointer">
          <Download className="h-4 w-4" /> Export CSV Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Active Headcount Card */}
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Headcount Audit</CardTitle>
            <Users className="h-4.5 w-4.5 text-[#0a66c2]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{reports.active_employees || 0}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Active team members processed in the current cycle</p>
          </CardContent>
        </Card>

        {/* Headcount Department Breakdown */}
        <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm">
          <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">Departmental breakdown</CardTitle>
            <Landmark className="h-4.5 w-4.5 text-[#0a66c2]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {reports.departments?.length === 0 ? (
              <p className="text-xs text-slate-400">No departments setup.</p>
            ) : (
              <div className="space-y-1">
                {reports.departments?.map((dept: any, i: number) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0 dark:border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-800 dark:text-slate-200 font-bold block">{dept.name || 'General Staff'}</span>
                      {dept.members && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-normal">{dept.members}</span>
                      )}
                    </div>
                    <span className="font-bold text-[#0a66c2] dark:text-blue-400 shrink-0 text-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-full ml-3">
                      {dept.count} {dept.count === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}

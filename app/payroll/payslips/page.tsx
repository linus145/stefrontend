'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import {
  Download, FileText, Search, Calendar, ChevronRight
} from 'lucide-react';

export default function PayslipsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: payslipsRes, isLoading } = useQuery({
    queryKey: ['payslips', page],
    queryFn: () => hrPayrollService.getPayslips({ page }),
  });

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

  const getMonthName = (m: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[m - 1] || 'Unknown';
  };

  const list = payslipsRes?.data?.results || [];

  const filteredList = list.filter((item: any) => {
    const isApproved = item.payroll_detail?.status === 'APPROVED' || item.payroll_detail?.status === 'PAID';
    if (!isApproved) return false;
    const name = `${item.employee_detail?.first_name || ''} ${item.employee_detail?.last_name || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const sortedList = [...filteredList].sort((a: any, b: any) => {
    const yearA = a.payroll_detail?.year || 0;
    const yearB = b.payroll_detail?.year || 0;
    if (yearB !== yearA) return yearB - yearA;
    return (b.payroll_detail?.month || 0) - (a.payroll_detail?.month || 0);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Payslip Disbursements Archive</h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Access history sheets, verify issued payslips, and dispatch monthly receipts.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name..."
            className="pl-9 h-10 w-full rounded-md border border-slate-200 dark:border-slate-850 outline-none bg-white dark:bg-[#121320]"
          />
        </div>
      </div>

      <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Employee</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Payslip month</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={3} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                  </tr>
                ))
              ) : sortedList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No published employee payslips found.</td>
                </tr>
              ) : (
                sortedList.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center">
                          {item.employee_detail?.first_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.employee_detail?.first_name} {item.employee_detail?.last_name}
                            <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                              ({item.employee_detail?.employee_id || 'No ID'})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {item.employee_detail?.designation_detail?.title || 'Team Member'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {getMonthName(item.payroll_detail?.month)} {item.payroll_detail?.year}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/payroll/payslips/${item.id}/download/`}
                        download
                        title="Download"
                        className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-450 font-bold text-[10px] h-8 w-8 p-0 rounded-md cursor-pointer transition-all duration-300"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Controls */}
      {(payslipsRes?.data?.count ?? 0) > 0 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="text-xs h-8 px-4 rounded-md border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Previous
          </Button>
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Page {page} of {Math.max(1, Math.ceil((payslipsRes?.data?.count || 0) / 10))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!payslipsRes?.data?.next || isLoading}
            className="text-xs h-8 px-4 rounded-md border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}

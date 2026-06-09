'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import {
  Download, Mail, FileText, Search, Calendar, ChevronRight, ChevronDown, Filter, User, Briefcase, IndianRupee, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function PayrollPayslipsClient() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDownload = async (id: string, name: string) => {
    try {
      setIsDownloading(id);
      const response = await api.get(`/payroll/payslips/${id}/download/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download payslip");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleSendSingleEmail = async (id: string, name: string) => {
    try {
      setIsSending(id);
      await hrPayrollService.sendPayslipEmail(id);
      toast.success(`Payslip email queued for ${name}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to queue payslip email");
    } finally {
      setIsSending(null);
    }
  };

  const handleBulkEmail = async (month: number, year: number) => {
    const monthName = MONTHS.find(m => m.value === month)?.label || `${month}`;
    try {
      setIsSending(`${month}-${year}`);
      await hrPayrollService.bulkSendPayslipEmails({ month, year });
      toast.success(`Bulk emails queued for all payslips in ${monthName} ${year}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to queue bulk emails");
    } finally {
      setIsSending(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the payslip for ${name}? This action cannot be undone.`)) return;
    try {
      setIsDeleting(id);
      await hrPayrollService.deletePayslip(id);
      toast.success(`Payslip for ${name} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete payslip");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAll = async (payslips: any[]) => {
    const count = payslips.length;
    if (!confirm(`Are you sure you want to delete all ${count} payslip${count !== 1 ? 's' : ''} in this period? This action cannot be undone.`)) return;
    try {
      setIsDeleting('bulk');
      for (const item of payslips) {
        await hrPayrollService.deletePayslip(item.id);
      }
      toast.success(`${count} payslip${count !== 1 ? 's' : ''} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete payslips");
    } finally {
      setIsDeleting(null);
    }
  };

  // Build query params for the API
  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page };
    if (selectedMonth) params.month = selectedMonth;
    if (selectedYear) params.year = selectedYear;
    return params;
  }, [page, selectedMonth, selectedYear]);

  const { data: payslipsRes, isLoading } = useQuery({
    queryKey: ['payslips', page, selectedMonth, selectedYear],
    queryFn: () => hrPayrollService.getPayslips(queryParams),
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
    return MONTHS[m - 1]?.label || 'Unknown';
  };

  const list = payslipsRes?.data?.results || [];

  const filteredList = list.filter((item: any) => {
    const isApproved = item.payroll_detail?.status === 'APPROVED' || item.payroll_detail?.status === 'PAID';
    if (!isApproved) return false;
    const name = `${item.employee_detail?.first_name || ''} ${item.employee_detail?.last_name || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // Group payslips by month/year
  const groupedPayslips = useMemo(() => {
    const groups: Record<string, { month: number; year: number; label: string; payslips: any[] }> = {};

    const sortedList = [...filteredList].sort((a: any, b: any) => {
      const yearA = a.payroll_detail?.year || 0;
      const yearB = b.payroll_detail?.year || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (b.payroll_detail?.month || 0) - (a.payroll_detail?.month || 0);
    });

    sortedList.forEach((item: any) => {
      const month = item.payroll_detail?.month || 0;
      const year = item.payroll_detail?.year || 0;
      const key = `${year}-${month}`;
      if (!groups[key]) {
        groups[key] = {
          month,
          year,
          label: `${getMonthName(month)} ${year}`,
          payslips: [],
        };
      }
      groups[key].payslips.push(item);
    });

    return Object.values(groups);
  }, [filteredList]);

  // Generate available years (current year ± 3)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i).reverse();

  const handleMonthSelect = (month: number | null) => {
    setSelectedMonth(month);
    setPage(1);
    setMonthDropdownOpen(false);
  };

  const handleYearSelect = (year: number | null) => {
    setSelectedYear(year);
    setPage(1);
    setYearDropdownOpen(false);
  };

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setSearch('');
    setPage(1);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const hasActiveFilters = selectedMonth !== null || selectedYear !== null;

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Payslip Disbursements Archive</h2>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name..."
            className="pl-9 h-10 w-full rounded-sm border border-slate-200 dark:border-slate-850 outline-none bg-white dark:bg-[#121320]"
          />
        </div>

        {/* Month Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
            className="flex items-center gap-2 h-10 px-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121320] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer min-w-[140px]"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {selectedMonth ? getMonthName(selectedMonth) : 'All Months'}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 ml-auto shrink-0 transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {monthDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white dark:bg-[#1a1b2e] border border-slate-200 dark:border-slate-800 rounded-sm shadow-lg z-50 max-h-[280px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => handleMonthSelect(null)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${selectedMonth === null
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
              >
                All Months
              </button>
              {MONTHS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleMonthSelect(m.value)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${selectedMonth === m.value
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
            className="flex items-center gap-2 h-10 px-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121320] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer min-w-[110px]"
          >
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {selectedYear ? String(selectedYear) : 'All Years'}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 ml-auto shrink-0 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {yearDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[130px] bg-white dark:bg-[#1a1b2e] border border-slate-200 dark:border-slate-800 rounded-sm shadow-lg z-50 max-h-[240px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => handleYearSelect(null)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${selectedYear === null
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
              >
                All Years
              </button>
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${selectedYear === y
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear filters badge */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-sm border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-900/20 text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all duration-200 cursor-pointer"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filters:</span>
          {selectedMonth && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              <Calendar className="h-3 w-3" />
              {getMonthName(selectedMonth)}
            </span>
          )}
          {selectedYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {selectedYear}
            </span>
          )}
        </div>
      )}

      {/* Accordion Payslip Groups */}
      <div className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm">
              <div className="p-4">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-sm w-48" />
              </div>
            </Card>
          ))
        ) : groupedPayslips.length === 0 ? (
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 rounded-sm shadow-sm">
            <div className="py-12 text-center">
              <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-semibold tracking-wide">
                {hasActiveFilters
                  ? 'No payslips found for the selected filters.'
                  : 'No published employee payslips found.'
                }
              </p>
            </div>
          </Card>
        ) : (
          groupedPayslips.map((group) => {
            const groupKey = `${group.year}-${group.month}`;
            const isExpanded = expandedGroups.has(groupKey);

            return (
              <Card
                key={groupKey}
                className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/60 rounded-sm shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Accordion Header — the date row */}
                <div
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/10 transition-colors duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {group.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {group.payslips.length} payslip{group.payslips.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSending !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBulkEmail(group.month, group.year);
                      }}
                      className="h-7 px-2.5 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-800 text-blue-650 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-400 font-bold text-[10px] rounded-sm cursor-pointer transition-all duration-200 mr-1 bg-transparent"
                    >
                      <Mail className="h-3 w-3" /> Email All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isDeleting !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAll(group.payslips);
                      }}
                      className="h-7 px-2.5 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 font-bold text-[10px] rounded-sm cursor-pointer transition-all duration-200 mr-1 bg-transparent"
                    >
                      <Trash2 className="h-3 w-3" /> Delete All
                    </Button>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {/* Accordion Body — payslip cards inside */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {group.payslips.map((item: any, idx: number) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors duration-150 ${idx < group.payslips.length - 1 ? 'border-b border-slate-100/80 dark:border-slate-800/30' : ''
                          }`}
                      >
                        {/* Employee Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center shrink-0">
                            {item.employee_detail?.first_name?.charAt(0) || 'E'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.employee_detail?.first_name} {item.employee_detail?.last_name}
                              <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                                ({item.employee_detail?.employee_id || 'No ID'})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                              {item.employee_detail?.designation_detail?.title || 'Team Member'}
                              {item.employee_detail?.email && (
                                <>
                                  <span className="text-slate-200 dark:text-slate-800 mx-1.5">|</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium lowercase">
                                    {item.employee_detail.email}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Net Salary */}
                        <div className="hidden sm:flex items-center gap-1.5 px-4">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {currencySymbol}{Number(item.net_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">Net</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownload(item.id, `${item.employee_detail?.first_name || 'employee'}_${item.payroll_detail?.month || ''}_${item.payroll_detail?.year || ''}`)}
                            disabled={isDownloading !== null}
                            title="Download Payslip"
                            className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-800 text-slate-600 dark:text-slate-450 hover:text-teal-700 dark:hover:text-teal-400 font-bold text-[10px] h-8 w-8 p-0 rounded-sm cursor-pointer transition-all duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDownloading === item.id ? (
                              <div className="h-3.5 w-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <Button
                            size="sm"
                            variant="outline"
                            title="Email Payslip"
                            disabled={isSending !== null}
                            onClick={() => handleSendSingleEmail(item.id, `${item.employee_detail?.first_name} ${item.employee_detail?.last_name}`)}
                            className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-800 text-slate-600 dark:text-slate-450 hover:text-blue-700 dark:hover:text-blue-400 font-bold text-[10px] h-8 w-8 p-0 rounded-sm cursor-pointer transition-all duration-200 bg-transparent"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, `${item.employee_detail?.first_name || ''} ${item.employee_detail?.last_name || ''}`)}
                            disabled={isDeleting !== null}
                            title="Delete Payslip"
                            className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 text-slate-600 dark:text-slate-450 hover:text-red-600 dark:hover:text-red-400 font-bold text-[10px] h-8 w-8 p-0 rounded-sm cursor-pointer transition-all duration-200 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting === item.id ? (
                              <div className="h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {(payslipsRes?.data?.count ?? 0) > 0 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="text-xs h-8 px-4 rounded-sm border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
            className="text-xs h-8 px-4 rounded-sm border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrLeaveService, hrEmployeeService } from '@/services/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LocalLoader } from '@/components/ui/local-loader';
import {
  Users, Search, SlidersHorizontal, Edit3, Check, X,
  Calendar, ShieldCheck, Sparkles, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeBalancesViewProps {
  // Optional props
}

interface GroupedEmployeeBalance {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeCode: string;
  department: string;
  designation: string;
  avatarUrl?: string;
  balances: {
    [leaveCategory: string]: {
      id: string;
      leaveTypeId: string;
      leaveTypeName: string;
      totalDays: number;
      usedDays: number;
      remainingDays: number;
    };
  };
  totalAllotted: number;
  totalUsed: number;
  totalRemaining: number;
}

export function EmployeeBalancesView() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  // Keep page input in sync whenever page changes
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDept, selectedYear]);

  // Edit Quota Modal State
  const [editingBalance, setEditingBalance] = useState<{
    employeeName: string;
    leaveCategory: string;
    balanceId: string;
    totalDays: number;
    usedDays: number;
  } | null>(null);
  const [newTotalDays, setNewTotalDays] = useState<number | ''>(0);
  const [newUsedDays, setNewUsedDays] = useState<number | ''>(0);

  // Fetch all employees in the organization/directory
  const { data: employeesRes, isLoading: employeesLoading } = useQuery({
    queryKey: ['hr-employees-all'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 1000 }),
  });

  // Fetch leave balances for the selected year
  const { data: rawBalancesRes, isLoading: balancesLoading } = useQuery({
    queryKey: ['employee-leave-balances', selectedYear],
    queryFn: () => hrLeaveService.getLeaveBalances({ year: selectedYear, page_size: 1000 }),
  });

  // Fetch company leave types for live default quotas
  const { data: leaveTypesRes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => hrLeaveService.getLeaveTypes(),
  });

  const isLoading = employeesLoading || balancesLoading;

  const updateBalanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrLeaveService.updateLeaveBalance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leave-balances'] });
      toast.success('Employee leave quota updated successfully!');
      setEditingBalance(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update quota.');
    }
  });

  const normalizeCategory = (catOrName?: string): string => {
    if (!catOrName) return 'OTHER';
    const upper = catOrName.toUpperCase();
    if (upper.includes('ANNUAL') || upper.includes('VACATION')) return 'ANNUAL';
    if (upper.includes('SICK') || upper.includes('MEDICAL')) return 'SICK';
    if (upper.includes('CASUAL') || upper.includes('PERSONAL')) return 'CASUAL';
    if (upper.includes('PARENTAL') || upper.includes('MATERNITY') || upper.includes('PATERNITY') || upper.includes('OCCASIONAL')) return 'OCCASIONAL';
    if (upper.includes('NATIONAL') || upper.includes('HOLIDAY')) return 'NATIONAL';
    return upper;
  };

  const defaultLeaveTypes = useMemo(() => {
    const rawTypes = Array.isArray(leaveTypesRes?.data?.results)
      ? leaveTypesRes.data.results
      : Array.isArray(leaveTypesRes?.data)
        ? leaveTypesRes.data
        : [];

    const defaults: Record<string, { name: string; total: number }> = {
      ANNUAL: { name: 'Annual Leave', total: 10 },
      SICK: { name: 'Sick Leave', total: 10 },
      CASUAL: { name: 'Casual Leave', total: 7 },
      OCCASIONAL: { name: 'Maternity/Paternity Leave', total: 30 },
    };

    rawTypes.forEach((lt: any) => {
      const cat = normalizeCategory(lt.category || lt.name);
      if (defaults[cat]) {
        defaults[cat] = {
          name: lt.name || defaults[cat].name,
          total: parseFloat(lt.max_days_per_year ?? defaults[cat].total),
        };
      }
    });

    return defaults;
  }, [leaveTypesRes]);

  // Group and merge every employee with their respective leave balances
  const groupedEmployees = useMemo(() => {
    const employeesList = Array.isArray(employeesRes?.data?.results)
      ? employeesRes.data.results
      : Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : [];

    const rawBalances = Array.isArray(rawBalancesRes?.data?.results)
      ? rawBalancesRes.data.results
      : Array.isArray(rawBalancesRes?.data)
        ? rawBalancesRes.data
        : [];

    // Index balances by employeeId
    const balancesByEmpId = new Map<string, any[]>();
    rawBalances.forEach((item: any) => {
      const emp = item.employee_detail || item.employee;
      const empId = typeof emp === 'object' ? emp?.id : String(emp);
      if (!empId) return;
      if (!balancesByEmpId.has(empId)) {
        balancesByEmpId.set(empId, []);
      }
      balancesByEmpId.get(empId)!.push(item);
    });

    return employeesList.map((emp: any) => {
      const empId = emp.id;
      const empName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.name || 'Unnamed Employee';
      const empEmail = emp.email || emp.user?.email || 'N/A';
      const empCode = emp.employee_id || emp.id?.substring(0, 8);
      const deptName = emp.department?.name || emp.department_detail?.name || 'General';
      const desigTitle = emp.designation?.title || emp.designation_detail?.title || 'Team Member';
      const avatar = emp.avatar || emp.profile_image;

      const empBalances = balancesByEmpId.get(empId) || [];
      const balancesMap: GroupedEmployeeBalance['balances'] = {};
      let totalAllotted = 0;
      let totalUsed = 0;
      let totalRemaining = 0;

      // Populate from fetched balances
      empBalances.forEach((item: any) => {
        const rawCat = item.leave_type_detail?.category || item.leave_type_name || item.leave_type?.name || 'OTHER';
        const catKey = normalizeCategory(rawCat);
        const total = parseFloat(item.total_days ?? 0);
        const used = parseFloat(item.used_days ?? 0);
        const rem = parseFloat(item.remaining_days !== undefined ? item.remaining_days : (total - used));

        // If duplicate in DB, prefer the record with used_days > 0 or existing
        if (!balancesMap[catKey] || used > balancesMap[catKey].usedDays) {
          balancesMap[catKey] = {
            id: item.id,
            leaveTypeId: item.leave_type,
            leaveTypeName: item.leave_type_name || item.leave_type_detail?.name || defaultLeaveTypes[catKey]?.name || catKey,
            totalDays: total,
            usedDays: used,
            remainingDays: rem,
          };
        }
      });

      // Fallback defaults for standard categories if not populated
      const standardKeys = ['ANNUAL', 'SICK', 'CASUAL', 'OCCASIONAL'];
      standardKeys.forEach((k) => {
        if (!balancesMap[k]) {
          const def = defaultLeaveTypes[k] || { name: k, total: 0 };
          balancesMap[k] = {
            id: '',
            leaveTypeId: '',
            leaveTypeName: def.name,
            totalDays: def.total,
            usedDays: 0,
            remainingDays: def.total,
          };
        }
      });

      // Compute totals across standard categories
      standardKeys.forEach((k) => {
        const b = balancesMap[k];
        if (b) {
          totalAllotted += b.totalDays;
          totalUsed += b.usedDays;
          totalRemaining += Math.max(0, b.totalDays - b.usedDays);
        }
      });

      return {
        employeeId: empId,
        employeeName: empName,
        employeeEmail: empEmail,
        employeeCode: empCode,
        department: deptName,
        designation: desigTitle,
        avatarUrl: avatar,
        balances: balancesMap,
        totalAllotted,
        totalUsed,
        totalRemaining,
      };
    });
  }, [employeesRes, rawBalancesRes, defaultLeaveTypes]);

  // Extract unique departments for filter dropdown
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    groupedEmployees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [groupedEmployees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return groupedEmployees.filter((emp) => {
      const matchesSearch =
        !searchQuery ||
        emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [groupedEmployees, searchQuery, selectedDept]);

  // Pagination calculation
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, page, pageSize]);

  const handleOpenEdit = (emp: GroupedEmployeeBalance, catKey: string) => {
    const bal = emp.balances[catKey];
    if (!bal) return;
    setEditingBalance({
      employeeName: emp.employeeName,
      leaveCategory: bal.leaveTypeName,
      balanceId: bal.id,
      totalDays: bal.totalDays,
      usedDays: bal.usedDays,
    });
    setNewTotalDays(bal.totalDays);
    setNewUsedDays(bal.usedDays);
  };

  const handleSaveQuota = () => {
    if (!editingBalance) return;
    updateBalanceMutation.mutate({
      id: editingBalance.balanceId,
      data: {
        total_days: Number(newTotalDays),
        used_days: Number(newUsedDays),
      }
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-5 w-5 text-[#0a66c2]" /> Employee Leave Balances
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Monitor, audit, and manage individual leave balance quotas for all company team members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20 font-bold text-xs py-1 px-3 rounded-sm">
            {groupedEmployees.length} Total Team Members
          </Badge>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white dark:bg-[#121320] border border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Search bar */}
          <div className="relative flex-1 w-full max-w-sm">
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pr-10 pl-3.5 h-9 bg-background border border-border text-foreground rounded-sm text-xs font-medium placeholder:text-muted-foreground/60 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Department & Year Dropdowns */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-40">
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-full bg-background border border-border text-foreground rounded-sm text-xs font-semibold px-3 shadow-sm focus:outline-none cursor-pointer focus:ring-1 focus:ring-[#0a66c2]/50"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="relative w-28">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-9 w-full bg-background border border-border text-foreground rounded-sm text-xs font-semibold px-3 shadow-sm focus:outline-none cursor-pointer focus:ring-1 focus:ring-[#0a66c2]/50"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Balances Table */}
      <Card className="bg-white dark:bg-[#121320] border border-slate-200/60 dark:border-slate-800/60 rounded-sm shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <LocalLoader />
          </div>
        ) : paginatedEmployees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No employee leave records found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try resetting the search or department filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#151624]/40">
                  <th className="py-3 pl-4 pr-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase w-12 text-center">#</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Employee Details</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Role / Dept</th>
                  <th className="py-3 px-3 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-center">Annual Leave</th>
                  <th className="py-3 px-3 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-center">Sick Leave</th>
                  <th className="py-3 px-3 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-center">Casual Leave</th>
                  <th className="py-3 px-3 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-center">Maternity/Paternity</th>
                  <th className="py-3 px-4 text-[10px] font-bold tracking-wide text-slate-400 uppercase text-right">Total Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {paginatedEmployees.map((emp, index) => {
                  const serialNumber = (page - 1) * pageSize + index + 1;
                  const annual = emp.balances['ANNUAL'];
                  const sick = emp.balances['SICK'];
                  const casual = emp.balances['CASUAL'];
                  const occasional = emp.balances['OCCASIONAL'];

                  return (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      {/* S.No */}
                      <td className="py-3 pl-4 pr-2 text-center text-xs font-mono text-slate-400 dark:text-slate-500 font-medium">
                        {serialNumber}
                      </td>

                      {/* Employee Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(emp.employeeName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {emp.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                              {emp.employeeEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {emp.designation}
                          </p>
                          <span className="inline-block text-[10px] text-slate-400 font-medium">
                            {emp.department} • #{emp.employeeCode}
                          </span>
                        </div>
                      </td>

                      {/* Annual Leave */}
                      <td className="py-3 px-3 text-center">
                        {annual ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp, 'ANNUAL')}
                            title="Click to adjust quota"
                            className="inline-flex flex-col items-center group cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0a66c2] transition-colors">
                              {annual.remainingDays} <span className="text-[10px] text-slate-400 font-normal">/ {annual.totalDays}d</span>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {annual.usedDays > 0 ? `(${annual.usedDays}d used)` : '0 used'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Sick Leave */}
                      <td className="py-3 px-3 text-center">
                        {sick ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp, 'SICK')}
                            title="Click to adjust quota"
                            className="inline-flex flex-col items-center group cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0a66c2] transition-colors">
                              {sick.remainingDays} <span className="text-[10px] text-slate-400 font-normal">/ {sick.totalDays}d</span>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {sick.usedDays > 0 ? `(${sick.usedDays}d used)` : '0 used'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Casual Leave */}
                      <td className="py-3 px-3 text-center">
                        {casual ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp, 'CASUAL')}
                            title="Click to adjust quota"
                            className="inline-flex flex-col items-center group cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0a66c2] transition-colors">
                              {casual.remainingDays} <span className="text-[10px] text-slate-400 font-normal">/ {casual.totalDays}d</span>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {casual.usedDays > 0 ? `(${casual.usedDays}d used)` : '0 used'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Maternity / Paternity */}
                      <td className="py-3 px-3 text-center">
                        {occasional ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp, 'OCCASIONAL')}
                            title="Click to adjust quota"
                            className="inline-flex flex-col items-center group cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0a66c2] transition-colors">
                              {occasional.remainingDays} <span className="text-[10px] text-slate-400 font-normal">/ {occasional.totalDays}d</span>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {occasional.usedDays > 0 ? `(${occasional.usedDays}d used)` : '0 used'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Total Available Quota */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {emp.totalRemaining} days
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {emp.totalUsed}d taken of {emp.totalAllotted}d
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Direct Page Jump Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="flex justify-center items-center gap-3 pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted cursor-pointer"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const parsed = parseInt(pageInput, 10);
                  if (!isNaN(parsed)) {
                    const clamped = Math.max(1, Math.min(parsed, totalPages));
                    setPage(clamped);
                    setPageInput(String(clamped));
                  } else {
                    setPageInput(String(page));
                  }
                }
              }}
              onBlur={() => {
                const parsed = parseInt(pageInput, 10);
                if (!isNaN(parsed)) {
                  const clamped = Math.max(1, Math.min(parsed, totalPages));
                  setPage(clamped);
                  setPageInput(String(clamped));
                } else {
                  setPageInput(String(page));
                }
              }}
              className="w-12 h-7 text-center rounded-sm bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors cursor-text"
            />
            <span>of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}

      {/* Adjust Quota Dialog */}
      <Dialog open={!!editingBalance} onOpenChange={(open) => !open && setEditingBalance(null)}>
        <DialogContent className="rounded-sm max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Adjust {editingBalance?.leaveCategory} Quota
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update allotted leave days for <span className="font-semibold text-slate-800 dark:text-slate-200">{editingBalance?.employeeName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Allotted Days</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={newTotalDays}
                onChange={(e) => setNewTotalDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-8.5 text-xs rounded-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Used Days</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={newUsedDays}
                onChange={(e) => setNewUsedDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-8.5 text-xs rounded-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingBalance(null)}
              className="h-8 text-xs rounded-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveQuota}
              disabled={updateBalanceMutation.isPending}
              className="h-8 text-xs bg-[#0a66c2] hover:bg-[#084e96] text-white rounded-sm"
            >
              {updateBalanceMutation.isPending ? 'Saving...' : 'Save Quota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

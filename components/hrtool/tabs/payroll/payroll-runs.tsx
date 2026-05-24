'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Play, Download, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldAlert, X, Check, Calendar, RotateCcw, Trash2, Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';

interface PayrollRunsProps {
  payrolls: any;
  isLoadingPayrolls: boolean;
  selectedRun: any;
  setSelectedRun: (run: any) => void;
  runRecords: any[];
  isLoadingRecords: boolean;
  onApproveRun: (id: string) => void;
  onRejectRun: (id: string) => void;
  approvePending: boolean;
  rejectPending: boolean;
  onRerunRun: (id: string) => void;
  onDeleteRun: (id: string) => void;
  rerunPending: boolean;
  deletePending: boolean;
  isNewRunOpen: boolean;
  setIsNewRunOpen: (open: boolean) => void;
  newRunMonth: string;
  setNewRunMonth: (m: string) => void;
  newRunYear: string;
  setNewRunYear: (y: string) => void;
  onCompileSubmit: () => void;
  compilePending: boolean;
  onClaimTabRedirect: () => void;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

export function PayrollRuns({
  payrolls,
  isLoadingPayrolls,
  selectedRun,
  setSelectedRun,
  runRecords,
  isLoadingRecords,
  onApproveRun,
  onRejectRun,
  approvePending,
  rejectPending,
  onRerunRun,
  onDeleteRun,
  rerunPending,
  deletePending,
  isNewRunOpen,
  setIsNewRunOpen,
  newRunMonth,
  setNewRunMonth,
  newRunYear,
  setNewRunYear,
  onCompileSubmit,
  compilePending,
  onClaimTabRedirect,
  page,
  setPage
}: PayrollRunsProps) {
  
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

  const toSentenceCase = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

  const rawList = payrolls?.data?.results || payrolls?.data || [];
  const sortedRuns = [...rawList].sort((a: any, b: any) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    if (yearB !== yearA) return yearB - yearA;
    return (b.month || 0) - (a.month || 0);
  });

  if (!selectedRun) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Cycle runs compile logs</h3>
          </div>
        </div>
        
        {isLoadingPayrolls ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-md" />)}
          </div>
        ) : sortedRuns.length === 0 ? (
          <Card className="bg-slate-55 dark:bg-[#121320] border-dashed border-slate-200 dark:border-slate-800/40 rounded-md p-6 text-center text-slate-400">
            <CreditCard className="h-10 w-10 mx-auto opacity-30 mb-2 text-slate-400" />
            <p className="text-xs font-bold mb-1">No payroll runs processed yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">Click below to dynamically execute attendance integrations and compile draft figures.</p>
            <Button 
              onClick={() => setIsNewRunOpen(true)}
              data-agent="payroll-start-run-btn"
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-md text-xs font-bold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 h-9 mx-auto"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Start Payroll Run
            </Button>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Cycle Period</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Team Members</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Processed At</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Status</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRuns.map((run: any) => (
                    <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {getMonthName(run.month)} {run.year}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Contains {run.records_count || '0'} payroll records computed
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {run.processed_at ? new Date(run.processed_at).toLocaleDateString() : 'Draft mode'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusBadgeColor(run.status)} font-bold text-[9px] px-2 py-0.5 rounded-md border shadow-none`}>
                          {toSentenceCase(run.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to rerun and recalculate the payroll run for ${getMonthName(run.month)} ${run.year}?`)) {
                              onRerunRun(run.id);
                            }
                          }}
                          disabled={rerunPending}
                          data-agent={`payroll-rerun-btn-${run.id}`}
                          title="Rerun"
                          className="border border-amber-500/20 hover:bg-amber-500/5 text-amber-600 bg-transparent rounded-md font-bold text-xs h-7.5 w-7.5 p-0 cursor-pointer transition-all duration-300 inline-flex items-center justify-center"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to PERMANENTLY delete the payroll run for ${getMonthName(run.month)} ${run.year}? This will hard delete all computed slips and records.`)) {
                              onDeleteRun(run.id);
                            }
                          }}
                          disabled={deletePending}
                          data-agent={`payroll-delete-btn-${run.id}`}
                          title="Delete"
                          className="border border-red-500/20 hover:bg-red-500/5 text-red-600 bg-transparent rounded-md font-bold text-xs h-7.5 w-7.5 p-0 cursor-pointer transition-all duration-300 inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => setSelectedRun(run)}
                          data-agent={`payroll-review-sheet-btn-${run.id}`}
                          className="border border-[#0a66c2]/20 hover:bg-[#0a66c2]/5 text-[#0a66c2] dark:text-[#3b8fd9] dark:hover:bg-[#0a66c2]/10 bg-transparent rounded-md font-bold text-xs h-7.5 px-3 cursor-pointer transition-all duration-300 inline-flex items-center gap-1"
                        >
                          Review sheet <ArrowRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination Controls */}
        {(payrolls?.data?.count ?? 0) > 0 && page !== undefined && setPage !== undefined && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoadingPayrolls}
              className="text-xs h-8 px-4 rounded-md border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Previous
            </Button>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Page {page} of {Math.max(1, Math.ceil((payrolls?.data?.count || 0) / 10))}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p: number) => p + 1)}
              disabled={!payrolls?.data?.next || isLoadingPayrolls}
              className="text-xs h-8 px-4 rounded-md border-slate-200 dark:border-slate-800 text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Next
            </Button>
          </div>
        )}

        {/* Start New Run Dialog */}
        {isNewRunOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121320] border border-slate-100 dark:border-slate-800/80 rounded-md w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsNewRunOpen(false)}
                data-agent="payroll-new-run-close-btn"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0a66c2]" /> Start monthly payroll run
              </h3>
              <p className="text-xs text-slate-500 mb-5">Select targeted month and year. B2Linq will automatically extract attendance indexes, approve unpaid leaves, and compute drafts.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payroll month</label>
                  <select 
                    value={newRunMonth} 
                    onChange={(e) => setNewRunMonth(e.target.value)}
                    data-agent="payroll-new-run-month-select"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
 
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payroll year</label>
                  <select 
                    value={newRunYear} 
                    onChange={(e) => setNewRunYear(e.target.value)}
                    data-agent="payroll-new-run-year-select"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
 
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button 
                    onClick={() => setIsNewRunOpen(false)}
                    data-agent="payroll-new-run-cancel-btn"
                    className="border border-slate-200 bg-transparent text-slate-600 rounded-md text-xs font-bold py-2 px-4 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={onCompileSubmit}
                    disabled={compilePending}
                    data-agent="payroll-new-run-compile-btn"
                    className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-md text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5"
                  >
                    Compile sheets
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Drilldown mode
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* drillheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-[#121320]/60 p-4 rounded-md border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <button 
            onClick={() => setSelectedRun(null)}
            data-agent="payroll-back-to-logs-btn"
            className="text-xs font-bold text-[#0a66c2] dark:text-[#3b8fd9] hover:underline mb-1 flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
          >
            ← Back to cycle logs
          </button>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            Payroll drill sheet: {getMonthName(selectedRun.month)} {selectedRun.year}
            <Badge className={`${getStatusBadgeColor(selectedRun.status)} font-bold text-[9px] px-2 py-0.5 rounded-md border`}>
              {toSentenceCase(selectedRun.status)}
            </Badge>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Calculated records breakdown for all active startup employees.</p>
        </div>

        <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (confirm(`Are you sure you want to rerun and recalculate the payroll run for ${getMonthName(selectedRun.month)} ${selectedRun.year}?`)) {
                  onRerunRun(selectedRun.id);
                }
              }}
              disabled={rerunPending}
              data-agent={`payroll-drilldown-rerun-btn-${selectedRun.id}`}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/15 rounded-md text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5 transition-all duration-300 h-9"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Rerun Compilation
            </Button>
          {selectedRun.status === 'PROCESSED' && (
            <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-xs py-1.5 px-3.5 rounded-md border border-amber-500/20 shadow-none flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Awaiting Executive Approval
            </Badge>
          )}
        </div>
      </div>

      {/* Drilldown Records Table */}
      <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800/60 bg-slate-50/55 dark:bg-[#151624]/40">
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Employee details</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Basic salary</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Overtime</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Reimbursement</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Deductions (tax, pf)</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Net payout</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400">Deduction status</th>
                <th className="py-2.5 px-4 text-[10px] font-bold tracking-wide text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingRecords ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={8} className="py-4 text-center"><div className="h-4 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-sm w-3/4 mx-auto" /></td>
                  </tr>
                ))
              ) : runRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-semibold tracking-wide">No computed records in this run.</td>
                </tr>
              ) : (
                runRecords.map((rec: any) => (
                  <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] font-bold text-xs flex items-center justify-center">
                          {rec.employee_detail?.first_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {rec.employee_detail?.first_name} {rec.employee_detail?.last_name}
                            <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                              ({rec.employee_detail?.employee_id || 'No ID'})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {rec.employee_detail?.designation_detail?.title || 'Team Member'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-bold">{currencySymbol}{parseFloat(rec.gross_salary || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-semibold">{currencySymbol}{parseFloat(rec.overtime_amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-300 font-semibold">{currencySymbol}{parseFloat(rec.reimbursement_amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-red-500/90 font-bold">-{currencySymbol}{parseFloat(rec.deductions || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">{currencySymbol}{parseFloat(rec.net_salary || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${getStatusBadgeColor(rec.status)} font-bold text-[9px] px-2 py-0.5 rounded-md`}>
                        {toSentenceCase(rec.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {selectedRun.status === 'APPROVED' || selectedRun.status === 'PAID' ? (
                        <div className="inline-flex items-center gap-2">
                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/payroll/payslips/${rec.id}/download/`}
                            download
                            title="Download"
                            className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold text-[10px] h-8 w-8 p-0 rounded-md cursor-pointer transition-all duration-300"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                          <Button 
                            title="Email"
                            onClick={() => alert("Mail payslip functionality is coming soon!")}
                            className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold text-[10px] h-8 w-8 p-0 rounded-md cursor-pointer transition-all duration-300 bg-transparent"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Requires approval</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}

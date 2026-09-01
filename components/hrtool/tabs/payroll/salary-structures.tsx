'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, UploadCloud, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPayrollService, hrEmployeeService } from '@/services/hr';
import { toast } from 'sonner';
import { SalaryStructureBulkImportModal } from './salary-structure-bulk-import-modal';
import { SalaryStructureModal } from './components/salary-structure-modal';
import { SalaryStructuresTable } from './components/salary-structures-table';

export function SalaryStructures() {
  const queryClient = useQueryClient();
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);

  const [structureForm, setStructureForm] = useState({
    employee_id: '',
    basic_salary: '',
    hra: '',
    overtime_rate: '',
    tax_percentage: '',
    pf_percentage: '',
    esi_percentage: '',
    deduct_absent_leaves: true,
    status: 'ACTIVE'
  });

  // Queries
  const { data: structures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['payroll-structures', page],
    queryFn: () => hrPayrollService.getSalaryStructures({ page: page, page_size: 10 }),
  });

  // Fetch all active employees (up to 1000) for dropdown assignment
  const { data: employeesRes } = useQuery({
    queryKey: ['payroll-employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 1000, status: 'ACTIVE' }),
  });

  const employeesList = employeesRes?.data?.results || [];

  // Mutations
  const structureMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedStructure) {
        return hrPayrollService.updateSalaryStructure(selectedStructure.id, data);
      }
      return hrPayrollService.createSalaryStructure(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      setIsStructureModalOpen(false);
      setSelectedStructure(null);
      toast.success('Salary structure configured successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to configure salary structure.');
    }
  });

  const deleteStructureMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.deleteSalaryStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      toast.success('Salary structure permanently deleted!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete salary structure.');
    }
  });

  const onStructureSubmit = (data: any) => structureMutation.mutate(data);
  const structurePending = structureMutation.isPending;

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

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await hrPayrollService.getSalaryStructures({ page_size: 1000 });
      const list = res?.data?.results || [];

      if (list.length === 0) {
        toast.error("No salary structures available to export.");
        return;
      }

      const headers = [
        "Employee ID",
        "First Name",
        "Last Name",
        "Designation",
        "Basic Monthly Salary",
        "HRA Allowance",
        "Gross Monthly Salary",
        "Overtime Hourly Rate",
        "Tax Deduction %",
        "Statutory PF %",
        "Statutory ESI %",
        "Total Net Income After Tax",
        "Status"
      ];

      const rows = list.map((str: any) => {
        const basic = parseFloat(str.basic_salary || 0);
        const hra = parseFloat(str.hra || 0);
        const gross = basic + hra;
        const taxPct = parseFloat(str.tax_percentage || 0);
        const pfPct = parseFloat(str.pf_percentage || 0);
        const esiPct = parseFloat(str.esi_percentage || 0);
        const taxDeduction = gross * (taxPct / 100);
        const pfDeduction = basic * (pfPct / 100);
        const esiDeduction = basic * (esiPct / 100);
        const totalDeductions = taxDeduction + pfDeduction + esiDeduction;
        const netIncomeAfterTax = Math.max(0, gross - totalDeductions);

        return [
          `"${str.employee_code || ''}"`,
          `"${str.employee_name || ''}"`,
          `"${str.employee_last_name || ''}"`,
          `"${str.employee_designation || 'Team Member'}"`,
          basic,
          hra,
          gross,
          str.overtime_rate || 0,
          taxPct,
          pfPct,
          esiPct,
          netIncomeAfterTax.toFixed(2),
          `"${str.status || 'ACTIVE'}"`
        ];
      });

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `salary_structures_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Salary structures exported to CSV successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export salary structures.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalCount = structures?.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-medium">Employee compensation profiles</h3>
          <p className="text-xs text-slate-500 font-medium">Configure base salary ratios, tax percentages, overtime hourly rates, and statures.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Download CSV Button */}
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            title="Download full salary structures sheet"
            className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-sm rounded-sm text-xs font-bold py-2 px-3 flex items-center gap-1.5 cursor-pointer transition-all duration-300"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Export CSV</span>
          </Button>

          {/* Bulk Import Button */}
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            title="Bulk import salary structures from Excel / CSV"
            className="border-[#4f46e5]/30 text-[#4f46e5] dark:text-[#818cf8] hover:bg-[#4f46e5]/10 shadow-sm rounded-sm text-xs font-bold py-2 px-3 flex items-center gap-1.5 cursor-pointer transition-all duration-300"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Bulk Add</span>
          </Button>

          {/* Add Single Structure Button */}
          <Button
            onClick={() => {
              setSelectedStructure(null);
              setStructureForm({
                employee_id: '',
                basic_salary: '',
                hra: '',
                overtime_rate: '0',
                tax_percentage: String(settingsRes?.data?.tax_percentage ?? settingsRes?.data?.statutory_tax_percentage ?? '10'),
                pf_percentage: String(settingsRes?.data?.statutory_pf_percentage ?? '12'),
                esi_percentage: String(settingsRes?.data?.statutory_esi_percentage ?? '1.75'),
                deduct_absent_leaves: true,
                status: 'ACTIVE'
              });
              setIsStructureModalOpen(true);
            }}
            data-agent="payroll-salary-add-btn"
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-sm text-xs font-bold py-2 px-3 flex items-center gap-1 cursor-pointer transition-all duration-300"
          >
            <Plus className="h-4 w-4" /> Add compensation profile
          </Button>
        </div>
      </div>

      <SalaryStructuresTable
        isLoadingStructures={isLoadingStructures}
        structures={structures}
        page={page}
        currencySymbol={currencySymbol}
        settingsRes={settingsRes}
        setSelectedStructure={setSelectedStructure}
        setStructureForm={setStructureForm}
        setIsStructureModalOpen={setIsStructureModalOpen}
        deleteStructureMutation={deleteStructureMutation}
      />

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="flex justify-center items-center gap-4 pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoadingStructures}
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted"
          >
            Previous
          </Button>
          <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Page {page} of {totalPages} ({totalCount} total profiles)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages || !structures?.data?.next || isLoadingStructures}
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted"
          >
            Next
          </Button>
        </div>
      )}

      {/* Compensation Profile Modal */}
      <SalaryStructureModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        selectedStructure={selectedStructure}
        structureForm={structureForm}
        setStructureForm={setStructureForm}
        onStructureSubmit={onStructureSubmit}
        structurePending={structurePending}
        employeesList={employeesList}
        currencySymbol={currencySymbol}
        settingsRes={settingsRes}
      />

      {/* Bulk Import Modal */}
      <SalaryStructureBulkImportModal
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

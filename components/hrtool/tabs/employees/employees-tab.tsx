'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOrgService, hrEmployeeService, hrPayrollService } from '@/services/hr';
import { jobsService } from '@/services/jobs.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddEmployeeModal } from './add-employee-modal';
import { EmployeeDetailsView } from './employee-details-view';
import { BulkImportModal } from './bulk-import-modal';
import { EmployeesFilterBar } from './components/employees-filter-bar';
import { EmployeesTable } from './components/employees-table';
import { QuickSalaryConfigModal } from './components/quick-salary-config-modal';

interface EmployeesTabProps {
  defaultRole?: 'EMPLOYEE' | 'MANAGER';
}

export function EmployeesTab({ defaultRole = 'EMPLOYEE' }: EmployeesTabProps) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [filterInput, setFilterInput] = useState('ALL');
  const [designationInput, setDesignationInput] = useState('ALL');
  const [departmentInput, setDepartmentInput] = useState('ALL');
  const [orderingInput, setOrderingInput] = useState('-created_at');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  // Salary Structure Quick Config State
  const [salaryConfigEmployee, setSalaryConfigEmployee] = useState<any>(null);
  const [salaryForm, setSalaryForm] = useState({
    basic_salary: '',
    hra: '',
    overtime_rate: '0',
    tax_percentage: '10',
    pf_percentage: '12',
    esi_percentage: '1.75',
    status: 'ACTIVE'
  });

  const { data: payrollSettingsRes } = useQuery({
    queryKey: ['payroll-settings'],
    queryFn: () => hrPayrollService.getSettingsConfigs(),
  });

  const handleOpenSalaryModal = (emp: any) => {
    const struct = emp.salary_structure_detail;
    setSalaryConfigEmployee(emp);
    if (struct) {
      setSalaryForm({
        basic_salary: String(struct.basic_salary || ''),
        hra: String(struct.hra || ''),
        overtime_rate: String(struct.overtime_rate || '0'),
        tax_percentage: String(struct.tax_percentage ?? '10'),
        pf_percentage: String(struct.pf_percentage ?? '12'),
        esi_percentage: String(struct.esi_percentage ?? '1.75'),
        status: struct.status || 'ACTIVE'
      });
    } else {
      const baseSalary = emp.salary ? Number(emp.salary) : 0;
      const defaultBasic = baseSalary > 0 ? Math.round(baseSalary * 0.6) : 0;
      const defaultHra = baseSalary > 0 ? Math.round(baseSalary * 0.4) : 0;
      setSalaryForm({
        basic_salary: defaultBasic > 0 ? String(defaultBasic) : '',
        hra: defaultHra > 0 ? String(defaultHra) : '',
        overtime_rate: '0',
        tax_percentage: String(payrollSettingsRes?.data?.tax_percentage ?? payrollSettingsRes?.data?.statutory_tax_percentage ?? '10'),
        pf_percentage: String(payrollSettingsRes?.data?.statutory_pf_percentage ?? '12'),
        esi_percentage: String(payrollSettingsRes?.data?.statutory_esi_percentage ?? '1.75'),
        status: 'ACTIVE'
      });
    }
  };

  const saveSalaryMutation = useMutation({
    mutationFn: (data: any) => {
      if (salaryConfigEmployee?.salary_structure_detail?.id) {
        return hrPayrollService.updateSalaryStructure(salaryConfigEmployee.salary_structure_detail.id, data);
      }
      return hrPayrollService.createSalaryStructure(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      toast.success(`Salary structure configured for ${salaryConfigEmployee?.first_name}!`);
      setSalaryConfigEmployee(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || err?.message || 'Failed to save salary structure.');
    }
  });

  useEffect(() => {
    setPage(1);
  }, [defaultRole]);

  const [activeFilters, setActiveFilters] = useState({
    search: '',
    filter: 'ALL',
    designation: 'ALL',
    department: 'ALL',
    ordering: '-created_at',
    startDate: '',
    endDate: ''
  });

  const handleApplyFilters = () => {
    setActiveFilters({
      search: searchInput,
      filter: filterInput,
      designation: designationInput,
      department: departmentInput,
      ordering: orderingInput,
      startDate: startDateInput,
      endDate: endDateInput
    });
    setPage(1);
  };

  const handleSortChange = (newOrder: string) => {
    setOrderingInput(newOrder);
    setActiveFilters(prev => ({ ...prev, ordering: newOrder }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilterInput('ALL');
    setDesignationInput('ALL');
    setDepartmentInput('ALL');
    setOrderingInput('-created_at');
    setStartDateInput('');
    setEndDateInput('');
    setActiveFilters({
      search: '',
      filter: 'ALL',
      designation: 'ALL',
      department: 'ALL',
      ordering: '-created_at',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: designationsData } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrOrgService.getDesignations(),
  });
  const designations = designationsData?.data?.results || [];

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrOrgService.getDepartments(),
  });
  const departments = departmentsData?.data?.results || [];

  const { data: employees, isLoading } = useQuery({
    queryKey: [
      'employees',
      page,
      activeFilters.search,
      activeFilters.filter,
      activeFilters.ordering,
      activeFilters.startDate,
      activeFilters.endDate,
      activeFilters.designation,
      activeFilters.department,
      defaultRole
    ],
    queryFn: () => hrEmployeeService.getEmployees({
      search: activeFilters.search || undefined,
      status: 'ACTIVE',
      employment_type: activeFilters.filter === 'ALL' ? undefined : activeFilters.filter,
      designation: activeFilters.designation === 'ALL' ? undefined : activeFilters.designation,
      department: activeFilters.department === 'ALL' ? undefined : activeFilters.department,
      role: defaultRole,
      ordering: activeFilters.ordering,
      joining_date__gte: activeFilters.startDate || undefined,
      joining_date__lte: activeFilters.endDate || undefined,
      page: page,
      page_size: 10
    }),
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, employment_type }: { id: string; employment_type: string }) =>
      hrEmployeeService.updateEmployee(id, { employment_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Employment type updated manually');
    },
    onError: () => toast.error('Failed to update employment type')
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => hrEmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Employee removed successfully');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to remove employee');
      setDeleteTarget(null);
    }
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: (id: string) => hrEmployeeService.sendCredentials(id),
    onSuccess: (res: any) => {
      if (res?.data?.sent) {
        toast.success(`Credentials email dispatched successfully to ${res.data.email}`);
      } else {
        toast.info(`Email registered: ${res?.data?.email}. Portal link: ${res?.data?.login_url}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send credentials.');
    }
  });

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteEmployeeMutation.mutate(deleteTarget.id);
    }
  }, [deleteTarget, deleteEmployeeMutation]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await hrEmployeeService.getEmployees({
        search: activeFilters.search || undefined,
        status: 'ACTIVE',
        employment_type: activeFilters.filter === 'ALL' ? undefined : activeFilters.filter,
        designation: activeFilters.designation === 'ALL' ? undefined : activeFilters.designation,
        department: activeFilters.department === 'ALL' ? undefined : activeFilters.department,
        role: defaultRole,
        ordering: activeFilters.ordering,
        joining_date__gte: activeFilters.startDate || undefined,
        joining_date__lte: activeFilters.endDate || undefined,
        page_size: 1000
      });

      const list = res?.data?.results || [];
      if (list.length === 0) {
        toast.error("No employee records to export.");
        return;
      }

      const headers = [
        "Employee ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Designation",
        "Department",
        "Employment Type",
        "Role",
        "Joining Date",
        "Reporting Manager",
        "Gross Monthly Salary",
        "Status"
      ];

      const rows = list.map((emp: any) => [
        `"${emp.employee_id || ''}"`,
        `"${emp.first_name || ''}"`,
        `"${emp.last_name || ''}"`,
        `"${emp.email || ''}"`,
        `"${emp.phone || ''}"`,
        `"${emp.designation_detail?.title || ''}"`,
        `"${emp.department_detail?.name || ''}"`,
        `"${emp.employment_type || ''}"`,
        `"${emp.role || ''}"`,
        `"${emp.joining_date || ''}"`,
        `"${emp.reporting_manager_detail ? `${emp.reporting_manager_detail.first_name} ${emp.reporting_manager_detail.last_name}` : ''}"`,
        emp.salary_structure_detail?.gross_salary || emp.salary || 0,
        `"${emp.status || ''}"`
      ]);

      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const roleLabel = defaultRole === 'MANAGER' ? 'managers' : 'employees';
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `${roleLabel}_directory_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${defaultRole === 'MANAGER' ? 'Manager' : 'Employee'} data exported successfully!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isAddModalOpen) {
    return (
      <AddEmployeeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        defaultRole={defaultRole}
      />
    );
  }

  if (selectedEmployeeId) {
    return (
      <EmployeeDetailsView
        employeeId={selectedEmployeeId}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EmployeesFilterBar
        defaultRole={defaultRole}
        setIsAddModalOpen={setIsAddModalOpen}
        setIsBulkImportOpen={setIsBulkImportOpen}
        handleExportData={handleExportData}
        isExporting={isExporting}
        handleResetFilters={handleResetFilters}
        handleApplyFilters={handleApplyFilters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filterInput={filterInput}
        setFilterInput={setFilterInput}
        designationInput={designationInput}
        setDesignationInput={setDesignationInput}
        departmentInput={departmentInput}
        setDepartmentInput={setDepartmentInput}
        orderingInput={orderingInput}
        handleSortChange={handleSortChange}
        startDateInput={startDateInput}
        setStartDateInput={setStartDateInput}
        endDateInput={endDateInput}
        setEndDateInput={setEndDateInput}
        departments={departments}
        designations={designations}
      />

      <EmployeesTable
        isLoading={isLoading}
        employees={employees}
        page={page}
        updateEmployeeMutation={updateEmployeeMutation}
        sendCredentialsMutation={sendCredentialsMutation}
        handleOpenSalaryModal={handleOpenSalaryModal}
        setSelectedEmployeeId={setSelectedEmployeeId}
        setDeleteTarget={setDeleteTarget}
      />

      {/* Pagination Controls */}
      {(employees?.data?.count ?? 0) > 0 && (() => {
        const totalPages = Math.max(1, Math.ceil((employees?.data?.count || 0) / 10));
        return (
          <div className="flex justify-center items-center gap-3 pt-6 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              data-agent="employee-pagination-prev"
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
                data-agent="employee-page-number-input"
                className="w-12 h-7 text-center rounded-sm bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors cursor-text"
              />
              <span>of {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || !employees?.data?.next || isLoading}
              data-agent="employee-pagination-next"
              className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted cursor-pointer"
            >
              Next
            </Button>
          </div>
        );
      })()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-sm border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight">Remove Employee</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span> from the directory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel data-agent="employee-delete-cancel-btn" className="rounded-sm text-xs font-semibold h-9 px-5 border-border/60 hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteEmployeeMutation.isPending}
              data-agent="employee-delete-confirm-btn"
              className="rounded-sm text-xs font-semibold h-9 px-5 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
            >
              {deleteEmployeeMutation.isPending ? 'Removing...' : 'Remove Employee'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        defaultRole={defaultRole}
      />

      {/* Quick Salary Structure Configuration Modal */}
      {salaryConfigEmployee && (
        <QuickSalaryConfigModal
          employee={salaryConfigEmployee}
          onClose={() => setSalaryConfigEmployee(null)}
          salaryForm={salaryForm}
          setSalaryForm={setSalaryForm}
          saveSalaryMutation={saveSalaryMutation}
          settingsRes={payrollSettingsRes}
        />
      )}
    </div>
  );
}

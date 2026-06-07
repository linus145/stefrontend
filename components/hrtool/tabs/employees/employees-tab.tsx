'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOrgService, hrEmployeeService } from '@/services/hr';
import { jobsService } from '@/services/jobs.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal, UserPlus, RefreshCw, Trash2, Calendar, User, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    setPage(1); // Reset page on filter apply
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
    setPage(1); // Reset page on clear filters
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: designationsRes } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrOrgService.getDesignations(),
  });

  const { data: departmentsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrOrgService.getDepartments(),
  });

  const designations = designationsRes?.data?.results || [];
  const departments = departmentsRes?.data?.results || [];

  const { data: employees, isLoading } = useQuery({
    queryKey: [
      'employees',
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
      page: page
    }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: (applicationId: string) =>
      jobsService.updateApplicationStatus(applicationId, 'INTERVIEW'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Candidate moved back to Recruitment Pipeline');
    },
    onError: () => toast.error('Failed to move candidate back')
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
  }, [deleteTarget]);

  const renderSkeletons = () => (
    <div className="w-full overflow-x-auto rounded-sm border border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground font-bold border-b border-border/40">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3 w-[140px]">Type</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-b border-border/40 animate-pulse">
              <td className="px-4 py-3 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-sm" />
                <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-16" /></div>
              </td>
              <td className="px-4 py-3 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-2 w-16" /></td>
              <td className="px-4 py-3 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-20" /></td>
              <td className="px-4 py-3"><Skeleton className="h-8 w-full rounded-sm" /></td>
              <td className="px-4 py-3 flex justify-end"><Skeleton className="h-7 w-7 rounded-sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {defaultRole === 'MANAGER' ? 'Manager Directory' : 'Employee Directory'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            data-agent="add-employee-button"
            className="bg-[#0a66c2] text-white hover:bg-[#004182] shadow-sm rounded-sm text-[11px] font-semibold px-4 h-10 transition-all whitespace-nowrap"
          >
            <UserPlus className="mr-2 h-3.5 w-3.5" /> {defaultRole === 'MANAGER' ? 'Add Manager' : 'Add Employee'}
          </Button>
          <Button
            type="button"
            onClick={handleResetFilters}
            variant="outline"
            data-agent="reset-employee-filters-button"
            className="border-border text-muted-foreground hover:bg-red-50/20 hover:text-red-600 hover:border-red-200 shadow-sm rounded-sm text-[11px] font-semibold px-4 h-10 transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Filters
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilters();
        }}
        className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full"
      >
        {/* Search Filter */}
        <div className="relative flex-1 w-full max-w-sm">
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0a66c2]/60 hover:text-[#0a66c2] transition-colors z-10"
            title="Click to search"
            data-agent="employee-search-button"
          >
            <Search className="h-4 w-4" />
          </button>
          <Input
            placeholder="Search directory..."
            className="pl-10 h-10 bg-background border border-border text-foreground ring-offset-background focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium placeholder:text-muted-foreground/60 shadow-sm transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            data-agent="employee-search-input"
          />
        </div>

        {/* Dynamic Dropdowns & Date Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
          {/* Employment Type Selector Dropdown */}
          <div className="relative w-36">
            <select
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-type-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Types</option>
              <option value="FULL_TIME" className="bg-background text-foreground">Permanent</option>
              <option value="CONTRACT" className="bg-background text-foreground">Contract</option>
              <option value="INTERN" className="bg-background text-foreground">Intern</option>
              <option value="ON_LEAVE" className="bg-background text-foreground">On Leave</option>
              <option value="TERMINATED" className="bg-background text-foreground">Terminated</option>
            </select>
          </div>

          {/* Designation Filter Dropdown */}
          <div className="relative w-40">
            <select
              value={designationInput}
              onChange={(e) => setDesignationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-designation-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Designations</option>
              {designations.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-background text-foreground">{d.title}</option>
              ))}
            </select>
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative w-40">
            <select
              value={departmentInput}
              onChange={(e) => setDepartmentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-department-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-background text-foreground">{d.name}</option>
              ))}
            </select>
          </div>

          {/* Sort / Ordering */}
          <DropdownMenu>
            <DropdownMenuTrigger data-agent="employee-sort-trigger" className="h-10 px-4 flex items-center justify-center gap-2 rounded-sm text-[11px] font-bold border border-border bg-background hover:bg-muted text-foreground transition-all outline-none whitespace-nowrap shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
              {orderingInput === '-created_at' ? 'Newest' : 'Oldest'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md shadow-xl min-w-[160px]">
              <DropdownMenuItem
                onClick={() => handleSortChange('-created_at')}
                data-agent="employee-sort-newest-btn"
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === '-created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange('created_at')}
                data-agent="employee-sort-oldest-btn"
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === 'created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range filters (moved to the last position) */}
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-background px-1 text-[9px] font-bold text-muted-foreground z-10">Start Date</span>
              <Input
                type="date"
                className="h-10 bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium shadow-sm transition-all relative"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                data-agent="employee-start-date-input"
              />
            </div>
            <span className="text-muted-foreground/50 font-medium">-</span>
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-background px-1 text-[9px] font-bold text-muted-foreground z-10">End Date</span>
              <Input
                type="date"
                className="h-10 bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium shadow-sm transition-all relative"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                data-agent="employee-end-date-input"
              />
            </div>
          </div>
        </div>
      </form>

      {isLoading ? renderSkeletons() : (
        <div className="w-full overflow-x-auto rounded-sm border border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground font-bold border-b border-border/40">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 w-[140px]">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees?.data?.results?.map((employee: any) => (
                <tr key={employee.id} data-agent="employee-row" className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50 shadow-sm rounded-sm">
                        <AvatarImage src={employee.avatar} className="rounded-sm" />
                        <AvatarFallback className="bg-blue-500/5 text-[#0a66c2] font-semibold rounded-sm text-[10px]">
                          {employee.first_name[0]}{employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span data-agent="employee-name" className="font-bold text-[13px] text-foreground group-hover:text-[#0a66c2] transition-colors">{employee.first_name} {employee.last_name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">ID: {employee.employee_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {employee.role === 'MANAGER' ? (
                        <>
                          <span className="text-[12px] font-semibold text-foreground">Manager</span>
                          <span className="text-[11px] font-medium text-muted-foreground">{employee.department_detail?.name || 'No Department'}</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12px] font-semibold text-foreground">{employee.designation_detail?.title || 'Team Member'}</span>
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground">{employee.department_detail?.name || 'No Department'}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {employee.reporting_manager_detail ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border/50 shadow-sm rounded-sm">
                          <AvatarFallback className="bg-[#0a66c2]/10 text-[#0a66c2] font-bold rounded-sm text-[8px]">
                            {employee.reporting_manager_detail.first_name[0]}{employee.reporting_manager_detail.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-[12px] text-foreground">
                            {employee.reporting_manager_detail.first_name} {employee.reporting_manager_detail.last_name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-semibold italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
                      <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-[#0a66c2]/60" /> {employee.email}</div>
                      <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-[#0a66c2]/60" /> {employee.phone || 'No contact'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={employee.employment_type || 'FULL_TIME'}
                      disabled={updateEmployeeMutation.isPending}
                      onChange={(e) => updateEmployeeMutation.mutate({ id: employee.id, employment_type: e.target.value })}
                      className="h-7 w-[105px] bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10 border border-[#0a66c2]/20 focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[10px] font-bold text-[#0a66c2] px-2 shadow-sm transition-all focus:outline-none cursor-pointer"
                    >
                      <option value="FULL_TIME">Permanent</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">

                      <button
                        onClick={() => setSelectedEmployeeId(employee.id)}
                        data-agent="employee-details-btn"
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-[#0a66c2]/5 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all active:scale-95 border border-[#0a66c2]/10"
                        title="View Details"
                      >
                        <User className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => sendCredentialsMutation.mutate(employee.id)}
                        disabled={sendCredentialsMutation.isPending}
                        data-agent="employee-send-link-btn"
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-[#0a66c2]/5 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all active:scale-95 border border-[#0a66c2]/10 disabled:opacity-50"
                        title="Send Email Link"
                      >
                        <Mail className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ id: employee.id, name: `${employee.first_name} ${employee.last_name}` })}
                        data-agent="employee-delete-btn"
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-500/10"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {(employees?.data?.count ?? 0) > 0 && (
        <div className="flex justify-center items-center gap-4 pt-6 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            data-agent="employee-pagination-prev"
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted"
          >
            Previous
          </Button>
          <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Page {page} of {Math.max(1, Math.ceil((employees?.data?.count || 0) / 10))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!employees?.data?.next || isLoading}
            data-agent="employee-pagination-next"
            className="text-xs h-8 px-4 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted"
          >
            Next
          </Button>
        </div>
      )}

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
    </div>
  );
}

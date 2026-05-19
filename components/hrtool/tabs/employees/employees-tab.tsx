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

export function EmployeesTab() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [filterInput, setFilterInput] = useState('ALL');
  const [designationInput, setDesignationInput] = useState('ALL');
  const [departmentInput, setDepartmentInput] = useState('ALL');
  const [orderingInput, setOrderingInput] = useState('-created_at');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

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
      activeFilters.department
    ],
    queryFn: () => hrEmployeeService.getEmployees({
      search: activeFilters.search || undefined,
      status: 'ACTIVE',
      employment_type: activeFilters.filter === 'ALL' ? undefined : activeFilters.filter,
      designation: activeFilters.designation === 'ALL' ? undefined : activeFilters.designation,
      department: activeFilters.department === 'ALL' ? undefined : activeFilters.department,
      ordering: activeFilters.ordering,
      joining_date__gte: activeFilters.startDate || undefined,
      joining_date__lte: activeFilters.endDate || undefined
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
      toast.success('Employment type updated manually');
    },
    onError: () => toast.error('Failed to update employment type')
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => hrEmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isAddModalOpen) {
    return (
      <AddEmployeeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
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
          <h2 className="text-xl font-bold tracking-tight">Employee Directory</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            data-agent="add-employee-button"
            className="bg-[#0a66c2] text-white hover:bg-[#004182] shadow-sm rounded-sm text-[11px] font-semibold px-4 h-10 transition-all whitespace-nowrap"
          >
            <UserPlus className="mr-2 h-3.5 w-3.5" /> Add Employee
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
            className="pl-10 h-10 bg-white border border-border ring-offset-background focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium placeholder:text-muted-foreground/60 shadow-sm transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
              className="h-10 w-full bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold text-muted-foreground px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="FULL_TIME">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
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
              className="h-10 w-full bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold text-muted-foreground px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Designations</option>
              {designations.map((d: any) => (
                <option key={d.id} value={d.id}>{d.title}</option>
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
              className="h-10 w-full bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold text-muted-foreground px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Sort / Ordering */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 px-4 flex items-center justify-center gap-2 rounded-sm text-[11px] font-bold border border-border bg-white hover:bg-blue-50/30 text-muted-foreground transition-all outline-none whitespace-nowrap shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
              {orderingInput === '-created_at' ? 'Newest' : 'Oldest'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md shadow-xl min-w-[160px]">
              <DropdownMenuItem
                onClick={() => handleSortChange('-created_at')}
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === '-created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange('created_at')}
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === 'created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range filters (moved to the last position) */}
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[9px] font-bold text-muted-foreground z-10">Start Date</span>
              <Input
                type="date"
                className="h-10 bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium text-foreground shadow-sm transition-all relative"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
              />
            </div>
            <span className="text-muted-foreground/50 font-medium">-</span>
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[9px] font-bold text-muted-foreground z-10">End Date</span>
              <Input
                type="date"
                className="h-10 bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium text-foreground shadow-sm transition-all relative"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
              />
            </div>
          </div>
        </div>
      </form>

      {isLoading ? renderSkeletons() : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees?.data?.results?.map((employee: any) => (
            <Card key={employee.id} className="group overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 border-border/40 bg-card/40 backdrop-blur-md rounded-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border border-border/50 shadow-sm group-hover:scale-105 transition-transform rounded-sm">
                      <AvatarImage src={employee.avatar} className="rounded-sm" />
                      <AvatarFallback className="bg-blue-500/5 text-[#0a66c2] font-semibold rounded-sm text-xs">
                        {employee.first_name[0]}{employee.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-[15px] font-bold tracking-tight truncate group-hover:text-[#0a66c2] transition-colors">{employee.first_name} {employee.last_name}</CardTitle>
                      <p className="text-[11px] font-medium text-[#0a66c2]/70 mt-0.5">
                        {employee.designation_detail?.title || 'Team Member'}
                        {employee.department_detail?.name && ` | ${employee.department_detail.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {employee.job_application && (
                      <button
                        onClick={() => rescheduleMutation.mutate(employee.job_application)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-purple-600/5 text-purple-600 hover:bg-purple-600 hover:text-white transition-all active:scale-95 border border-purple-600/10"
                        title="Reschedule Interview"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", rescheduleMutation.isPending && "animate-spin")} />
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-8 h-8 flex items-center justify-center rounded-sm bg-muted/30 text-muted-foreground hover:text-foreground transition-all border border-border/30 outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md min-w-[140px] shadow-xl">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployeeId(employee.id);
                          }}
                          className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none"
                        >
                          <User className="mr-2 h-3.5 w-3.5 opacity-60" /> Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => sendCredentialsMutation.mutate(employee.id)}
                          disabled={sendCredentialsMutation.isPending}
                          className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none"
                        >
                          <Mail className="mr-2 h-3.5 w-3.5 opacity-60" /> Send Email Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none">
                          <BrainCircuit className="mr-2 h-3.5 w-3.5 opacity-60" /> Interview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget({ id: employee.id, name: `${employee.first_name} ${employee.last_name}` })}
                          className="text-xs font-semibold py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors rounded-none"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5 opacity-60" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 text-[13px] space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-foreground/90 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-[#0a66c2]/60" />
                    <span className="truncate text-xs font-semibold">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/90 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-[#0a66c2]/60" />
                    <span className="text-xs font-semibold">{employee.phone || 'No contact provided'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">ID: {employee.employee_id}</span>
                    <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 font-bold rounded-sm border-[#0a66c2]/30 text-[#0a66c2] bg-[#0a66c2]/5 shadow-sm">
                      {employee.employment_type?.replace('_', ' ').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase()) || 'Full time'}
                    </Badge>
                  </div>

                  {/* Manual Type Change Buttons */}
                  <div className="flex gap-2">
                    {[
                      { label: 'Perm', value: 'FULL_TIME' },
                      { label: 'Contr', value: 'CONTRACT' },
                      { label: 'Intern', value: 'INTERN' },
                    ].map(type => (
                      <button
                        key={type.value}
                        disabled={employee.employment_type === type.value || updateEmployeeMutation.isPending}
                        onClick={() => updateEmployeeMutation.mutate({ id: employee.id, employment_type: type.value })}
                        className={cn(
                          "flex-1 py-2 rounded-sm text-[11px] font-bold border transition-all active:scale-95 shadow-sm",
                          employee.employment_type === type.value
                            ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md"
                            : "bg-white hover:bg-blue-50/50 border-border text-muted-foreground hover:text-[#0a66c2] hover:border-[#0a66c2]/40"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
            <AlertDialogCancel className="rounded-sm text-xs font-semibold h-9 px-5 border-border/60 hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteEmployeeMutation.isPending}
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

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { jobsService } from '@/services/jobs.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal, UserPlus, RefreshCw, Trash2, UserCheck, Calendar } from 'lucide-react';
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
import { User, BrainCircuit } from 'lucide-react';

export function OnboardingTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [activateTarget, setActivateTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['onboarding-employees', search, ordering, startDate, endDate],
    queryFn: () => hrmsService.getEmployees({ 
      search, 
      status: 'ON_BOARDING',
      ordering,
      joining_date__gte: startDate || undefined,
      joining_date__lte: endDate || undefined
    }),
  });

  const activateEmployeeMutation = useMutation({
    mutationFn: (id: string) => hrmsService.updateEmployee(id, { status: 'ACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Successfully added to Employees directory');
      setActivateTarget(null);
    },
    onError: () => {
      toast.error('Failed to add to employees');
      setActivateTarget(null);
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: (applicationId: string) =>
      jobsService.updateApplicationStatus(applicationId, 'INTERVIEW'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      toast.success('Candidate moved back to Recruitment Pipeline');
    },
    onError: () => toast.error('Failed to move candidate back')
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, employment_type }: { id: string; employment_type: string }) =>
      hrmsService.updateEmployee(id, { employment_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employment type updated manually');
    },
    onError: () => toast.error('Failed to update employment type')
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => hrmsService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed successfully');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to remove employee');
      setDeleteTarget(null);
    }
  });

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteEmployeeMutation.mutate(deleteTarget.id);
    }
  }, [deleteTarget]);

  const handleActivateConfirm = useCallback(() => {
    if (activateTarget) {
      activateEmployeeMutation.mutate(activateTarget.id);
    }
  }, [activateTarget]);

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Onboarding Pipeline</h2>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0a66c2]/60" />
            <Input
              placeholder="Search directory..."
              className="pl-10 h-10 bg-white border border-border ring-offset-background focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium placeholder:text-muted-foreground/60 shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-36">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[10px] font-bold text-muted-foreground z-10">Start Date</span>
              <Input
                type="date"
                className="h-10 bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium text-foreground shadow-sm transition-all relative"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="text-muted-foreground/50 font-medium">-</span>
            <div className="relative w-36">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[10px] font-bold text-muted-foreground z-10">End Date</span>
              <Input
                type="date"
                className="h-10 bg-white border border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium text-foreground shadow-sm transition-all relative"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 px-4 flex items-center justify-center gap-2 rounded-sm text-[11px] font-bold border border-border/60 bg-white hover:bg-blue-50/30 text-muted-foreground transition-all outline-none whitespace-nowrap shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
              {ordering === '-created_at' ? 'Newest' : 'Oldest'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md shadow-xl min-w-[160px]">
              <DropdownMenuItem 
                onClick={() => setOrdering('-created_at')} 
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", ordering === '-created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setOrdering('created_at')} 
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", ordering === 'created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                      <p className="text-[11px] font-medium text-[#0a66c2]/70 mt-0.5">{employee.designation_detail?.title || 'Team Member'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {employee.job_application && (
                      <button
                        onClick={() => rescheduleMutation.mutate(employee.job_application)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-purple-600/5 text-purple-600 hover:bg-purple-600 hover:text-white transition-all active:scale-95 border border-purple-600/10"
                        title="Move back to Recruitment"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", rescheduleMutation.isPending && "animate-spin")} />
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-8 h-8 flex items-center justify-center rounded-sm bg-muted/30 text-muted-foreground hover:text-foreground transition-all border border-border/30 outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md min-w-[140px] shadow-xl">
                        <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none">
                          <User className="mr-2 h-3.5 w-3.5 opacity-60" /> Details
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

                  <Button 
                    onClick={() => setActivateTarget({ id: employee.id, name: `${employee.first_name} ${employee.last_name}` })}
                    className="w-full bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 text-[#0a66c2] border border-[#0a66c2]/20 shadow-none font-bold tracking-wide transition-all h-9 text-xs rounded-sm"
                  >
                    <UserCheck className="mr-2 h-4 w-4" /> Add to Employees
                  </Button>
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

      {/* Activate Employee Dialog */}
      <AlertDialog open={!!activateTarget} onOpenChange={(open) => !open && setActivateTarget(null)}>
        <AlertDialogContent className="rounded-sm border-[#0a66c2]/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight text-[#0a66c2]">Add to Employees</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to finalize onboarding and move <span className="font-semibold text-foreground">{activateTarget?.name}</span> to the main Employee Directory?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-sm text-xs font-semibold h-9 px-5 border-border/60 hover:bg-muted/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivateConfirm}
              disabled={activateEmployeeMutation.isPending}
              className="rounded-sm text-xs font-semibold h-9 px-5 bg-[#0a66c2] text-white hover:bg-[#004182] shadow-lg shadow-blue-500/20 transition-all"
            >
              {activateEmployeeMutation.isPending ? 'Adding...' : 'Yes, Add to Employees'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

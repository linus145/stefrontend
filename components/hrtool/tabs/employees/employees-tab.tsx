'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { jobsService } from '@/services/jobs.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal, UserPlus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, BrainCircuit } from 'lucide-react';

export function EmployeesTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', search, filter],
    queryFn: () => hrmsService.getEmployees({ 
      search, 
      employment_type: filter === 'ALL' ? undefined : filter 
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
      hrmsService.updateEmployee(id, { employment_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employment type updated manually');
    },
    onError: () => toast.error('Failed to update employment type')
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">Manage and view all employees in your organization.</p>
        </div>
        <Button className="bg-[#0a66c2] text-white hover:bg-[#004182] shadow-lg shadow-blue-500/20 rounded-sm text-xs font-semibold px-6 h-10 transition-all">
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm border border-border/40 p-4 rounded-sm shadow-sm transition-all duration-300">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0a66c2]/40" />
          <Input
            placeholder="Search directory..."
            className="pl-10 h-10 bg-white border border-border/60 ring-offset-background focus-visible:ring-[#0a66c2]/30 rounded-sm text-sm font-medium placeholder:text-muted-foreground/40 shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-muted/40 p-1 rounded-sm border border-border/30 h-10">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Permanent', value: 'FULL_TIME' },
              { label: 'Contract', value: 'CONTRACT' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  "px-5 py-1.5 rounded-sm text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap h-full flex items-center",
                  filter === item.value
                    ? "bg-white text-[#0a66c2] shadow-sm border border-border/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 px-4 flex items-center justify-center rounded-sm text-[11px] font-bold border border-border/60 bg-white hover:bg-blue-50/30 text-muted-foreground transition-all outline-none">
              More <MoreHorizontal className="ml-2 h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md shadow-xl min-w-[160px]">
              <DropdownMenuItem onClick={() => setFilter('INTERN')} className="text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2]">
                Interns
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2]">
                On Leave
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2]">
                Terminated
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
                        <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none">
                          <User className="mr-2 h-3.5 w-3.5 opacity-60" /> Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-[#0a66c2]/10 focus:text-[#0a66c2] transition-colors rounded-none">
                          <BrainCircuit className="mr-2 h-3.5 w-3.5 opacity-60" /> Interview
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
    </div>
  );
}

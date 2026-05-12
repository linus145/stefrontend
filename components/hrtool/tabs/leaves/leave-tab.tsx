'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Check, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function LeaveTab() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: () => hrmsService.getLeaveRequests(),
  });

  const { data: balances } = useQuery({
    queryKey: ['leave-balances'],
    queryFn: () => hrmsService.getLeaveBalances(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => hrmsService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Request approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => hrmsService.rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.error('Request rejected');
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-sm text-muted-foreground">Approve requests and track employee time off.</p>
        </div>
        <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm">
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances?.data?.results?.map((balance: any) => (
          <Card key={balance.id} className="bg-card/50 border-border/50 rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-blue-500/20 text-blue-600 bg-blue-500/5 rounded-sm">
                  {balance.leave_type_name}
                </Badge>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold">{balance.remaining_days} <span className="text-xs font-normal text-muted-foreground">days left</span></h3>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Out of {balance.total_days} days</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests?.data?.results?.filter((r: any) => r.status === 'pending').map((request: any) => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{request.employee_name || 'Employee'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-blue-600">{request.total_days} days</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{request.leave_type_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-sm shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                      className="h-8 w-8 p-0 border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {requests?.data?.results?.filter((r: any) => r.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground italic">No pending requests at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrLeaveService } from '@/services/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

interface LeaveTabProps {
  filterStatus?: 'pending' | 'approved';
}

export function LeaveTab({ filterStatus }: LeaveTabProps) {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: () => hrLeaveService.getLeaveRequests(),
  });



  const approveMutation = useMutation({
    mutationFn: (id: string) => hrLeaveService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Request approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => hrLeaveService.rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.error('Request rejected');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrLeaveService.deleteLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request deleted');
    },
  });

  const filteredRequests = requests?.data?.results?.filter((r: any) => {
    if (filterStatus) {
      return r.status?.toLowerCase() === filterStatus;
    }
    return true; // Show all requests if no filterStatus
  }) || [];
  const getPageHeader = () => {
    if (filterStatus === 'pending') {
      return {
        title: 'Pending Leaves',
        subtitle: 'Review and approve pending employee leave requests.'
      };
    }
    if (filterStatus === 'approved') {
      return {
        title: 'Approved Leaves',
        subtitle: 'Track and view all approved employee leaves.'
      };
    }
    return {
      title: 'All Leave Requests',
      subtitle: 'Approve requests and track employee time off.'
    };
  };

  const header = getPageHeader();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{header.title}</h2>
          <p className="text-sm text-muted-foreground">{header.subtitle}</p>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <TableHead className="py-3 px-4 font-medium">Emp ID</TableHead>
                  <TableHead className="py-3 px-4 font-medium">Emp Name</TableHead>
                  <TableHead className="py-3 px-4 font-medium">Email</TableHead>
                  <TableHead className="py-3 px-4 font-medium">Leave Dates</TableHead>
                  <TableHead className="py-3 px-4 font-medium">Reason</TableHead>
                  <TableHead className="py-3 px-4 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredRequests.map((request: any) => (
                  <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                      {request.employee_detail?.employee_id || '—'}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium">
                      {request.employee_name || `${request.employee_detail?.first_name || ''} ${request.employee_detail?.last_name || ''}`.trim() || 'Employee'}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-muted-foreground">
                      {request.employee_detail?.email || '—'}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {format(new Date(request.start_date), 'dd/MM/yyyy')} - {format(new Date(request.end_date), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wide mt-0.5">
                          {request.total_days} {request.total_days === 1 ? 'day' : 'days'} • {request.leave_type_name || 'Leave'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate" title={request.reason}>
                      {request.reason || '—'}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status?.toLowerCase() === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                              data-agent={`leave-approve-btn-${request.id}`}
                              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-sm shadow-sm"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                              data-agent={`leave-reject-btn-${request.id}`}
                              className="h-8 w-8 p-0 border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-sm"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 font-bold rounded-sm uppercase tracking-wider",
                              request.status?.toLowerCase() === 'approved'
                                ? "border-green-500/30 text-green-600 bg-green-500/5"
                                : "border-rose-500/30 text-rose-600 bg-rose-500/5"
                            )}
                          >
                            {request.status}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(request.id)}
                          disabled={deleteMutation.isPending}
                          data-agent={`leave-delete-btn-${request.id}`}
                          className="h-8 w-8 p-0 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 rounded-sm transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground italic">No requests at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

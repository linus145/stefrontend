'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrLeaveService } from '@/services/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2, Plus, Edit, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface LeaveTabProps {
  filterStatus?: 'pending' | 'approved';
  subTab?: string;
}

export function LeaveTab({ filterStatus, subTab }: LeaveTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Reset page when filterStatus or subTab changes
  useEffect(() => {
    setPage(1);
  }, [filterStatus, subTab]);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['leave-requests', filterStatus, page],
    queryFn: () => hrLeaveService.getLeaveRequests({
      status: filterStatus || undefined,
      page: page,
      page_size: 20
    }),
  });

  // States for Leave Types (Company Leaves) Management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<{ id: string; name: string } | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [maxDays, setMaxDays] = useState<number | ''>(10);
  const [date, setDate] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [carryForward, setCarryForward] = useState(false);

  // TanStack Query for Leave Types list
  const { data: leaveTypesRes, isLoading: typesLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => hrLeaveService.getLeaveTypes(),
    enabled: subTab === 'leave-company'
  });

  const leaveTypes = leaveTypesRes?.data?.results || [];

  const createTypeMutation = useMutation({
    mutationFn: (data: any) => hrLeaveService.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave category created successfully!');
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create leave category');
    }
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrLeaveService.updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave category updated successfully!');
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update leave category');
    }
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id: string) => hrLeaveService.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave category deleted successfully');
      setDeleteTypeTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete leave category');
      setDeleteTypeTarget(null);
    }
  });

  const handleEdit = (type: any) => {
    setEditingType(type);
    setName(type.name || '');
    setDescription(type.description || '');
    setCategory(type.category || 'OTHER');
    setMaxDays(type.max_days_per_year !== null && type.max_days_per_year !== undefined ? type.max_days_per_year : '');
    setDate(type.date || '');
    setIsPaid(type.is_paid !== false);
    setCarryForward(type.carry_forward === true);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setCategory('OTHER');
    setMaxDays(10);
    setDate('');
    setIsPaid(true);
    setCarryForward(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryNames: Record<string, string> = {
      ANNUAL: 'Annual Leave',
      SICK: 'Sick Leave',
      CASUAL: 'Casual Leave',
      OCCASIONAL: 'Occasional Leave',
      NATIONAL: 'National Holiday / Leave',
      OTHER: 'Other'
    };
    const resolvedName = name || categoryNames[category] || 'Other';
    const payload = {
      name: resolvedName,
      description,
      category,
      max_days_per_year: maxDays === '' ? null : Number(maxDays),
      date: date || null,
      is_paid: isPaid,
      carry_forward: carryForward
    };
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, data: payload });
    } else {
      createTypeMutation.mutate(payload);
    }
  };

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

  if (subTab === 'leave-company') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Company Leaves</h2>
          </div>
          <Button 
            onClick={handleCreate}
            data-agent="leave-add-type-btn"
            className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm font-bold shadow-md shadow-blue-500/10 px-4 py-2 text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Leave Type
          </Button>
        </div>

        {typesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-border/40 bg-card/40">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-muted/60" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted/60 rounded w-2/3" />
                      <div className="h-3 bg-muted/40 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-12 bg-muted/40 rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted/50 rounded w-16" />
                    <div className="h-6 bg-muted/50 rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leaveTypes.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-border/60 p-8 text-center rounded-sm">
            <CardContent className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold">No Leave Categories</h3>
              <p className="text-xs text-muted-foreground max-w-sm">Define your organization's leaves (e.g. Sick, Casual, Annual) to allow employees to request time off.</p>
              <Button 
                onClick={handleCreate}
                variant="outline"
                className="text-xs font-semibold rounded-sm border-blue-500/30 text-blue-600 hover:bg-blue-500/5 mt-2"
              >
                Create First Leave Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((type: any) => (
              <Card key={type.id} className="group overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 border-border/40 bg-card/40 backdrop-blur-md rounded-sm flex flex-col justify-between">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold uppercase text-[13px] shrink-0">
                        {type.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold tracking-tight group-hover:text-[#0a66c2] transition-colors">{type.name}</h3>
                        <p className="text-[9px] font-bold text-muted-foreground mt-0.5">
                          {type.max_days_per_year !== null && type.max_days_per_year !== undefined
                            ? `${type.max_days_per_year} Days / Year`
                            : 'Unlimited Days'}
                        </p>
                        {type.date && (
                          <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                            Date: {format(new Date(type.date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(type)}
                        data-agent={`leave-type-edit-btn-${type.id}`}
                        className="h-6 w-6 p-0 border-border/60 hover:text-blue-600 hover:bg-blue-500/5 rounded-sm"
                        title="Edit Policy"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTypeTarget({ id: type.id, name: type.name })}
                        data-agent={`leave-type-delete-btn-${type.id}`}
                        className="h-6 w-6 p-0 border-border/60 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/30 rounded-sm"
                        title="Delete category"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 line-clamp-3 leading-relaxed min-h-[40px]">
                    {type.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                    <Badge variant="outline" className={cn(
                      "text-[8px] px-1.5 py-0 font-bold rounded-sm uppercase tracking-wider shadow-none",
                      type.category === 'ANNUAL' && "border-indigo-500/20 text-indigo-600 bg-indigo-500/5",
                      type.category === 'SICK' && "border-rose-500/20 text-rose-600 bg-rose-500/5",
                      type.category === 'CASUAL' && "border-emerald-500/20 text-emerald-600 bg-emerald-500/5",
                      type.category === 'OCCASIONAL' && "border-pink-500/20 text-pink-600 bg-pink-500/5",
                      type.category === 'NATIONAL' && "border-orange-500/20 text-orange-600 bg-orange-500/5",
                      (!type.category || type.category === 'OTHER') && "border-slate-500/20 text-slate-600 bg-slate-500/5"
                    )}>
                      {type.category ? type.category.replace('_', ' ') : 'Other'}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-[8px] px-1.5 py-0 font-bold rounded-sm uppercase tracking-wider shadow-none",
                      type.is_paid !== false 
                        ? "border-green-500/20 text-green-600 bg-green-500/5"
                        : "border-slate-500/20 text-slate-500 bg-slate-500/5"
                    )}>
                      {type.is_paid !== false ? 'Paid' : 'Unpaid'}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-[8px] px-1.5 py-0 font-bold rounded-sm uppercase tracking-wider shadow-none",
                      type.carry_forward === true 
                        ? "border-blue-500/20 text-blue-600 bg-blue-500/5"
                        : "border-amber-500/20 text-amber-600 bg-amber-500/5"
                    )}>
                      {type.carry_forward === true ? 'Carry Forward' : 'Non-Accumulative'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog form for creating / editing leave types */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-sm border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {editingType ? 'Edit Leave Category' : 'Create Leave Category'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set leave policies, max balance, and tracking rules for your organization.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Commented out as requested by the user
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Leave Category Name</label>
                <Input
                  required
                  placeholder="e.g. Annual Leave, Sick Leave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-white border border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-sm text-sm font-medium"
                />
              </div>
              */}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Leave Type / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-sm text-sm font-medium outline-none focus:border-blue-500"
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="OCCASIONAL">Occasional Leave</option>
                  <option value="NATIONAL">National Holiday / Leave</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Holiday Date / Event Date (Optional)</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 bg-background border border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-sm text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <Textarea
                  placeholder="Explain who qualifies for this leave and any applicable terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-sm text-sm font-medium min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Max Days (Optional)</label>
                  <Input
                    type="number"
                    min={0}
                    value={maxDays}
                    onChange={(e) => setMaxDays(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder="Unlimited"
                    className="h-10 bg-background border border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-sm text-sm font-medium"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Paid Leave</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={carryForward}
                      onChange={(e) => setCarryForward(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Carry Forward</span>
                  </label>
                </div>
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-sm text-xs font-semibold h-9 px-5 border-border/60 hover:bg-muted/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTypeMutation.isPending || updateTypeMutation.isPending}
                  className="rounded-sm text-xs font-semibold h-9 px-5 bg-[#0a66c2] text-white hover:bg-[#004182] shadow-lg shadow-blue-500/20"
                >
                  {createTypeMutation.isPending || updateTypeMutation.isPending 
                    ? 'Saving...' 
                    : editingType ? 'Save Changes' : 'Create Category'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog open={!!deleteTypeTarget} onOpenChange={(open) => !open && setDeleteTypeTarget(null)}>
          <AlertDialogContent className="rounded-sm border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold tracking-tight">Delete Leave Category</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to delete the <span className="font-semibold text-foreground">{deleteTypeTarget?.name}</span> leave policy? This action will permanently remove it from organization definitions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-sm text-xs font-semibold h-9 px-5 border-border/60 hover:bg-muted/50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTypeTarget && deleteTypeMutation.mutate(deleteTypeTarget.id)}
                disabled={deleteTypeMutation.isPending}
                className="rounded-sm text-xs font-semibold h-9 px-5 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
              >
                {deleteTypeMutation.isPending ? 'Deleting...' : 'Delete Policy'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{header.title}</h2>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardContent className="p-3">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border/60 text-muted-foreground text-[9px] uppercase tracking-wider font-semibold">
                  <TableHead className="py-2 px-3 font-medium">Emp ID</TableHead>
                  <TableHead className="py-2 px-3 font-medium">Emp Name</TableHead>
                  <TableHead className="py-2 px-3 font-medium">Email</TableHead>
                  <TableHead className="py-2 px-3 font-medium">Leave Dates</TableHead>
                  <TableHead className="py-2 px-3 font-medium">Leave Type</TableHead>
                  <TableHead className="py-2 px-3 font-medium">Reason</TableHead>
                  <TableHead className="py-2 px-3 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 text-xs">
                {filteredRequests.map((request: any) => (
                  <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                      {request.employee_detail?.employee_id || '—'}
                    </TableCell>
                    <TableCell className="py-2 px-3 font-semibold text-xs text-foreground">
                      {request.employee_name || `${request.employee_detail?.first_name || ''} ${request.employee_detail?.last_name || ''}`.trim() || 'Employee'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-[11px] text-muted-foreground">
                      {request.employee_detail?.email || '—'}
                    </TableCell>
                    <TableCell className="py-2 px-3 font-semibold text-xs text-foreground">
                      {format(new Date(request.start_date), 'dd/MM/yyyy')} - {format(new Date(request.end_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {request.leave_type_name || 'Leave'}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-[11px] text-muted-foreground max-w-[200px] truncate" title={request.reason}>
                      {request.reason || '—'}
                    </TableCell>
                    <TableCell className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {request.status?.toLowerCase() === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                              data-agent={`leave-approve-btn-${request.id}`}
                              className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-sm shadow-sm"
                              title="Approve"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                              data-agent={`leave-reject-btn-${request.id}`}
                              className="h-7 w-7 p-0 border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-sm"
                              title="Reject"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] px-1.5 py-0 font-bold rounded-sm uppercase tracking-wider",
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
                          className="h-7 w-7 p-0 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 rounded-sm transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground italic">No requests at the moment.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {(requests?.data?.count ?? 0) > 0 && (
            <div className="flex justify-center items-center gap-4 pt-4 pb-1 border-t border-border/40 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                data-agent="leave-pagination-prev"
                className="text-xs h-7 px-3 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted font-bold text-[10px]"
              >
                Previous
              </Button>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Page {page} of {Math.max(1, Math.ceil((requests?.data?.count || 0) / 20))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!requests?.data?.next || isLoading}
                data-agent="leave-pagination-next"
                className="text-xs h-7 px-3 rounded-sm border-border text-muted-foreground shadow-sm hover:bg-muted font-bold text-[10px]"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

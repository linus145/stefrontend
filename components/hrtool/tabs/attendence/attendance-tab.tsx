'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut, Calendar as CalendarIcon, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AttendanceTab() {
  const queryClient = useQueryClient();
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => hrmsService.getAttendance(),
  });

  const checkInMutation = useMutation({
    mutationFn: (data: { location_in: string }) => hrmsService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked in successfully');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: { location_out: string }) => hrmsService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked out successfully');
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate({ location_in: 'Office' });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({ location_out: 'Office' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Tracking</h2>
          <p className="text-sm text-muted-foreground">Monitor daily attendance and work sessions.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleCheckIn} 
            disabled={checkInMutation.isPending}
            className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm"
          >
            <LogIn className="mr-2 h-4 w-4" /> Check In
          </Button>
          <Button 
            onClick={handleCheckOut} 
            disabled={checkOutMutation.isPending}
            variant="outline" 
            className="border-rose-500/20 text-rose-600 hover:bg-rose-500/5 rounded-sm"
          >
            <LogOut className="mr-2 h-4 w-4" /> Check Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance?.data?.results?.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-4 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-sm flex items-center justify-center shadow-sm",
                      record.status === 'present' ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{format(new Date(record.date), 'EEEE, MMMM do')}</p>
                      <p className="text-xs text-muted-foreground">Status: <span className="capitalize">{record.status}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-blue-600">{record.total_work_hours} hrs</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Duration</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-50">
              <Clock className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Avg. Work Hours</p>
              <h3 className="text-3xl font-bold mt-1">8.5 <span className="text-sm font-normal opacity-80">hrs/day</span></h3>
            </div>
            <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Late Arrivals</p>
              <h3 className="text-3xl font-bold mt-1">2 <span className="text-sm font-normal opacity-80">this month</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

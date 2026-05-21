'use client';

import React from 'react';
import { format } from 'date-fns';
import { LogIn, LogOut, MapPin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService } from '@/services/hr';
import { toast } from 'sonner';

import { AttendanceRecord, WorkSession } from '@/types/hr.types';

interface AttendanceActivityProps {
  attendanceData: AttendanceRecord[];
}

export function AttendanceActivity({ attendanceData }: AttendanceActivityProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrAttendanceService.deleteAttendance(id),
    onSuccess: () => {
      toast.success('Attendance record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => {
      toast.error('Failed to delete attendance record');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record? This will permanently remove all sessions for this day.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm overflow-hidden shadow-md">
      <CardContent className="p-0 pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Session Date</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Hours & Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {attendanceData?.flatMap((record: AttendanceRecord) => {
                const empId = record.employee_detail?.employee_id || 'N/A';
                const firstName = record.employee_detail?.first_name || '';
                const lastName = record.employee_detail?.last_name || '';
                const empName = (firstName || lastName) 
                  ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()} ${lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()}`.trim()
                  : 'Anonymous';
                const empEmail = record.employee_detail?.email || 'N/A';
                const recordDateStr = record.date ? format(new Date(record.date), 'dd/MM/yyyy') : '—';
                const totalHours = record.total_work_hours || '0.00';
                const status = record.status || 'Present';

                if (!record.sessions || record.sessions.length === 0) {
                  return [(
                    <tr key={record.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 text-xs font-semibold text-foreground/80">{recordDateStr}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-[#0a66c2] tracking-wider">{empId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-500/20 shadow-sm uppercase">
                            {firstName.charAt(0) || 'E'}
                          </div>
                          <span className="text-xs font-bold text-foreground/90 group-hover:text-blue-600 transition-colors">{empName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground/90 font-medium">{empEmail}</td>
                      <td colSpan={2} className="px-6 py-4 text-xs text-center text-muted-foreground italic">No sessions logged</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs font-mono font-bold text-foreground">{totalHours} hrs</p>
                            <Badge className={cn(
                              "text-[9px] font-bold rounded-sm uppercase tracking-wider px-2 py-0.5 mt-1 border",
                              status?.toUpperCase() === 'PRESENT' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              status?.toUpperCase() === 'LATE' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            )}>
                              {status}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(record.id)}
                          data-agent={`attendance-delete-btn-${record.id}`}
                          className="text-rose-500/50 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-sm transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )];
                }

                return record.sessions.map((session: WorkSession, index: number) => {
                  const checkInStr = session.check_in ? format(new Date(session.check_in), 'hh:mm:ss a') : '—';
                  const checkInDate = session.check_in ? format(new Date(session.check_in), 'dd/MM/yyyy') : '';
                  const locInStr = session.location_in || '';

                  const checkOutStr = session.check_out ? format(new Date(session.check_out), 'hh:mm:ss a') : 'Active / Checked In';
                  const checkOutDate = session.check_out ? format(new Date(session.check_out), 'dd/MM/yyyy') : '';
                  const locOutStr = session.location_out || '';
                  
                  let sessionHours = "0.00";
                  if (session.check_in && session.check_out) {
                    const ms = new Date(session.check_out).getTime() - new Date(session.check_in).getTime();
                    sessionHours = (ms / (1000 * 60 * 60)).toFixed(2);
                  }

                  return (
                    <tr key={`${record.id}-${index}`} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 text-xs font-semibold text-foreground/80">
                        {recordDateStr}
                        {record.sessions.length > 1 && (
                          <div className="text-[10px] text-muted-foreground mt-1 font-normal bg-muted/30 w-fit px-1.5 py-0.5 rounded-sm border border-border/50">Session {index + 1} of {record.sessions.length}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-[#0a66c2] tracking-wider">
                        {empId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-500/20 shadow-sm uppercase">
                            {firstName.charAt(0) || 'E'}
                          </div>
                          <span className="text-xs font-bold text-foreground/90 group-hover:text-blue-600 transition-colors">{empName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground/90 font-medium">
                        {empEmail}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <LogIn className="h-3.5 w-3.5" />
                            {checkInStr}
                          </div>
                          {checkInDate && (
                            <div className="text-[10px] text-muted-foreground font-medium pl-5">{checkInDate}</div>
                          )}
                          {locInStr && (
                            <Badge variant="outline" className="text-[9px] uppercase border-green-500/20 text-green-600 bg-green-500/5 rounded-sm px-1.5 py-0">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 inline" /> {locInStr}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-bold",
                            session.check_out ? "text-rose-600" : "text-amber-500 animate-pulse"
                          )}>
                            <LogOut className="h-3.5 w-3.5" />
                            {checkOutStr}
                          </div>
                          {checkOutDate && (
                            <div className="text-[10px] text-muted-foreground font-medium pl-5">{checkOutDate}</div>
                          )}
                          {locOutStr && (
                            <Badge variant="outline" className="text-[9px] uppercase border-rose-500/20 text-rose-600 bg-rose-500/5 rounded-sm px-1.5 py-0">
                              <MapPin className="h-2.5 w-2.5 mr-0.5 inline" /> {locOutStr}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs font-mono font-bold text-foreground">
                              {sessionHours} hrs 
                              {record.sessions.length > 1 && (
                                <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">Day Total: {totalHours} hrs</span>
                              )}
                              {record.sessions.length <= 1 && (
                                <span className="block text-[10px] text-muted-foreground font-normal mt-0.5 opacity-0">Day Total: {totalHours} hrs</span>
                              )}
                            </p>
                            <Badge className={cn(
                              "text-[9px] font-bold rounded-sm uppercase tracking-wider px-2 py-0.5 mt-1 border",
                              status?.toUpperCase() === 'PRESENT' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                              status?.toUpperCase() === 'LATE' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            )}>
                              {status}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {index === 0 ? (
                          <button
                            onClick={() => handleDelete(record.id)}
                            data-agent={`attendance-delete-btn-${record.id}`}
                            className="text-rose-500/50 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-sm transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="w-7 h-7"></div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
              {(!attendanceData || attendanceData.length === 0) && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground italic bg-muted/10">
                    No attendance records logged for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

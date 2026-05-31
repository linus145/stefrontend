'use client';

import React from 'react';
import { format } from 'date-fns';
import { LogIn, LogOut, MapPin, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
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
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
    toast('Delete this attendance record?', {
      description: 'This will permanently remove all sessions for this day.',
      action: {
        onClick: () => deleteMutation.mutate(id),
        label: 'Delete',
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Session Date</th>
                <th className="px-3 py-2">Employee ID</th>
                <th className="px-3 py-2">Employee Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Check In</th>
                <th className="px-3 py-2">Check Out</th>
                <th className="px-3 py-2">Session Hours</th>
                <th className="px-3 py-2">Day Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
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
                const sessions = record.sessions || [];
                const isExpanded = !!expandedRows[record.id];

                const sortedSessions = [...sessions].sort(
                  (a: any, b: any) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
                );
                const firstSession = sortedSessions[0];
                const lastSession = sortedSessions[sortedSessions.length - 1];

                const firstCheckInStr = firstSession?.check_in ? format(new Date(firstSession.check_in), 'hh:mm:ss a') : '—';
                const lastCheckOutStr = lastSession ? (lastSession.check_out ? format(new Date(lastSession.check_out), 'hh:mm:ss a') : 'Active / Checked In') : '—';

                const mainRow = (
                  <tr key={record.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-3 py-2 text-[11px] font-semibold text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        {sessions.length > 0 && (
                          <button
                            onClick={() => toggleRow(record.id)}
                            className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#0a66c2]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <span>{recordDateStr}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono font-bold text-[#0a66c2] tracking-wider">{empId}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-sm bg-blue-500/10 text-blue-600 font-bold text-[10px] flex items-center justify-center border border-blue-500/20 shadow-sm uppercase">
                          {firstName.charAt(0) || 'E'}
                        </div>
                        <span className="text-[11px] font-bold text-foreground/90 group-hover:text-blue-600 transition-colors">{empName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground/90 font-medium">{empEmail}</td>
                    <td className="px-3 py-2 text-[11px] font-medium text-foreground">
                      {sessions.length > 0 ? (
                        <span className="text-green-600 font-bold">{firstCheckInStr}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No sessions logged</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-medium text-foreground">
                      {sessions.length > 0 ? (
                        <span className={cn(
                          "font-bold",
                          lastSession?.check_out ? "text-rose-600" : "text-amber-500 animate-pulse"
                        )}>
                          {lastCheckOutStr}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">No sessions logged</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {sessions.length > 0 ? (
                        <button
                          onClick={() => toggleRow(record.id)}
                          className="text-[#0a66c2] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          {sessions.length} Session(s)
                        </button>
                      ) : (
                        <span className="font-mono text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono font-bold text-foreground">{totalHours} hrs</td>
                    <td className="px-3 py-2">
                      <Badge className={cn(
                        "text-[8px] font-bold rounded-sm uppercase tracking-wider px-1.5 py-0 border shadow-none",
                        status?.toUpperCase() === 'PRESENT' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                        status?.toUpperCase() === 'LATE' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}>
                        {status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(record.id)}
                        data-agent={`attendance-delete-btn-${record.id}`}
                        className="text-rose-500/50 hover:text-rose-600 hover:bg-rose-500/10 p-1 rounded-sm transition-colors border border-border/40 h-6 w-6 flex items-center justify-center"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );

                const subRow = isExpanded && sessions.length > 0 && (
                  <tr key={`${record.id}-expanded`} className="bg-muted/10 dark:bg-slate-900/10">
                    <td colSpan={10} className="px-6 py-3 border-b border-border/20">
                      <div className="rounded-sm border border-border/40 bg-card/30 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between border-b border-border/45 pb-2">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#0a66c2] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Checked In Sessions for {empName} ({sessions.length})
                          </h4>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono">Day Total: {totalHours} hrs</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse border border-border/30 rounded-sm overflow-hidden bg-background/50">
                            <thead>
                              <tr className="border-b border-border/40 bg-muted/30 text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                                <th className="px-3 py-1.5">Session</th>
                                <th className="px-3 py-1.5">Check In Time</th>
                                <th className="px-3 py-1.5">Check In Location</th>
                                <th className="px-3 py-1.5">Check Out Time</th>
                                <th className="px-3 py-1.5">Check Out Location</th>
                                <th className="px-3 py-1.5 text-right">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                              {sessions.map((session: WorkSession, index: number) => {
                                const checkInStr = session.check_in ? format(new Date(session.check_in), 'hh:mm:ss a') : '—';
                                const checkInDate = session.check_in ? format(new Date(session.check_in), 'dd/MM/yyyy') : '';
                                const locInStr = session.location_in || 'Office';

                                const checkOutStr = session.check_out ? format(new Date(session.check_out), 'hh:mm:ss a') : 'Active';
                                const checkOutDate = session.check_out ? format(new Date(session.check_out), 'dd/MM/yyyy') : '';
                                const locOutStr = session.location_out || 'Office';

                                let sessionHours = "0.00";
                                if (session.check_in && session.check_out) {
                                  const ms = new Date(session.check_out).getTime() - new Date(session.check_in).getTime();
                                  sessionHours = (ms / (1000 * 60 * 60)).toFixed(2);
                                }

                                return (
                                  <tr key={index} className="hover:bg-muted/10 transition-colors text-[11px]">
                                    <td className="px-3 py-2 font-bold text-muted-foreground">Session {index + 1}</td>
                                    <td className="px-3 py-2 font-semibold text-green-600">
                                      <div className="flex items-center gap-1.5">
                                        <LogIn className="h-3 w-3" />
                                        <span>{checkInStr}</span>
                                        {checkInDate && <span className="text-[9px] text-muted-foreground font-normal">({checkInDate})</span>}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2">
                                      <Badge variant="outline" className="text-[8px] uppercase border-green-500/20 text-green-600 bg-green-500/5 rounded-sm px-1 py-0 shadow-none">
                                        <MapPin className="h-2 w-2 mr-0.5 inline" /> {locInStr}
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-semibold">
                                      <div className={cn(
                                        "flex items-center gap-1.5",
                                        session.check_out ? "text-rose-600" : "text-amber-500 animate-pulse"
                                      )}>
                                        <LogOut className="h-3 w-3" />
                                        <span>{checkOutStr}</span>
                                        {checkOutDate && <span className="text-[9px] text-muted-foreground font-normal">({checkOutDate})</span>}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2">
                                      {session.check_out ? (
                                        <Badge variant="outline" className="text-[8px] uppercase border-rose-500/20 text-rose-600 bg-rose-500/5 rounded-sm px-1 py-0 shadow-none">
                                          <MapPin className="h-2 w-2 mr-0.5 inline" /> {locOutStr}
                                        </Badge>
                                      ) : (
                                        <span className="font-mono text-muted-foreground">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                                      {sessionHours} hrs
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                );

                return subRow ? [mainRow, subRow] : [mainRow];
              })}
              {(!attendanceData || attendanceData.length === 0) && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-xs text-muted-foreground italic bg-muted/10">
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

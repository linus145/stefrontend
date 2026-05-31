'use client';

import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceHistoryCardProps {
  attendanceLogs: any[];
}

export function AttendanceHistoryCard({ attendanceLogs }: AttendanceHistoryCardProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-4 px-6">
        <div>
          <CardTitle className="text-sm font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Complete Attendance History Logs
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-slate-400">
            A comprehensive history of all check-in sessions, locations, and working durations.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        {attendanceLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <Calendar className="h-10 w-10 text-slate-400/60" />
            <span className="text-xs font-bold uppercase tracking-wider">No attendance logs found</span>
            <span className="text-[10px] max-w-sm text-slate-400 font-medium">
              You haven't recorded any shift clock-in sessions yet. Clock in using the shift time tracking widget to generate log items.
            </span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-[9px] font-extrabold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">First Check In</th>
                <th className="py-2.5 px-3">Last Check Out</th>
                <th className="py-2.5 px-3 text-right">Overtime</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700 dark:text-slate-300">
              {attendanceLogs.map((log: any) => {
                let displayTimeIn = log.time_in;
                let displayTimeOut = log.time_out;
                let displayLocationIn = log.location_in || 'Office';
                let displayLocationOut = log.location_out || 'Office';

                if (log.sessions && log.sessions.length > 0) {
                  const sortedSessions = [...log.sessions].sort(
                    (a: any, b: any) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
                  );
                  const firstSession = sortedSessions[0];
                  const lastSession = sortedSessions[sortedSessions.length - 1];

                  if (firstSession?.check_in) {
                    try {
                      displayTimeIn = format(new Date(firstSession.check_in), 'hh:mm:ss a');
                    } catch (e) {
                      console.error(e);
                    }
                  }
                  if (firstSession?.location_in) {
                    displayLocationIn = firstSession.location_in;
                  }

                  if (lastSession) {
                    if (lastSession.check_out) {
                      try {
                        displayTimeOut = format(new Date(lastSession.check_out), 'hh:mm:ss a');
                      } catch (e) {
                        console.error(e);
                      }
                    } else {
                      displayTimeOut = 'Active / Checked In';
                    }

                    if (lastSession.location_out) {
                      displayLocationOut = lastSession.location_out;
                    }
                  }
                }

                if (!displayTimeIn) displayTimeIn = '09:00 AM';
                if (!displayTimeOut) displayTimeOut = '--:--';

                const status = log.status || 'PRESENT';

                return (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-3 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {format(new Date(log.date), 'EEEE, MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={cn(
                        "border-none font-extrabold text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-wider",
                        status.toUpperCase() === 'PRESENT' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          status.toUpperCase() === 'LATE' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            status.toUpperCase() === 'HALF_DAY' ? "bg-blue-500/10 text-blue-600 dark:text-blue-455" :
                              "bg-rose-500/10 text-rose-600 dark:text-rose-450"
                      )}>
                        {status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-880 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-500" /> {displayTimeIn}
                        </span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <MapPin className="h-2 w-2" /> {displayLocationIn}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "text-[11px] font-bold flex items-center gap-1",
                          displayTimeOut.includes('Active') ? "text-amber-500 animate-pulse" : "text-slate-800 dark:text-slate-200"
                        )}>
                          <Clock className="h-3 w-3 text-rose-500" /> {displayTimeOut}
                        </span>
                        {!displayTimeOut.includes('Active') && displayTimeOut !== '--:--' && (
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                            <MapPin className="h-2 w-2" /> {displayLocationOut}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono text-xs text-slate-500">
                        {log.overtime_hours && parseFloat(log.overtime_hours) > 0 ? `${log.overtime_hours} hrs` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

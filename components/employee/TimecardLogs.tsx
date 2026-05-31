'use client';

import React from 'react';
import { Compass, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TimecardLogsProps {
  attendanceLogs: any[];
}

export function TimecardLogs({
  attendanceLogs
}: TimecardLogsProps) {
  return (
    <Card className="bg-white dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-900 rounded-sm shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-900/50 pb-4">
        <CardTitle className="text-xs font-bold tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-2">
          <Compass className="h-4 w-4 text-[#0a66c2]" />
          Recent timecard logs
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {attendanceLogs.map((log: any) => {
          let displayTimeIn = log.time_in;
          let displayTimeOut = log.time_out;
          let displayLocation = log.location_in || 'Office';

          if (log.sessions && log.sessions.length > 0) {
            const sortedSessions = [...log.sessions].sort(
              (a: any, b: any) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
            );
            const firstSession = sortedSessions[0];
            const lastSession = sortedSessions[sortedSessions.length - 1];

            if (firstSession?.check_in) {
              try {
                displayTimeIn = format(new Date(firstSession.check_in), 'hh:mm a');
              } catch (e) {
                console.error(e);
              }
            }

            if (firstSession?.location_in) {
              displayLocation = firstSession.location_in;
            }

            if (lastSession) {
              if (lastSession.check_out) {
                try {
                  displayTimeOut = format(new Date(lastSession.check_out), 'hh:mm a');
                } catch (e) {
                  console.error(e);
                }
              } else {
                displayTimeOut = 'Active';
              }
            }
          }

          if (!displayTimeIn) displayTimeIn = '09:00 AM';
          if (!displayTimeOut) displayTimeOut = '--:--';

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/80 hover:border-slate-350 dark:hover:border-slate-800 flex items-center justify-between transition-colors gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-blue-500/5 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/10">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200">
                    {format(new Date(log.date), 'EEEE, MMM dd')}
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 tracking-wider">
                    In: {displayTimeIn} • Out: {displayTimeOut}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Badge className="text-[8px] px-1.5 py-0 bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 capitalize tracking-wider font-bold mt-1">
                  {displayLocation}
                </Badge>
              </div>
            </div>
          );
        })}

        {attendanceLogs.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic text-xs">
            No timecard records found. Check in above to start.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

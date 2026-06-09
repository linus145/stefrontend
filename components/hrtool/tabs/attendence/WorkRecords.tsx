'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WorkRecordsProps {
  attendanceData: any[];
  monthlyHours?: number;
}

export function WorkRecords({ attendanceData, monthlyHours = 0.0 }: WorkRecordsProps) {
  const totalHours = attendanceData?.reduce((acc, r) => acc + parseFloat(r.total_work_hours || 0), 0) || 0;
  const avgHours = attendanceData?.length ? (totalHours / attendanceData.length).toFixed(1) : '0.0';
  const lateCount = attendanceData?.filter((r: any) => r.status?.toUpperCase() === 'LATE').length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardContent className="p-3">
          <div className="space-y-2">
            {attendanceData?.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-2.5 px-3 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center shadow-sm shrink-0",
                    record.status?.toLowerCase() === 'present' ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{format(new Date(record.date), 'dd/MM/yyyy')}</p>
                    <p className="text-[10px] text-muted-foreground">Status: <span className="capitalize">{record.status}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-blue-600">{record.total_work_hours} hrs</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Duration</p>
                </div>
              </div>
            ))}
            {(!attendanceData || attendanceData.length === 0) && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground italic">No work records at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm h-fit">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-xs flex items-center gap-1.5 text-blue-50 font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          <div className="p-2.5 px-3 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Avg. Work Hours</p>
            <h3 className="text-lg font-bold mt-0.5">{avgHours} <span className="text-[10px] font-normal opacity-85">hrs/day</span></h3>
          </div>
          <div className="p-2.5 px-3 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Late Arrivals</p>
            <h3 className="text-lg font-bold mt-0.5">{lateCount} <span className="text-[10px] font-normal opacity-85">this month</span></h3>
          </div>
          <div className="p-2.5 px-3 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Monthly Hours</p>
            <h3 className="text-lg font-bold mt-0.5">{monthlyHours.toFixed(2)} <span className="text-[10px] font-normal opacity-85">hrs</span></h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WorkRecordsProps {
  attendanceData: any[];
}

export function WorkRecords({ attendanceData }: WorkRecordsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {attendanceData?.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-4 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-sm flex items-center justify-center shadow-sm",
                    record.status === 'present' ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{format(new Date(record.date), 'dd/MM/yyyy')}</p>
                    <p className="text-xs text-muted-foreground">Status: <span className="capitalize">{record.status}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-blue-600">{record.total_work_hours} hrs</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Duration</p>
                </div>
              </div>
            ))}
            {(!attendanceData || attendanceData.length === 0) && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground italic">No work records at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-50 font-bold">
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
  );
}

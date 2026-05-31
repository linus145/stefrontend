'use client';

import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HourAccountProps {
  mockHourAccounts: any[];
}

export function HourAccount({ mockHourAccounts }: HourAccountProps) {
  const avgHours = mockHourAccounts.length 
    ? (mockHourAccounts.reduce((acc, a) => acc + a.workedHours, 0) / mockHourAccounts.length / 20).toFixed(1) 
    : '—';
  const overtime = mockHourAccounts.length 
    ? mockHourAccounts.reduce((acc, a) => acc + (a.balance > 0 ? a.balance : 0), 0).toFixed(1) 
    : '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Hours Balance Sheet</h3>
        {mockHourAccounts.length === 0 ? (
          <Card className="bg-card/50 border-border/50 rounded-sm">
            <CardContent className="p-4 text-center text-xs text-muted-foreground italic">
              No hours balance sheets available for this cycle.
            </CardContent>
          </Card>
        ) : (
          mockHourAccounts.map((account, idx) => (
            <Card key={idx} className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-all rounded-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center shrink-0",
                    account.status === 'overtime' ? "bg-green-500/10 text-green-600" :
                    account.status === 'deficit' ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"
                  )}>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{account.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Standard Hours: {account.standardHours} hrs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{account.workedHours} hrs worked</p>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-bold rounded-sm uppercase tracking-wider px-1.5 py-0 shadow-none border",
                    account.status === 'overtime' ? "border-green-500/30 text-green-600 bg-green-500/5" :
                    account.status === 'deficit' ? "border-rose-500/30 text-rose-600 bg-rose-500/5" : "border-blue-500/30 text-blue-600 bg-blue-500/5"
                  )}>
                    {account.balance >= 0 ? `+${account.balance} hrs` : `${account.balance} hrs`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm h-fit">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-xs flex items-center gap-1.5 text-blue-50 font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            Working Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          <div className="p-2.5 px-3 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Avg. Work Hours</p>
            <h3 className="text-lg font-bold mt-0.5">{avgHours} {avgHours !== '—' && <span className="text-[10px] font-normal opacity-85">hrs/day</span>}</h3>
          </div>
          <div className="p-2.5 px-3 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Overtime hours accumulated</p>
            <h3 className="text-lg font-bold mt-0.5">{overtime} {overtime !== '—' && <span className="text-[10px] font-normal opacity-85">hrs</span>}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

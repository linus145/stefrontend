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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Hours Balance Sheet</h3>
        {mockHourAccounts.map((account, idx) => (
          <Card key={idx} className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-all rounded-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center",
                  account.status === 'overtime' ? "bg-green-500/10 text-green-600" :
                  account.status === 'deficit' ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"
                )}>
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{account.name}</h4>
                  <p className="text-xs text-muted-foreground">Standard Hours: {account.standardHours} hrs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{account.workedHours} hrs worked</p>
                <Badge variant="outline" className={cn(
                  "text-[9px] font-bold rounded-sm uppercase tracking-wider",
                  account.status === 'overtime' ? "border-green-500/30 text-green-600 bg-green-500/5" :
                  account.status === 'deficit' ? "border-rose-500/30 text-rose-600 bg-rose-500/5" : "border-blue-500/30 text-blue-600 bg-blue-500/5"
                )}>
                  {account.balance >= 0 ? `+${account.balance} hrs` : `${account.balance} hrs`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-50 font-bold">
            <Clock className="h-5 w-5" />
            Working Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Avg. Work Hours</p>
            <h3 className="text-3xl font-bold mt-1">8.5 <span className="text-sm font-normal opacity-80">hrs/day</span></h3>
          </div>
          <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Overtime hours accumulated</p>
            <h3 className="text-3xl font-bold mt-1">10.5 <span className="text-sm font-normal opacity-80">hrs</span></h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

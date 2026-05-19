'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaveBalanceCardsProps {
  balancesList: any[];
  onRequestLeave: () => void;
}

export function LeaveBalanceCards({
  balancesList,
  onRequestLeave
}: LeaveBalanceCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-slate-550 dark:text-slate-400">
            Leave accounts & balance metrics
          </h3>
          <p className="text-[10px] text-slate-455 dark:text-slate-500 tracking-wide mt-0.5">
            Annual allotment and remaining quotas
          </p>
        </div>

        <Button
          onClick={onRequestLeave}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-[10px] tracking-wider rounded-sm h-8 shadow-md shadow-blue-500/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Request leave
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balancesList.map((balance: any) => {
          const total = parseFloat(balance.total_days || '10');
          const used = parseFloat(balance.used_days || '0');
          const remaining = total - used;
          const percent = Math.round((remaining / total) * 100) || 0;
          return (
            <Card key={balance.id} className="bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-900 rounded-sm shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="outline" className="text-[9px] font-bold tracking-wider border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 rounded-sm px-2">
                    {balance.leave_type_name}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550">{percent}% Left</span>
                </div>

                <h4 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white mt-1">
                  {remaining} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days remaining</span>
                </h4>

                {/* Custom progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-sm mt-3 overflow-hidden border border-slate-200/50 dark:border-slate-900/50">
                  <div
                    className={cn(
                      "h-full rounded-sm transition-all duration-1000",
                      percent > 50 ? "bg-[#0a66c2]" : percent > 20 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-[8px] text-slate-400 dark:text-slate-500 tracking-wide mt-2">
                  Total annual allotment: {total} days
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

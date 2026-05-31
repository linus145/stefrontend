'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DirectReportsTableProps {
  teamSubordinates: any[];
}

export function DirectReportsTable({ teamSubordinates }: DirectReportsTableProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-4 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <Users className="h-4 w-4" /> My Direct Reports ({teamSubordinates.length})
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-slate-400">
            Active team roster reporting directly under your supervision.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        {teamSubordinates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <Users className="h-10 w-10 text-slate-400/60" />
            <span className="text-xs font-bold uppercase tracking-wider">No direct reports found</span>
            <span className="text-[10px] max-w-sm text-slate-400 font-medium">
              There are currently no employee profiles assigned to you as reporting manager. Contact your HR administrator to sync directory reports.
            </span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-[9px] font-extrabold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Subordinate</th>
                <th className="py-2.5 px-3">Role & Department</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700 dark:text-slate-300">
              {teamSubordinates.map((sub: any) => (
                <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 rounded-sm border border-slate-200/50 dark:border-slate-800/50">
                      <AvatarFallback className="bg-[#0a66c2]/10 text-[#0a66c2] text-[10px] font-bold rounded-sm">
                        {sub.first_name[0]}{sub.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-bold text-[12px] text-slate-800 dark:text-slate-200">{sub.first_name} {sub.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{sub.designation_title || 'Team Member'}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{sub.department_name || 'Operations'}</div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">{sub.email}</td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">{sub.phone || 'No phone'}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-extrabold text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {sub.status || 'ACTIVE'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

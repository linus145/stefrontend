'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DirectReportsTableProps {
  teamSubordinates: any[];
}

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export function DirectReportsTable({ teamSubordinates }: DirectReportsTableProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 py-6 px-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-wider text-[#0a66c2] uppercase flex items-center gap-2">
            <Users className="h-4 w-4" /> My direct reports ({teamSubordinates.length})
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            Active team roster reporting directly under your supervision.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 overflow-x-auto">
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
              <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-extrabold text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Subordinate</th>
                <th className="py-3.5 px-4">Role &amp; department</th>
                <th className="py-3.5 px-4">Email address</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700 dark:text-slate-300">
              {teamSubordinates.map((sub: any) => (
                <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 rounded-sm border border-slate-200/50 dark:border-slate-800/50">
                      <AvatarFallback className="bg-[#0a66c2]/10 text-[#0a66c2] text-xs font-bold rounded-sm">
                        {sub.first_name[0]}{sub.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{sub.first_name} {sub.last_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{toSentenceCase(sub.designation_title || 'Team member')}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{toSentenceCase(sub.department_name || 'Operations')}</div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">{sub.email}</td>
                  <td className="py-4 px-4 text-xs text-slate-500">{sub.phone || 'No phone'}</td>
                  <td className="py-4 px-4 text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-extrabold text-[10px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {toSentenceCase(sub.status || 'ACTIVE')}
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

'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ShiftTrackerProps {
  isCheckedIn: boolean;
  elapsedSeconds: number;
  checkInTime: Date | null;
  displayDepartment: string;
  isSyncing: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export function ShiftTracker({
  isCheckedIn,
  elapsedSeconds,
  checkInTime,
  displayDepartment,
  isSyncing,
  onCheckIn,
  onCheckOut
}: ShiftTrackerProps) {
  // Format active duration elapsed (HH:MM:SS)
  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex-1 bg-white dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-900 rounded-sm overflow-hidden flex flex-col justify-between shadow-md">
      <CardHeader className="border-b border-slate-100 dark:border-slate-900/50 pb-5">
        <CardTitle className="text-sm font-bold tracking-wider text-slate-555 dark:text-slate-400 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0a66c2]" />
          Shift time tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-8 flex-1 flex flex-col justify-center items-center text-center space-y-8">
        
        {/* Session Timer Ring */}
        <div className="relative flex items-center justify-center">
          <div className={cn(
            "absolute w-40 h-40 rounded-full border-[3px] transition-all duration-1000",
            isCheckedIn ? "border-emerald-500/30 border-t-emerald-500 animate-spin" : "border-slate-200 dark:border-slate-800"
          )} />
          <div className="w-36 h-36 rounded-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[11px] tracking-wider text-slate-400 dark:text-slate-500 font-bold">
              {isCheckedIn ? 'Active session' : 'Off duty'}
            </span>
            <span className="text-3xl font-bold font-mono tracking-wider text-slate-900 dark:text-slate-100 mt-1">
              {isCheckedIn ? formatDuration(elapsedSeconds) : '00:00:00'}
            </span>
            <span className="text-[10px] text-slate-550 dark:text-slate-400 tracking-wider mt-1.5 font-semibold">
              {isCheckedIn && checkInTime ? `In: ${format(checkInTime, 'hh:mm a')}` : 'Clock in to start'}
            </span>
          </div>
        </div>

        {/* Clock In / Out Buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          {!isCheckedIn ? (
            <Button
              onClick={onCheckIn}
              disabled={isSyncing}
              className="flex-1 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm tracking-wider rounded-sm py-6 shadow-lg shadow-blue-500/10 cursor-pointer animate-none"
            >
              {isSyncing ? 'Syncing...' : 'Check in'}
            </Button>
          ) : (
            <Button
              onClick={onCheckOut}
              disabled={isSyncing}
              variant="outline"
              className="flex-1 border-rose-500/25 text-rose-600 dark:text-rose-500 hover:bg-rose-500/5 bg-rose-500/5 dark:bg-slate-950/10 font-bold text-sm tracking-wider rounded-sm py-6 cursor-pointer"
            >
              {isSyncing ? 'Syncing...' : 'Check out'}
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs tracking-wide">
          * Checking in logs your current GPS coordinates and registers your standard shift log under <strong>{toSentenceCase(displayDepartment)}</strong> team.
        </p>
      </CardContent>
    </Card>
  );
}

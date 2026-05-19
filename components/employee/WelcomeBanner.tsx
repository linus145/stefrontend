'use client';

import React from 'react';
import { format } from 'date-fns';

interface WelcomeBannerProps {
  displayName: string;
  displayDesignation: string;
  displayDepartment: string;
  currentDateTime: Date | null;
}

export function WelcomeBanner({
  displayName,
  displayDesignation,
  displayDepartment,
  currentDateTime
}: WelcomeBannerProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-sm bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 gap-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome, {displayName}!
        </h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 tracking-wide">
          {displayDesignation} in the {displayDepartment} Department. Manage your daily schedule and requests.
        </p>
      </div>

      <div className="text-left md:text-right">
        <span className="text-xs font-bold text-slate-450 dark:text-slate-500 tracking-wider block">
          Local Server Time
        </span>
        <span className="text-md font-bold text-[#0a66c2] tracking-wide font-mono">
          {currentDateTime ? format(currentDateTime, 'dd/MM/yyyy • hh:mm:ss a') : 'Loading...'}
        </span>
      </div>
    </div>
  );
}

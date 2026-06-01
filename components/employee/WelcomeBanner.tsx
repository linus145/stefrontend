'use client';

import React from 'react';
import { format } from 'date-fns';

interface WelcomeBannerProps {
  displayName: string;
  displayDesignation: string;
  displayDepartment: string;
  currentDateTime: Date | null;
}

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const cleaned = str.replace(/_/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export function WelcomeBanner({
  displayName,
  displayDesignation,
  displayDepartment,
  currentDateTime
}: WelcomeBannerProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-sm bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 gap-4 shadow-md">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome, {displayName}!
        </h2>
        <p className="text-sm text-slate-550 dark:text-slate-400 tracking-wide">
          {toSentenceCase(displayDesignation)} in the {toSentenceCase(displayDepartment)} department. Manage your daily schedule and requests.
        </p>
      </div>

      <div className="text-left md:text-right">
        <span className="text-sm font-bold text-slate-450 dark:text-slate-500 tracking-wider block">
          Local server time
        </span>
        <span className="text-lg font-bold text-[#0a66c2] tracking-wide font-mono">
          {currentDateTime ? format(currentDateTime, 'dd/MM/yyyy • hh:mm:ss a') : 'Loading...'}
        </span>
      </div>
    </div>
  );
}

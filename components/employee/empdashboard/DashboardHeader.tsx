'use client';

import React from 'react';
import { Sun, Moon, Key, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  displayName: string;
  displayDesignation: string;
  displayId: string;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenCredentials: () => void;
  onSignOut: () => void;
}

export function DashboardHeader({
  displayName,
  displayDesignation,
  displayId,
  isDark,
  toggleTheme,
  onOpenCredentials,
  onSignOut
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-sm bg-[#0a66c2] flex items-center justify-center font-bold text-sm tracking-wider shadow-md shadow-blue-500/10 text-white">
          B2
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-wider text-slate-800 dark:text-slate-100">
            B2linq <span className="text-[#0a66c2]">Employee Hub</span>
          </h1>
          <p className="text-[9px] font-semibold tracking-wider text-slate-550 dark:text-slate-400">
            Enterprise Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {displayName}
          </span>
          <span className="text-[9px] text-slate-550 dark:text-slate-450 tracking-wider font-semibold">
            {displayDesignation} • {displayId}
          </span>
        </div>
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-sm transition-all duration-300 active:scale-95 cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-[#0a66c2] transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>
        <Button
          onClick={onOpenCredentials}
          variant="ghost"
          size="sm"
          className="h-8 px-2 sm:px-3 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-sm mr-1 sm:mr-2"
        >
          <Key className="h-3.5 w-3.5 sm:mr-2 text-amber-500" />
          <span className="hidden sm:inline-block text-xs tracking-wider font-bold">Credentials</span>
        </Button>
        <Button
          onClick={onSignOut}
          variant="ghost"
          size="sm"
          className="h-8 px-2 sm:px-3 text-slate-550 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/5 border border-slate-200 dark:border-slate-800 rounded-sm"
        >
          <X className="h-3.5 w-3.5 sm:mr-2" />
          <span className="hidden sm:inline-block text-xs tracking-wider font-bold">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}

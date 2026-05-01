'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useDashboardTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
        "bg-muted/40 hover:bg-muted border border-border/50 shadow-sm group",
        "hover:scale-105 active:scale-95"
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun className={cn(
          "absolute inset-0 w-full h-full text-amber-500 transition-all duration-500",
          isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
        )} />
        <Moon className={cn(
          "absolute inset-0 w-full h-full text-primary transition-all duration-500",
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
        )} />
      </div>
      
      {/* Subtle Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10",
        isDark ? "bg-primary/20" : "bg-amber-500/20"
      )} />
    </button>
  );
}

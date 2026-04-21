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
        "relative w-[68px] h-9 rounded-full p-1 transition-all duration-300 ease-in-out border border-border shadow-sm",
        "bg-muted/50 hover:bg-muted transition-colors overflow-hidden"
      )}
      aria-label="Toggle theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-x-1 inset-y-1 flex items-center justify-between px-1.5 pointer-events-none opacity-40">
        <Sun className="w-3.5 h-3.5 text-foreground" />
        <Moon className="w-3.5 h-3.5 text-foreground" />
      </div>

      {/* Sliding Pill */}
      <div 
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-md relative z-10",
          isDark 
            ? "translate-x-[30px] bg-primary text-primary-foreground shadow-[0_0_15px_rgba(129,140,248,0.4)]" 
            : "translate-x-0 bg-white text-amber-500 shadow-sm border border-border"
        )}
      >
        {isDark ? (
          <Moon className="w-4 h-4 fill-current" />
        ) : (
          <Sun className="w-4 h-4 fill-current" />
        )}
      </div>
    </button>
  );
}

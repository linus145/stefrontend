'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export function LocalLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="h-12 w-12 rounded-sm border-2 border-blue-500/20 animate-pulse" />
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground animate-pulse">
          Retrieving HR Data
        </p>
      </div>
    </div>
  );
}

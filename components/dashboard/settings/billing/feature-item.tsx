'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <li className={cn("flex items-start gap-2.5", !enabled && "opacity-45")}>
      {enabled ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      )}
      <span className={cn("leading-normal font-medium", enabled ? "text-foreground" : "text-muted-foreground line-through")}>
        {label}
      </span>
    </li>
  );
}

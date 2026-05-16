'use client';

import React from 'react';
import { JobApplication } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface ApplicationCardProps {
  application: JobApplication;
  isSelected: boolean;
  onClick: () => void;
}

export function ApplicationCard({ application, isSelected, onClick }: ApplicationCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card border-b border-border/50 p-4 cursor-pointer transition-all duration-200 hover:bg-muted/30",
        isSelected && "bg-primary/5 border-l-4 border-l-primary"
      )}
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-sm bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden border border-primary/10">
          <FileText className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#0a66c2] hover:underline truncate">
            {application.job_title}
          </h3>
          <p className="text-xs text-foreground mt-0.5 font-medium">
            Applied on {new Date(application.applied_at).toLocaleDateString()}
          </p>
          
          <div className="mt-2 flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              application.status === 'PENDING' ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
              application.status === 'ONBOARDED' ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
              "bg-blue-500/5 text-blue-500 border-blue-500/20"
            )}>
              {application.status}
            </span>
            <span className="text-[11px] text-muted-foreground">View details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

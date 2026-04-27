'use client';

import React from 'react';
import { JobPost } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, X, CheckCircle2 } from 'lucide-react';

interface JobCardProps {
  job: JobPost;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card border-b border-border/50 p-4 cursor-pointer transition-all duration-200 hover:bg-muted/30",
        isSelected && "bg-primary/5 border-l-4 border-l-primary"
      )}
    >
      <button 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-sm bg-card flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-1" />
          ) : (
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#0a66c2] hover:underline truncate">
            {job.title}
          </h3>
          <p className="text-xs text-foreground mt-0.5">
            {job.company_name} • {job.location} ({job.work_mode})
          </p>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </span>
              Actively reviewing applicants
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium">Promoted</span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 bg-[#0a66c2] text-white flex items-center justify-center rounded-[2px] text-[7px] font-black uppercase">B2</span>
                B2linq Apply
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Search, Clock, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewSession {
  id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  overall_score: number | null;
  is_orchestrated: boolean;
  exam_status?: string | null;
  application_status?: string | null;
}

interface EvaluationSidebarProps {
  sessions: InterviewSession[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const EvaluationSidebar = ({
  sessions,
  isLoading,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: EvaluationSidebarProps) => {
  return (
    <div className="w-full md:w-[300px] lg:w-[320px] border-r border-border flex flex-col bg-card shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2.5 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight whitespace-nowrap">Candidates</span>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[100px] max-w-[160px] relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-md py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-blue-600/20 focus:border-blue-600/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* Candidate List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Clock className="w-5 h-5 animate-spin text-muted-foreground opacity-30" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mb-3 opacity-20" />
            <p className="text-xs text-muted-foreground max-w-[180px] font-medium leading-relaxed">
              No completed candidates found.
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = selectedId === session.id;
            const initials = session.candidate_name.slice(0, 2).toUpperCase();

            return (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={cn(
                  "flex gap-3 px-4 py-3 cursor-pointer transition-all border-b border-border/30 select-none relative",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/20 border-l-[3px] border-l-blue-600"
                    : "hover:bg-muted/20 border-l-[3px] border-l-transparent"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[12px] font-bold border border-border shadow-sm">
                    {initials}
                  </div>
                  {/* Status dot */}
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full border-2 border-card absolute bottom-0 right-0",
                    session.status === 'COMPLETED' ? "bg-emerald-500" :
                      session.status === 'EVALUATING' ? "bg-blue-500" : "bg-amber-500"
                  )} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={cn(
                      "text-[13px] font-semibold truncate tracking-tight",
                      isActive ? "text-blue-600" : "text-foreground"
                    )}>
                      {session.candidate_name}
                    </h4>
                    {session.overall_score !== null && (
                      <span className="text-[11px] font-bold text-blue-600 shrink-0 ml-2">
                        {session.overall_score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-normal opacity-80 leading-normal">
                    {session.job_title}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

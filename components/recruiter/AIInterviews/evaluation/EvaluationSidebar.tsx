'use client';

import React from 'react';
import { Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewSession {
  id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  overall_score: number | null;
  is_orchestrated: boolean;
}

interface EvaluationSidebarProps {
  sessions: InterviewSession[];
  isLoading: boolean;
  selectedId: string | null;
  isCollapsed: boolean;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  toSentenceCase: (str: string) => string;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0 ml-auto">
      <svg className="w-8 h-8 transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
        <circle
          className="text-blue-600 transition-all duration-700 ease-in-out"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
      <span className="absolute text-[8px] font-bold text-blue-600">{percentage}%</span>
    </div>
  );
};

export const EvaluationSidebar = ({
  sessions,
  isLoading,
  selectedId,
  isCollapsed,
  onSelect,
  searchQuery,
  onSearchChange,
  toSentenceCase
}: EvaluationSidebarProps) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Clock className="w-5 h-5 animate-spin opacity-20" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center text-[11px] font-medium text-muted-foreground opacity-50 italic">
        No candidates found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {!isCollapsed && (
        <div className="pt-[13px] pb-[13px] pl-3 pr-5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent border border-border/50 rounded-sm py-1.5 pl-9 pr-3 text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 p-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={cn(
              "w-full px-3 py-2 text-left transition-all group relative rounded-md flex items-center gap-3",
              selectedId === session.id
                ? "bg-blue-600/10 shadow-sm"
                : "bg-transparent"
            )}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center justify-center gap-1 w-full">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border border-border group-hover:border-blue-600/30 transition-all shrink-0">
                  {session.candidate_name[0]}
                </div>
                {session.overall_score !== null && (
                  <span className="text-[10px] font-bold text-blue-600">{session.overall_score}%</span>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className={cn(
                      "text-[13px] font-bold truncate",
                      selectedId === session.id ? "text-blue-600" : "text-foreground"
                    )}>
                      {session.candidate_name}
                    </h3>
                    <span className={cn(
                      "w-1 h-1 rounded-full shrink-0",
                      session.status === 'COMPLETED' ? "bg-emerald-500" :
                        session.status === 'EVALUATING' ? "bg-blue-500" : "bg-amber-500"
                    )} />
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground truncate opacity-70">
                    {session.job_title}
                  </p>
                </div>
                {session.overall_score !== null && (
                  <CircularProgress percentage={session.overall_score} />
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};


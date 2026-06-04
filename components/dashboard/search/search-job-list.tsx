'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Building, CheckCircle2, Zap, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchJobListProps {
  isLoading: boolean;
  isFetching: boolean;
  filteredJobs: any[];
  selectedJobId: string | null;
  setSelectedJobId: (id: string) => void;
  addToRecentlyViewed: (id: string) => void;
  setMobileDetailOpen: (v: boolean) => void;
  handleDismissJob: (id: string, e: React.MouseEvent) => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (v: number | ((p: number) => number)) => void;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function SearchJobList(props: SearchJobListProps) {
  const {
    isLoading, isFetching, filteredJobs,
    selectedJobId, setSelectedJobId,
    addToRecentlyViewed, setMobileDetailOpen, handleDismissJob,
    currentPage, setCurrentPage, totalPages, hasNextPage, hasPrevPage,
  } = props;

  if (isLoading) {
    return (
      <div className="divide-y divide-border/60">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="p-3 animate-pulse flex items-start gap-2.5">
            <div className="w-10 h-10 bg-muted rounded-sm shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded-sm w-3/4" />
              <div className="h-2.5 bg-muted rounded-sm w-1/2" />
              <div className="h-2.5 bg-muted rounded-sm w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center text-muted-foreground mx-auto">
          <Building className="w-8 h-8 opacity-40" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-foreground">No matching jobs found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-normal">
            Try clearing some filters or tweaking your search term to find more active opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col divide-y divide-border/60">
        {filteredJobs.map((job: any) => {
          const isSelected = selectedJobId === job.id;
          return (
            <div
              key={job.id}
              onClick={() => { setSelectedJobId(job.id); addToRecentlyViewed(job.id); setMobileDetailOpen(true); }}
              className={cn(
                "p-3 flex items-start gap-2.5 cursor-pointer hover:bg-muted/30 relative group transition-colors",
                isSelected ? "bg-[#f0f7ff] dark:bg-[#0a66c2]/10 border-l-4 border-l-[#0a66c2]" : "border-l-4 border-l-transparent border-b border-border/20"
              )}
            >
              <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0 border border-border/40 overflow-hidden">
                {job.company_logo ? <img src={job.company_logo} alt="" className="w-full h-full object-cover" /> : <Building className="w-5 h-5 text-muted-foreground/50" />}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-[12.5px] font-semibold text-[#0a66c2] hover:underline group-hover:text-[#004182] transition-colors leading-snug truncate">{job.title}</h4>
                <p className="text-[11px] font-semibold text-foreground/80 mt-0">{job.company_name}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{job.location} ({job.work_mode.toLowerCase()})</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                  <CheckCircle2 className="w-3 h-3 fill-emerald-500/10 text-emerald-500 shrink-0" />
                  <span>Actively reviewing applicants</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[9.5px] text-muted-foreground flex-wrap">
                  <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  {job.is_ai_generated && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 font-bold text-[#0a66c2]">
                        <Zap className="w-2.5 h-2.5 fill-current" /> Easy Apply
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button onClick={(e) => handleDismissJob(job.id, e)} className="absolute right-3 top-3 text-muted-foreground/35 hover:text-foreground/85 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-muted/10 shrink-0">
          <span className="text-[10px] text-muted-foreground font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))} disabled={!hasPrevPage}
              className="h-6 w-6 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                  className={cn("h-6 min-w-[24px] px-1 flex items-center justify-center rounded-sm text-[10px] font-bold transition-all cursor-pointer",
                    currentPage === pageNum ? "bg-[#0a66c2] text-white border border-[#0a66c2]" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))} disabled={!hasNextPage}
              className="h-6 w-6 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay for page transitions */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-card/60 flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#0a66c2]" />
        </div>
      )}
    </>
  );
}

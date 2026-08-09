'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CandidateSelectionStepProps {
  filteredJobs: any[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  selectedApplicationIds: string[];
  setSelectedApplicationIds: React.Dispatch<React.SetStateAction<string[]>>;
  applications: any[];
  jobs: any[];
  jobsLoading: boolean;
  sessionsLoading: boolean;
  appsLoading: boolean;
  refetchJobs: () => void;
  refetchSessions: () => void;
  setStep: (step: number) => void;
}

export function CandidateSelectionStep({
  filteredJobs,
  selectedJobId,
  setSelectedJobId,
  selectedApplicationIds,
  setSelectedApplicationIds,
  applications,
  jobs,
  jobsLoading,
  sessionsLoading,
  appsLoading,
  refetchJobs,
  refetchSessions,
  setStep
}: CandidateSelectionStepProps) {
  return (
    <motion.div
      key="selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
    >
      {/* Left: Job & Volume Selection */}
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-muted-foreground opacity-70 mb-4 uppercase tracking-wider">Target Position</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">Select a job from your pipeline to configure rounds for its active candidates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(jobsLoading || sessionsLoading) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job: any) => (
                <button
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setSelectedApplicationIds([]);
                  }}
                  className={cn(
                    "p-5 rounded-sm border text-left transition-all hover:shadow-md relative overflow-hidden group",
                    selectedJobId === job.id
                      ? "bg-[#0a66c2] border-[#0a66c2] text-white shadow-lg shadow-[#0a66c2]/10"
                      : "bg-card border-border hover:border-[#0a66c2]/30"
                  )}
                >
                  <div className="relative z-10">
                    <p className={cn("text-[13px] font-bold truncate", selectedJobId === job.id ? "text-white" : "text-foreground")}>{job.title}</p>
                    <p className={cn("text-[11px] mt-1 font-bold opacity-60", selectedJobId === job.id ? "text-white" : "text-muted-foreground")}>{job.department || 'General'}</p>
                  </div>
                  {selectedJobId === job.id && <span className="text-[10px] font-bold border border-white/30 px-2 py-1 rounded-sm absolute top-3 right-3">Selected</span>}
                </button>
              ))
            ) : (
              <div className="text-center py-24 bg-muted/5 rounded-sm border border-dashed border-border flex flex-col items-center gap-6">
                <p className="text-sm font-medium opacity-50">No positions found in your pipeline</p>
                <button
                  onClick={() => {
                    refetchJobs();
                    refetchSessions();
                    toast.info("Pipeline synchronized with latest job data.");
                  }}
                  data-agent="sync-pipeline-button"
                  className="px-6 py-2 bg-[#0a66c2] text-white text-[10px] font-bold rounded-sm hover:bg-[#004182] transition-all shadow-lg shadow-[#0a66c2]/20"
                >
                  Sync
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-muted/10 border border-border rounded-sm p-6 space-y-6">
          <h4 className="text-[12px] font-bold text-muted-foreground opacity-70">Workspace summary</h4>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] font-bold opacity-50 shrink-0">Target job</span>
              <span className="text-[14px] font-bold text-right truncate" data-agent="target-job-title">{selectedJobId ? jobs.find(j => j.id === selectedJobId)?.title : 'Undefined'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-5">
              <span className="text-[12px] font-bold opacity-50">Volume</span>
              <span className="text-[14px] font-bold">{selectedApplicationIds.length} Candidates</span>
            </div>
            <button
              disabled={!selectedJobId || selectedApplicationIds.length === 0}
              onClick={() => setStep(2)}
              data-agent="proceed-to-architecture-button"
              className="w-full mt-6 bg-[#0a66c2] text-white py-4 rounded-sm font-bold text-[13px] hover:bg-[#004182] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center shadow-lg shadow-[#0a66c2]/20"
            >
              Next step
            </button>
          </div>
        </div>
      </div>

      {/* Right: Candidate Grid */}
      <div className="lg:col-span-7 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Candidate Pipeline</h3>
          {selectedJobId && applications.length > 0 && (
            <button
              onClick={() => {
                if (selectedApplicationIds.length === applications.length) setSelectedApplicationIds([]);
                else setSelectedApplicationIds(applications.map(a => a.id));
              }}
              className="text-[10px] font-bold text-[#0a66c2] hover:opacity-70 transition-opacity"
            >
              {selectedApplicationIds.length === applications.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-sm" />
              ))
            ) : applications.length > 0 ? (
              applications.map((app: any) => (
                <label
                  key={app.id}
                  data-agent="candidate-card"
                  data-candidate-name={`${app.applicant.first_name} ${app.applicant.last_name}`}
                  className={cn(
                    "relative group p-5 rounded-sm border cursor-pointer transition-all hover:shadow-md",
                    selectedApplicationIds.includes(app.id)
                      ? "bg-[#0a66c2] border-[#0a66c2] text-white shadow-lg shadow-[#0a66c2]/10"
                      : "bg-card border-border hover:border-[#0a66c2]/30"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedApplicationIds.includes(app.id)}
                    data-agent="candidate-selection-checkbox"
                    onChange={() => {
                      if (selectedApplicationIds.includes(app.id)) {
                        setSelectedApplicationIds(selectedApplicationIds.filter(id => id !== app.id));
                      } else {
                        setSelectedApplicationIds([...selectedApplicationIds, app.id]);
                      }
                    }}
                  />
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all shrink-0",
                      selectedApplicationIds.includes(app.id) ? "bg-white/20 border-white/40" : "bg-muted border-border"
                    )}>
                      {app.applicant.first_name[0]}{app.applicant.last_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold truncate">{app.applicant.first_name} {app.applicant.last_name}</p>
                      <p className={cn("text-[11px] font-bold opacity-60 mt-1", selectedApplicationIds.includes(app.id) ? "text-white" : "text-muted-foreground")}>
                        {app.status || 'Applied'} • {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedApplicationIds.includes(app.id) && (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-[#0a66c2]" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      </div>
                    )}
                  </div>
                </label>
              ))
            ) : (
              <div className="col-span-full py-24 bg-muted/5 border border-dashed border-border rounded-sm flex flex-col items-center justify-center opacity-40">
                <p className="text-[11px] font-bold opacity-40">Awaiting job selection</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { JobPost, JobApplication } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, MapPin, Clock, DollarSign, CheckCircle2, X, Users,
  ExternalLink, Plus, ChevronRight, FileText, Copy, Check, Loader2, Zap,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface JobDetailsProps {
  job: JobPost;
  applications: JobApplication[];
  onClose: () => void;
  onApply: () => void;
  onEasyApply: () => void;
  isApplying?: boolean;
  onMessageRecruiter?: (userId: string) => void;
  savedJobIds: string[];
  onToggleSave: (jobId: string) => void;
}

export function JobDetails({ 
  job, 
  applications, 
  onClose, 
  onApply, 
  onEasyApply, 
  isApplying = false, 
  onMessageRecruiter,
  savedJobIds,
  onToggleSave
}: JobDetailsProps) {
  const hasApplied = applications.some(app => app.job === job.id);

  return (
    <div 
      className="flex flex-col h-full bg-card"
      style={{
        '--radius-sm': '6px',
        '--radius-md': '8px',
        '--radius-lg': '10px',
        '--radius': '10px',
      } as React.CSSProperties}
    >
      {/* Detail Header */}
      <div className="p-4 border-b border-border/50 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-3 mb-3">
          <div className="w-12 h-12 rounded-sm bg-card border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
            {(job.company?.logo_url || job.company_logo) ? (
              <img src={job.company?.logo_url || job.company_logo} alt="" className="w-full h-full object-contain p-1.5" />
            ) : (
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-black text-foreground leading-tight tracking-tight hover:underline cursor-pointer truncate">{job.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[11px] text-muted-foreground">
              <span className="text-foreground hover:underline cursor-pointer font-bold">{job.company?.company_name || job.company_name}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span className="text-foreground font-bold">
                {job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-emerald-600/30 bg-emerald-500/5 text-emerald-700 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            {job.hiring_status === 'ACTIVELY_HIRING' ? 'Actively hiring' : 'Actively reviewing'}
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border bg-muted/30 text-muted-foreground text-[10px] font-bold capitalize">
            {job.work_mode === 'ONSITE' ? 'On-site' : job.work_mode.toLowerCase()}
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border bg-muted/30 text-muted-foreground text-[10px] font-bold capitalize">
            {job.job_type.replace('_', ' ').toLowerCase()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasApplied ? (
            <button
              disabled
              className="px-4 py-1.5 bg-emerald-600/10 text-emerald-700 rounded-sm text-xs font-bold border border-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </button>
          ) : (
            <>
              <button
                onClick={onEasyApply}
                disabled={isApplying}
                className="px-4 py-1.5 bg-[#0a66c2] text-white rounded-sm text-xs font-bold hover:bg-[#004182] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                B2 Apply
              </button>
              <button
                onClick={onApply}
                disabled={isApplying}
                className="px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-sm text-xs font-bold hover:bg-[#0a66c2]/5 transition-all disabled:opacity-50 cursor-pointer"
              >
                Apply
              </button>
            </>
          )}
          <button
            onClick={() => onToggleSave(job.id)}
            className={cn(
              "px-4 py-1.5 border rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm",
              savedJobIds.includes(job.id)
                ? "border-emerald-600 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-muted-foreground text-muted-foreground hover:bg-muted"
            )}
          >
            {savedJobIds.includes(job.id) ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-muted/30">
        {/* Profile Match Section */}
        <section className="bg-card border border-border/50 rounded-sm p-3.5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">How your profile and resume fit</h3>
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:underline">Show match details</p>
                <p className="text-[10px] text-muted-foreground">See how you compare to other applicants</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </section>

        {/* Hiring Team Section */}
        <section className="bg-card border border-border/50 rounded-sm p-3.5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">Meet the hiring team</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm overflow-hidden border border-border/50 shadow-sm bg-muted flex items-center justify-center shrink-0">
              {job.hr_profile?.profile_image_url ? (
                <img src={job.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground hover:underline cursor-pointer">
                {job.hr_profile?.name || 'Hiring Team'}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {job.hr_profile?.designation || 'Talent Acquisition Partner'}
              </p>
            </div>
            <button
              onClick={() => onMessageRecruiter?.(job.owner_user_id || '')}
              className="px-3 py-1 border border-border rounded-sm text-[10px] font-bold hover:bg-muted transition-all cursor-pointer"
            >
              Message
            </button>
          </div>
        </section>

        {/* Skills Section */}
        {(() => {
          const displaySkills = (job.skills && job.skills.length > 0) 
            ? job.skills.map(s => s.name) 
            : (job.skills_required || []);
          
          if (displaySkills.length === 0) return null;

          return (
            <section className="bg-card border border-border/50 rounded-sm p-3.5 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {displaySkills.map(skill => (
                  <span 
                    key={skill}
                    className="px-2 py-0.5 rounded-sm bg-primary/5 text-primary text-[10px] font-bold border border-primary/10 capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          );
        })()}

        {/* About the Job */}
        <section className="bg-card border border-border/50 rounded-sm p-3.5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">About the job</h3>
          <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">
            {job.description}
          </div>
        </section>

        {/* About the Company */}
        <section className="bg-card border border-border/50 rounded-sm p-3.5 shadow-sm pb-3">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">About the company</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-sm bg-card border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
              {(job.company?.logo_url || job.company_logo) ? (
                <img src={job.company?.logo_url || job.company_logo} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground hover:underline cursor-pointer truncate">{job.company?.company_name || job.company_name}</h4>
              <p className="text-[10px] text-muted-foreground">530,783 followers</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1 border border-[#0a66c2] text-[#0a66c2] rounded-sm text-[10px] font-bold hover:bg-[#0a66c2]/5 transition-all shrink-0 cursor-pointer">
              <Plus className="w-3 h-3" />
              Follow
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            {job.company?.description || `${job.company?.company_name || job.company_name} is a global leader in technology and services. We are dedicated to delivering innovative solutions that empower businesses and individuals worldwide.`}
          </p>
          <button className="mt-3 text-[10px] font-bold text-[#0a66c2] hover:underline cursor-pointer">Show more</button>
        </section>
      </div>
    </div>
  );
}

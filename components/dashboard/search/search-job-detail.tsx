'use client';

import React from 'react';
import {
  Briefcase, Building, Share2, Bookmark, BookmarkCheck,
  Loader2, Zap, CheckCircle2, TrendingUp, Plus, MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatExpLevel, formatJobType } from './search-constants';

interface SearchJobDetailProps {
  selectedJob: any;
  isDetailLoading: boolean;
  hasApplied: boolean;
  isPremium: boolean;
  savedJobIds: string[];
  applyIsPending: boolean;
  // Actions
  handleEasyApply: () => void;
  onOpenApplyModal: () => void;
  toggleSaveJob: (id: string) => void;
  shareJob: (job: any) => void;
  handleMessageRecruiter: (id: string) => void;
  onSectionChange: (section: any, id?: string | null) => void;
}

export function SearchJobDetail(props: SearchJobDetailProps) {
  const {
    selectedJob, isDetailLoading, hasApplied, isPremium, savedJobIds,
    applyIsPending, handleEasyApply, onOpenApplyModal,
    toggleSaveJob, shareJob, handleMessageRecruiter, onSectionChange,
  } = props;

  if (isDetailLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Fetching details...</p>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-4">
        <Briefcase className="w-12 h-12 mb-4 text-muted-foreground" />
        <p className="text-sm font-bold text-foreground">Select a job from results list</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Click on a job card to view its description, hiring contacts, and application options.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Container */}
      <div className="p-4 border-b border-border/50 space-y-3 bg-gradient-to-b from-muted/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-sm border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {selectedJob.company?.logo_url ? <img src={selectedJob.company.logo_url} alt="" className="w-full h-full object-cover" /> : <Building className="w-7 h-7 text-muted-foreground/45" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold text-foreground leading-snug">{selectedJob.title}</h3>
              <p className="text-[12.5px] font-semibold text-[#0a66c2] hover:underline cursor-pointer mt-0.5">{selectedJob.company?.company_name}</p>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{selectedJob.location}</span><span>•</span>
                <span className="capitalize">{selectedJob.work_mode.toLowerCase()}</span><span>•</span>
                <span>{formatDistanceToNow(new Date(selectedJob.created_at), { addSuffix: true })}</span><span>•</span>
                <span className="font-semibold text-foreground">{selectedJob.applications_count || 0} applicants</span>
              </p>
            </div>
          </div>
          <button onClick={() => shareJob(selectedJob)} className="p-1.5 rounded-sm border border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer shadow-sm transition-all">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Attribute pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] bg-muted border border-border/85 px-2 py-0.5 rounded-sm font-bold capitalize text-muted-foreground">{formatJobType(selectedJob.job_type)}</span>
          <span className="text-[10.5px] bg-muted border border-border/85 px-2 py-0.5 rounded-sm font-bold text-muted-foreground">{formatExpLevel(selectedJob.experience_level)}</span>
          {selectedJob.salary_max && (
            <span className="text-[10.5px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm font-extrabold">
              ₹{Number(selectedJob.salary_min).toLocaleString('en-IN')} - ₹{Number(selectedJob.salary_max).toLocaleString('en-IN')} / yr
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          {hasApplied ? (
            <button disabled className="h-8.5 px-4.5 rounded-sm bg-emerald-600/10 text-emerald-700 text-xs font-bold border border-emerald-600/20 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Applied
            </button>
          ) : (
            <>
              <button onClick={handleEasyApply} disabled={applyIsPending}
                className="h-8.5 px-4.5 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 transition-all animate-in fade-in duration-200">
                {applyIsPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />} B2 Apply
              </button>
              <button onClick={onOpenApplyModal} disabled={applyIsPending}
                className="h-8.5 px-4.5 rounded-sm border border-[#0a66c2] hover:bg-[#0a66c2]/5 text-[#0a66c2] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors">
                Apply Now
              </button>
            </>
          )}
          <button onClick={() => toggleSaveJob(selectedJob.id)}
            className="h-8.5 px-4 rounded-sm border border-[#0a66c2] hover:bg-[#0a66c2]/5 text-[#0a66c2] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors">
            {savedJobIds.includes(selectedJob.id) ? <><BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span>Saved</span></> : <><Bookmark className="w-3.5 h-3.5 shrink-0" /><span>Save</span></>}
          </button>
        </div>
      </div>

      {/* Body Details pane */}
      <div className="p-4 space-y-4.5 flex-1 bg-card">
        {/* Premium Upsell */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20 rounded-sm p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-[11.5px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Increase your hiring chances
              </h4>
              <p className="text-[10.5px] text-muted-foreground leading-relaxed max-w-md">Get premium matching insights, optimize your resume for ATS, and directly message start-up founders.</p>
            </div>
            <button onClick={() => onSectionChange('premium')} className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] rounded-sm shadow hover:opacity-95 transition-all shrink-0 cursor-pointer">Try Premium for ₹0</button>
          </div>
        )}

        {/* Hiring Team Contact */}
        <div className="bg-muted/10 border border-border/40 rounded-sm p-3.5 space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hiring Team Contact</h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary uppercase overflow-hidden shrink-0">
                {selectedJob.hr_profile?.profile_image_url ? <img src={selectedJob.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" /> : <span>{selectedJob.hr_profile?.name?.charAt(0) || 'H'}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-foreground">{selectedJob.hr_profile?.name || 'Hiring Team'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedJob.hr_profile?.designation || 'Talent Acquisition Partner'}</p>
              </div>
            </div>
            <button onClick={() => handleMessageRecruiter(selectedJob.owner_user_id || '')}
              className="w-full sm:w-auto h-7.5 px-3.5 rounded-sm border border-[#0a66c2] hover:bg-[#0a66c2]/5 text-[#0a66c2] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0">
              <MessageSquare className="w-3.5 h-3.5" /> Message Hiring Manager
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <h4 className="text-[10.5px] font-black uppercase tracking-widest text-muted-foreground">Job Description</h4>
          <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">{selectedJob.description}</div>
        </div>

        {/* Skills */}
        {selectedJob.skills?.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border/30">
            <h4 className="text-[10.5px] font-black uppercase tracking-widest text-muted-foreground">Skills Required</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedJob.skills.map((skill: any) => (
                <span key={skill.id} className="px-2 py-0.5 bg-muted border border-border rounded-sm text-[10px] font-bold text-muted-foreground capitalize">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* About the Company */}
        <div className="space-y-3 pt-3 border-t border-border/30 pb-4">
          <h4 className="text-[10.5px] font-black uppercase tracking-widest text-muted-foreground">About the company</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-card border border-border/50 flex items-center justify-center overflow-hidden shadow-sm bg-muted">
              {selectedJob.company?.logo_url ? <img src={selectedJob.company.logo_url} alt="" className="w-full h-full object-contain p-1" /> : <Building className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{selectedJob.company?.company_name || selectedJob.company_name}</h4>
              <p className="text-[10px] text-muted-foreground">{selectedJob.company?.industry || 'Technology & Services'}</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1 border border-[#0a66c2] text-[#0a66c2] rounded-sm text-[10px] font-bold hover:bg-[#0a66c2]/5 transition-all shrink-0 cursor-pointer">
              <Plus className="w-3 h-3" /> Follow
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            {selectedJob.company?.description || `${selectedJob.company?.company_name || selectedJob.company_name || 'The company'} is a global leader in technology and services. We are dedicated to delivering innovative solutions that empower businesses and individuals worldwide.`}
          </p>
        </div>
      </div>
    </div>
  );
}

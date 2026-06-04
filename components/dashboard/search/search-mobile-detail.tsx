'use client';

import React from 'react';
import {
  Building, ArrowLeft, Share2, Bookmark, BookmarkCheck,
  Zap, CheckCircle2, Sparkles, Plus, MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatExpLevel, formatJobType } from './search-constants';
import { calculateAiMatch } from './search-utils';

interface SearchMobileDetailProps {
  selectedJob: any;
  user: any;
  savedJobIds: string[];
  applyIsPending: boolean;
  handleEasyApply: () => void;
  onOpenApplyModal: () => void;
  toggleSaveJob: (id: string) => void;
  shareJob: (job: any) => void;
  handleMessageRecruiter: (id: string) => void;
  onClose: () => void;
}

export function SearchMobileDetail(props: SearchMobileDetailProps) {
  const {
    selectedJob, user, savedJobIds, applyIsPending,
    handleEasyApply, onOpenApplyModal,
    toggleSaveJob, shareJob, handleMessageRecruiter, onClose,
  } = props;

  if (!selectedJob) return null;

  const { score, reasons } = calculateAiMatch(selectedJob, user);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:hidden animate-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onClose} className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs font-black uppercase text-[#0a66c2]">Job Details</span>
        <div className="w-12" />
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-sm border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {selectedJob.company?.logo_url ? <img src={selectedJob.company.logo_url} alt="" className="w-full h-full object-cover" /> : <Building className="w-8 h-8 text-muted-foreground/45" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground leading-snug">{selectedJob.title}</h3>
            <p className="text-xs font-semibold text-[#0a66c2] mt-0.5">{selectedJob.company?.company_name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{selectedJob.location} • {selectedJob.work_mode.toLowerCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-muted/15 border border-border/40 rounded-sm p-3 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Salary Range</p>
            <p className="font-extrabold text-foreground">{selectedJob.salary_max ? `₹${Number(selectedJob.salary_min).toLocaleString('en-IN')} - ₹${Number(selectedJob.salary_max).toLocaleString('en-IN')}` : 'Unspecified'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Experience</p>
            <p className="font-bold text-foreground">{formatExpLevel(selectedJob.experience_level)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Employment</p>
            <p className="font-bold text-foreground">{formatJobType(selectedJob.job_type)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Applicants</p>
            <p className="font-bold text-foreground">{selectedJob.applications_count || 0} applied</p>
          </div>
        </div>

        {/* AI match */}
        <div className="bg-[#0a66c2]/5 border border-[#0a66c2]/15 rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#0a66c2] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> AI Match Fit Score
            </span>
            <span className="text-sm font-extrabold text-[#0a66c2]">{score}% Match</span>
          </div>
          <div className="w-full bg-[#0a66c2]/10 h-1.2 rounded-sm overflow-hidden">
            <div className="bg-[#0a66c2] h-full rounded-sm" style={{ width: `${score}%` }} />
          </div>
          <div className="space-y-1.5 pt-1.5 border-t border-[#0a66c2]/10">
            {reasons.slice(0, 3).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-foreground/80 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 pt-2">
          {selectedJob.is_ai_generated ? (
            <button onClick={handleEasyApply} disabled={applyIsPending}
              className="flex-1 h-10 rounded-sm bg-[#0a66c2] text-white font-bold text-sm shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75">
              <Zap className="w-4 h-4 fill-current" /> Easy Apply
            </button>
          ) : (
            <button onClick={onOpenApplyModal} className="flex-1 h-10 rounded-sm bg-[#0a66c2] text-white font-bold text-sm shadow cursor-pointer">Apply Now</button>
          )}
          <button onClick={() => toggleSaveJob(selectedJob.id)} className="w-12 h-10 rounded-sm border border-border text-muted-foreground flex items-center justify-center shrink-0 cursor-pointer">
            {savedJobIds.includes(selectedJob.id) ? <BookmarkCheck className="w-5 h-5 text-emerald-600" /> : <Bookmark className="w-5 h-5" />}
          </button>
          <button onClick={() => shareJob(selectedJob)} className="w-12 h-10 rounded-sm border border-border text-muted-foreground flex items-center justify-center shrink-0 cursor-pointer">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-4 border-t border-border">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">About the Role</h4>
          <div className="text-[12.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap font-medium">{selectedJob.description}</div>
        </div>

        {/* Skills */}
        {selectedJob.skills?.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Skills Required</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedJob.skills.map((skill: any) => (
                <span key={skill.id} className="px-2.5 py-1 bg-muted border border-border/70 rounded-sm text-[10px] font-bold text-muted-foreground capitalize">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* HR manager */}
        <div className="bg-muted/10 border border-border/40 rounded-sm p-4 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Meet the Hiring Contact</h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary uppercase overflow-hidden shrink-0">
                {selectedJob.hr_profile?.profile_image_url ? <img src={selectedJob.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" /> : <span>{selectedJob.hr_profile?.name?.charAt(0) || 'H'}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">{selectedJob.hr_profile?.name || 'Hiring Team'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{selectedJob.hr_profile?.designation || 'Talent Acquisition Partner'}</p>
              </div>
            </div>
            <button onClick={() => handleMessageRecruiter(selectedJob.owner_user_id || '')}
              className="w-full sm:w-auto h-8 rounded-sm border border-[#0a66c2] text-[#0a66c2] font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0">
              <MessageSquare className="w-3.5 h-3.5" /> Message Contact
            </button>
          </div>
        </div>

        {/* About the Company */}
        <div className="space-y-3 pt-4 border-t border-border pb-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">About the Company</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-card border border-border/50 flex items-center justify-center overflow-hidden shadow-sm bg-muted">
              {selectedJob.company?.logo_url ? <img src={selectedJob.company.logo_url} alt="" className="w-full h-full object-contain p-1" /> : <Building className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{selectedJob.company?.company_name || selectedJob.company_name}</h4>
              <p className="text-[11px] text-muted-foreground">{selectedJob.company?.industry || 'Technology & Services'}</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-sm text-xs font-bold hover:bg-[#0a66c2]/5 transition-all shrink-0 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Follow
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {selectedJob.company?.description || `${selectedJob.company?.company_name || selectedJob.company_name || 'The company'} is a global leader in technology and services.`}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { JobPost, JobApplication } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Users,
  ExternalLink,
  Plus,
  ChevronRight,
  FileText
} from 'lucide-react';

interface JobDetailsProps {
  job: JobPost;
  applications: JobApplication[];
  onClose: () => void;
  onApply: () => void;
}

export function JobDetails({ job, applications, onClose, onApply }: JobDetailsProps) {
  const hasApplied = applications.some(app => app.job === job.id);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Detail Header */}
      <div className="p-6 border-b border-border/50 relative">
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex gap-4 mb-4">
          <div className="w-16 h-16 rounded-sm bg-white border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight hover:underline cursor-pointer">{job.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-[13px] text-muted-foreground">
              <span className="text-foreground hover:underline cursor-pointer font-medium">{job.company_name}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span className="text-foreground font-medium">Over 100 applicants</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-600/30 bg-emerald-500/5 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {job.work_mode === 'ONSITE' ? 'On-site' : job.work_mode.toLowerCase()}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground text-xs font-semibold">
            {job.job_type.replace('_', ' ').toLowerCase()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasApplied ? (
            <button
              disabled
              className="px-8 py-2 bg-emerald-600/10 text-emerald-700 rounded-full text-sm font-bold border border-emerald-600/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Applied
            </button>
          ) : (
            <button
              onClick={onApply}
              className="px-8 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-bold hover:bg-[#004182] transition-all flex items-center gap-2 shadow-sm"
            >
              Apply
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button className="px-8 py-2 border border-[#0a66c2] text-[#0a66c2] rounded-full text-sm font-bold hover:bg-[#0a66c2]/5 transition-all">
            Save
          </button>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#f3f3f3]/30">
        {/* Profile Match Section */}
        <section className="bg-white border border-border/50 rounded-sm p-5 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4 tracking-tight">How your profile and resume fit this job</h3>
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-foreground group-hover:underline">Show match details</p>
                <p className="text-[11px] text-muted-foreground">See how you compare to other applicants</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </section>

        {/* Hiring Team Section */}
        {job.hr_profile && (
          <section className="bg-white border border-border/50 rounded-sm p-5 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4 tracking-tight">Meet the hiring team</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50 shadow-sm">
                {job.hr_profile.profile_image_url ? (
                  <img src={job.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {job.hr_profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-foreground hover:underline cursor-pointer">{job.hr_profile.name}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{job.hr_profile.designation || 'Hiring Manager'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Job Poster</p>
              </div>
              <button className="px-5 py-1.5 border border-border rounded-full text-xs font-bold hover:bg-muted transition-all">
                Message
              </button>
            </div>
          </section>
        )}

        {/* About the Job */}
        <section className="bg-white border border-border/50 rounded-sm p-5 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4 tracking-tight">About the job</h3>
          <div className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">
            {job.description}
          </div>
        </section>

        {/* About the Company */}
        <section className="bg-white border border-border/50 rounded-sm p-5 shadow-sm pb-4">
          <h3 className="text-base font-bold text-foreground mb-4 tracking-tight">About the company</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded bg-white border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
              {job.company_logo ? (
                <img src={job.company_logo} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <Briefcase className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-foreground hover:underline cursor-pointer">{job.company_name}</h4>
              <p className="text-[11px] text-muted-foreground">530,783 followers</p>
            </div>
            <button className="flex items-center gap-1.5 px-5 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-full text-xs font-bold hover:bg-[#0a66c2]/5 transition-all">
              <Plus className="w-3.5 h-3.5" />
              Follow
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {job.company_name} is a global leader in technology and services. We are dedicated to delivering innovative solutions that empower businesses and individuals worldwide.
          </p>
          <button className="mt-4 text-xs font-bold text-[#0a66c2] hover:underline">Show more</button>
        </section>
      </div>
    </div>
  );
}

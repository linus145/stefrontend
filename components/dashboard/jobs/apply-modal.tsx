'use client';

import React from 'react';
import { JobPost } from '@/types/jobs.types';
import { 
  X, 
  Briefcase, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  Send, 
  Loader2 
} from 'lucide-react';

interface ApplyModalProps {
  job: JobPost;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  resumeUrl: string;
  setResumeUrl: (val: string) => void;
  coverLetter: string;
  setCoverLetter: (val: string) => void;
  isPending: boolean;
}

export function ApplyModal({ 
  job, 
  onClose, 
  onSubmit, 
  resumeUrl, 
  setResumeUrl, 
  coverLetter, 
  setCoverLetter,
  isPending 
}: ApplyModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-card border border-border rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-border">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
              ) : (
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">Apply to {job.title}</h2>
              <p className="text-sm text-muted-foreground font-medium">{job.company_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company & HR Info Section */}
        <div className="px-6 py-4 bg-muted/10 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Company Information</h4>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                {job.company_name}
                {job.company_is_genuine && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {job.location}
              </p>
            </div>
          </div>
          {job.hr_profile && (
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Hiring Manager (HR)</h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                  {job.hr_profile.profile_image_url ? (
                    <img src={job.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">
                      {job.hr_profile.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{job.hr_profile.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{job.hr_profile.designation || 'HR Manager'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Resume URL
            </label>
            <input
              type="url"
              required
              placeholder="https://your-resume-link.com"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <p className="text-[10px] text-muted-foreground">Provide a public link to your resume (Drive, Dropbox, personal site).</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              Cover Letter (Optional)
            </label>
            <textarea
              rows={5}
              placeholder="Tell the hiring manager why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-sm text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-sm text-sm font-bold hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] px-4 py-3 bg-primary text-primary-foreground rounded-sm text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

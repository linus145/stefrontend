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
  Loader2,
  ChevronRight,
  ChevronLeft,
  Building2,
  DollarSign,
  Calendar,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { User } from '@/types/user.types';
import { FounderProfile } from '@/types/founder.types';
import { followService } from '@/services/follow.service';

interface ApplyModalProps {
  job: JobPost;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  resumeUrl: string;
  setResumeUrl: (val: string) => void;
  coverLetter: string;
  setCoverLetter: (val: string) => void;
  isPending: boolean;
  expectedSalary: string;
  setExpectedSalary: (val: string) => void;
}

export function ApplyModal({ 
  job, 
  onClose, 
  onSubmit, 
  resumeUrl, 
  setResumeUrl, 
  coverLetter, 
  setCoverLetter,
  isPending,
  expectedSalary,
  setExpectedSalary
}: ApplyModalProps) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [followCompany, setFollowCompany] = React.useState<boolean>(true);
  const [userProfile, setUserProfile] = React.useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await userService.getProfile();
        if (response.status === 'success') {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const founderProfile = userProfile?.profile as FounderProfile | null;
  const latestExperience = founderProfile?.experience?.[0];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => setStep(1);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[460px] bg-card border border-border rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          '--radius-sm': '6px',
          '--radius-md': '8px',
          '--radius-lg': '10px',
          '--radius': '10px',
        } as React.CSSProperties}
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-border">
              {(job.company?.logo_url || job.company_logo) ? (
                <img 
                  src={job.company?.logo_url || job.company_logo} 
                  alt={job.company?.company_name || job.company_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-foreground leading-tight">Apply to {job.title}</h2>
              <p className="text-[11px] text-muted-foreground font-medium">{job.company?.company_name || job.company_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted w-full">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Company & HR Info Section */}
        <div className="px-4 py-2.5 bg-muted/5 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Company</h4>
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                {job.company?.company_name || job.company_name}
                {(job.company?.is_genuine || job.company_is_genuine) && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                )}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {job.location}
              </p>
            </div>
          </div>
          {job.hr_profile && (
            <div>
              <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Hiring Manager</h4>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                  {job.hr_profile.profile_image_url ? (
                    <img src={job.hr_profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-primary">
                      {job.hr_profile.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate">{job.hr_profile.name}</p>
                  <p className="text-[9.5px] text-muted-foreground truncate">{job.hr_profile.designation || 'HR Manager'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="p-4 space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-primary" />
                Resume Link
              </label>
              <input
                type="url"
                required
                placeholder="https://your-resume-link.com"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-muted/10 border border-border rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <p className="text-[9px] text-muted-foreground">Provide a link to your Google Drive, Dropbox, or PDF resume.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                Expected Monthly Salary (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 bg-muted/10 border border-border rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Send className="w-3 h-3 text-blue-600" />
                Cover Letter (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Tell the hiring manager why you're a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3 py-2 bg-muted/10 border border-border rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-3 py-2 bg-primary text-primary-foreground rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Review Application
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 space-y-3.5 bg-card animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground">Review your application</h3>
              <p className="text-[10px] text-muted-foreground">Please double check your application details.</p>
            </div>

            {/* Profile Summary Card */}
            <div className="p-3 bg-muted/10 border border-border rounded-sm space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-sm bg-muted border border-border overflow-hidden flex-shrink-0">
                  {userProfile?.profile_image_url ? (
                    <img src={userProfile.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-2.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground leading-none mb-0.5">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 mb-1">
                    {founderProfile?.headline || "Professional Member"}
                  </p>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                    <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
                      <Building2 className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate max-w-[120px]">{latestExperience?.company || "No experience listed"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span>{founderProfile?.location || "Remote"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                <div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Experience</p>
                  <p className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    {founderProfile?.experience_years || 0} Years
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Expected Salary</p>
                  <p className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                    ${expectedSalary} / mo
                  </p>
                </div>
              </div>
            </div>

            {/* Application Data */}
            <div className="space-y-2.5">
              <div>
                <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5 text-primary" />
                  Attached Resume
                </h4>
                <div className="p-2 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold text-foreground truncate max-w-[160px]">
                      {resumeUrl.split('/').pop() || 'resume.pdf'}
                    </p>
                  </div>
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0">
                    <Globe className="w-2.5 h-2.5" />
                    View
                  </a>
                </div>
              </div>

              {coverLetter && (
                <div>
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Send className="w-2.5 h-2.5 text-blue-600" />
                    Cover Letter
                  </h4>
                  <div className="p-2 bg-muted/5 border border-border rounded-sm">
                    <p className="text-[10px] text-foreground/80 leading-normal whitespace-pre-wrap line-clamp-2">
                      {coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow Company Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={followCompany}
                  onChange={(e) => setFollowCompany(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-border text-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                />
                <span className="text-[11px] text-muted-foreground font-medium">
                  Follow <span className="font-bold text-foreground">{job.company?.company_name || job.company_name}</span> to stay up to date on latest jobs and announcements
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                className="px-3 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                onClick={(e) => {
                  const companyId = job.company?.id || job.company_id;
                  if (followCompany && companyId) {
                    followService.getCompanyFollowCounts(companyId).then((data) => {
                      if (!data.is_following) {
                        followService.toggleCompanyFollow(companyId).catch(() => {});
                      }
                    }).catch(() => {});
                  }
                  onSubmit(e);
                }}
                disabled={isPending}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

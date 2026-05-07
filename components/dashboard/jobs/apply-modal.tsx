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

        {/* Progress Bar */}
        <div className="h-1 bg-muted w-full">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
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

        {step === 1 ? (
          <form onSubmit={handleNext} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Resume URL
              </label>
              <input
                type="url"
                required
                placeholder="https://your-resume-link.com"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-sm text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <p className="text-[10px] text-muted-foreground">Provide a public link to your resume (Drive, Dropbox, etc.).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Expected Monthly Salary (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-muted/20 border border-border rounded-sm text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                Cover Letter (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Tell the hiring manager why you're a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-4 py-3 bg-muted/20 border border-border rounded-sm text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-border rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-4 py-3 bg-primary text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Review Application
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6 bg-card animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Review your application</h3>
              <p className="text-[11px] text-muted-foreground">This is what the hiring manager will see.</p>
            </div>

            {/* Profile Summary Card */}
            <div className="p-4 bg-muted/20 border border-border rounded-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0">
                  {userProfile?.profile_image_url ? (
                    <img src={userProfile.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-bold text-foreground leading-none mb-1">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 mb-2">
                    {founderProfile?.headline || "Professional Member"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      {latestExperience?.company || "No experience listed"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {founderProfile?.location || "Remote"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Experience</p>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {founderProfile?.experience_years || 0} Years
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Expected Salary</p>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    ${expectedSalary} / month
                  </p>
                </div>
              </div>
            </div>

            {/* Application Data */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Attached Resume
                </h4>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-foreground truncate max-w-[200px]">
                      {resumeUrl.split('/').pop() || 'resume.pdf'}
                    </p>
                  </div>
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    View
                  </a>
                </div>
              </div>

              {coverLetter && (
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Send className="w-3 h-3" />
                    Cover Letter
                  </h4>
                  <div className="p-3 bg-muted/10 border border-border rounded-sm">
                    <p className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {coverLetter}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                className="px-4 py-3 border border-border rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={onSubmit}
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit
                    <Send className="w-3.5 h-3.5" />
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

'use client';

import { useState } from 'react';
import { User as UserIcon, Mail, Clock, BrainCircuit, Eye, CheckCircle, XCircle, ChevronDown, FileText, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobApplication, ApplicationStatus } from '@/types/jobs.types';

interface ApplicationCardProps {
  app: JobApplication;
  onUpdateStatus: (appId: string, status: string, employmentType?: string) => void;
  onContact: (app: JobApplication, sendEmail: boolean) => void;
  isUpdatePending: boolean;
}

export function ApplicationCard({
  app,
  onUpdateStatus,
  onContact,
  isUpdatePending
}: ApplicationCardProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const statusDotColors: Record<ApplicationStatus, string> = {
    PENDING: 'bg-amber-500',
    REVIEWED: 'bg-blue-500',
    SHORTLISTED: 'bg-cyan-500',
    INTERVIEW: 'bg-purple-500',
    ONBOARDED: 'bg-emerald-500',
    REJECTED: 'bg-red-500',
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const map: Record<ApplicationStatus, string> = {
      PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      REVIEWED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SHORTLISTED: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      INTERVIEW: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      ONBOARDED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return map[status];
  };

  return (
    <>
      <tr
        id={app.id}
        className="border-b border-border/50 last:border-0 hover:bg-muted/5 transition-colors"
      >
        {/* Avatar & Name */}
        <td className="pl-6 pr-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-500/10 flex items-center justify-center shrink-0">
              {app.applicant.profile_image_url ? (
                <img src={app.applicant.profile_image_url} alt="" className="w-full h-full rounded-[4px] object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {app.applicant.first_name} {app.applicant.last_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">{app.applicant.email}</p>
            </div>
          </div>
        </td>

        {/* Applied Date */}
        <td className="px-4 py-2 text-xs text-foreground/80 font-medium">
          {new Date(app.applied_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
        </td>

        {/* AI Score */}
        <td className="px-4 py-2">
          {app.ai_score !== null && app.ai_score !== undefined ? (
            <span
              data-agent="ai-match-score"
              className={cn("inline-flex items-center gap-1.5 font-bold text-xs", getAIScoreColor(app.ai_score))}
            >
              <BrainCircuit className="w-3.5 h-3.5" /> Match: {app.ai_score}%
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40 italic">Not screened</span>
          )}
        </td>

        {/* Documents */}
        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {app.resume_url ? (
              <a
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-[4px] text-xs font-semibold border border-blue-500/20 transition-colors shadow-sm"
                title="View Resume"
              >
                <FileText className="w-3.5 h-3.5" />
                Resume
              </a>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic">No resume</span>
            )}
            
            {app.cover_letter && (
              <span className="relative group/tooltip inline-block">
                <button
                  onClick={() => setIsLetterOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 text-muted-foreground hover:bg-muted/80 rounded-[4px] text-xs font-semibold border border-border/80 transition-colors shadow-sm"
                  title="View Cover Letter"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Letter
                </button>
                {/* Tooltip containing cover letter preview */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover text-popover-foreground text-xs rounded border border-border shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                  <span className="block font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cover Letter Preview</span>
                  <span className="block line-clamp-3 italic text-foreground/90">"{app.cover_letter}"</span>
                  <span className="block text-[10px] text-blue-500 mt-1.5 font-medium">Click button to read full letter</span>
                </span>
              </span>
            )}
          </div>
        </td>

        {/* Status Dropdown */}
        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
          <div className="relative inline-block w-36">
            <select
              value={app.status}
              disabled={isUpdatePending}
              onChange={(e) => onUpdateStatus(app.id, e.target.value)}
              data-agent={`application-status-select-${app.id}`}
              className={cn(
                "w-full appearance-none pl-7 pr-8 py-1 rounded-[4px] text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all",
                getStatusColor(app.status)
              )}
            >
              <option value="PENDING" className="bg-background text-foreground text-xs">Pending</option>
              <option value="REVIEWED" className="bg-background text-foreground text-xs">Reviewed</option>
              <option value="SHORTLISTED" className="bg-background text-foreground text-xs">Shortlisted</option>
              <option value="INTERVIEW" className="bg-background text-foreground text-xs">Interview</option>
              <option value="ONBOARDED" className="bg-background text-foreground text-xs">Onboarded</option>
              <option value="REJECTED" className="bg-background text-foreground text-xs">Rejected</option>
            </select>
            {/* The status dot */}
            <div className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none", statusDotColors[app.status])} />
            {/* The dropdown arrow */}
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current pointer-events-none opacity-60" />
          </div>
          {/* Hidden buttons for agent automation compatibility */}
          <div className="hidden" aria-hidden="true">
            {(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED'] as ApplicationStatus[]).map(s => (
              <button
                key={s}
                data-agent={`mark-status-${s.toLowerCase()}`}
                onClick={() => onUpdateStatus(app.id, s)}
              />
            ))}
          </div>
        </td>

        {/* Quick actions */}
        <td className="pl-4 pr-6 py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onContact(app, true)}
              data-agent="contact-email-button"
              className="p-2 rounded-[4px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
              title="Send Email"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={() => onContact(app, false)}
              data-agent="contact-message-button"
              className="p-2 rounded-[4px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
              title="Send Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border mx-1" />

            {app.status === 'PENDING' && (
              <>
                <button
                  onClick={() => onUpdateStatus(app.id, 'REVIEWED')}
                  data-agent="mark-reviewed"
                  className="p-2 rounded-[4px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
                  title="Mark as Reviewed"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                  data-agent="mark-shortlisted"
                  className="p-2 rounded-[4px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                  title="Accept"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                  data-agent="mark-rejected"
                  className="p-2 rounded-[4px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {app.status === 'REVIEWED' && (
              <>
                <button
                  onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                  data-agent="mark-shortlisted"
                  className="p-2 rounded-[4px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                  title="Accept"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateStatus(app.id, 'REJECTED')}
                  data-agent="mark-rejected"
                  className="p-2 rounded-[4px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Cover Letter Modal overlay */}
      {isLetterOpen && (
        <tr className="h-0">
          <td colSpan={6} className="p-0 border-0 h-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-card border border-border rounded-[4px] max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cover Letter</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Submitted by {app.applicant.first_name} {app.applicant.last_name} ({app.applicant.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLetterOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-[4px] p-4 text-sm text-foreground/90 leading-relaxed max-h-[60vh] overflow-y-auto italic font-medium whitespace-pre-wrap">
                  {app.cover_letter}
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setIsLetterOpen(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] text-xs font-semibold shadow-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

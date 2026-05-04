'use client';

import { User as UserIcon, Mail, Clock, BrainCircuit, Eye, CheckCircle, XCircle, ChevronDown, FileText, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobApplication, ApplicationStatus } from '@/types/jobs.types';

interface ApplicationCardProps {
  app: JobApplication;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateStatus: (appId: string, status: string) => void;
  onContact: (applicant: any, sendEmail: boolean) => void;
  isUpdatePending: boolean;
}

export function ApplicationCard({
  app,
  isExpanded,
  onToggleExpand,
  onUpdateStatus,
  onContact,
  isUpdatePending
}: ApplicationCardProps) {
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
      HIRED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return map[status];
  };

  return (
    <div id={app.id} className={cn("bg-card border rounded-sm overflow-hidden transition-all", isExpanded ? "border-teal-500/30" : "border-border hover:border-teal-500/20")}>
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
          {app.applicant.profile_image_url ? (
            <img src={app.applicant.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 text-teal-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-sm font-semibold text-foreground">
              {app.applicant.first_name} {app.applicant.last_name}
            </h4>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", getStatusColor(app.status))}>
              {app.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {app.applicant.email}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(app.applied_at).toLocaleDateString()}
            </span>
            {app.ai_score !== null && app.ai_score !== undefined && (
              <span className={cn("flex items-center gap-1 font-bold", getAIScoreColor(app.ai_score))}>
                <BrainCircuit className="w-3 h-3" /> Match: {app.ai_score}%
              </span>
            )}
          </div>
        </div>

        {/* Quick status actions + chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          {app.status === 'PENDING' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'REVIEWED'); }} className="p-2 rounded-sm bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all" title="Mark as Reviewed"><Eye className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'SHORTLISTED'); }} className="p-2 rounded-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all" title="Shortlist"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'REJECTED'); }} className="p-2 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title="Reject"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          {app.status === 'REVIEWED' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'SHORTLISTED'); }} className="p-2 rounded-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all" title="Shortlist"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'REJECTED'); }} className="p-2 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title="Reject"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          {app.status === 'SHORTLISTED' && (
            <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'HIRED'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-all"><CheckCircle className="w-3.5 h-3.5" /> Hire</button>
          )}
          {app.status === 'HIRED' && (
            <div className="flex items-center gap-2">
               <button onClick={(e) => { e.stopPropagation(); onContact(app.applicant, true); }} className="p-2 rounded-sm bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all" title="Send Email"><Mail className="w-4 h-4" /></button>
               <button onClick={(e) => { e.stopPropagation(); onContact(app.applicant, false); }} className="p-2 rounded-sm bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all" title="Send Message"><MessageSquare className="w-4 h-4" /></button>
            </div>
          )}
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform ml-2", isExpanded && "rotate-180")} />
        </div>
      </div>

      {/* Inline Expandable Dropdown */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/5 p-5 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Status + Resume */}
            <div className="space-y-5">
              {/* Status Changer */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Change Status</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(['PENDING', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'] as ApplicationStatus[]).map(s => (
                    <button
                      key={s}
                      disabled={app.status === s || isUpdatePending}
                      onClick={() => onUpdateStatus(app.id, s)}
                      className={cn(
                        "px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase border transition-all",
                        app.status === s
                          ? cn(getStatusColor(s), "ring-2 ring-offset-1 ring-offset-background")
                          : "bg-muted/30 text-muted-foreground border-border hover:opacity-80 disabled:opacity-30"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Resume</h4>
                {app.resume_url ? (
                  <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="border border-border rounded-sm p-3 bg-muted/20 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
                    <div className="w-9 h-9 rounded-sm bg-teal-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">View Resume</p>
                      <p className="text-[10px] text-muted-foreground truncate">{app.resume_url.split('/').pop() || 'Document'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-600 transition-colors" />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No resume provided.</p>
                )}
              </div>

              {/* Cover Letter */}
              {app.cover_letter && (
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Cover Letter</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed p-3 bg-muted/10 border border-border/50 rounded-sm italic line-clamp-4">
                    {app.cover_letter}
                  </p>
                </div>
              )}
            </div>

            {/* Right column: AI Analysis + Actions */}
            <div className="space-y-5">
              {/* AI Analysis */}
              {app.ai_score !== null && app.ai_score !== undefined ? (
                <div className="p-4 rounded-sm bg-violet-600/5 border border-violet-600/10 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-sm bg-violet-600 text-white"><BrainCircuit className="w-3.5 h-3.5" /></div>
                    <h4 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">AI Evaluation</h4>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className={cn("text-3xl font-black leading-none", getAIScoreColor(app.ai_score))}>{app.ai_score}</span>
                    <span className="text-[10px] font-bold text-violet-600/60 uppercase pb-0.5">Match</span>
                  </div>
                  {app.ai_analysis && (
                    <p className="text-[11px] text-foreground/70 leading-relaxed italic border-l-2 border-violet-600/20 pl-3 line-clamp-4">
                      {app.ai_analysis}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-sm bg-muted/20 border border-border/50 flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground italic">Not yet screened by AI</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onContact(app.applicant, true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-sm hover:bg-teal-700 transition-all active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" /> Message
                </button>
                <button
                  disabled={app.status === 'SHORTLISTED' || isUpdatePending}
                  onClick={() => onUpdateStatus(app.id, 'SHORTLISTED')}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-foreground text-background text-xs font-bold rounded-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Shortlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

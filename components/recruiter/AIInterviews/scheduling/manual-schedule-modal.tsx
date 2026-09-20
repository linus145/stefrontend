'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import {CalendarDays,X,CheckCircle2,Copy,Check,Mail,User,Briefcase,ChevronDown,BrainCircuit,Code,Users2,Layers,ClipboardCheck,RefreshCw,Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PhoneInput } from '@/components/ui/phone-input';

export interface ManualScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualScheduleModal({ isOpen, onClose, onSuccess }: ManualScheduleModalProps) {
  const { data: jobsResponse } = useQuery({
    queryKey: ['company-jobs-for-manual-interview'],
    queryFn: () => jobsService.getMyJobs(),
    enabled: isOpen,
  });

  const jobs: any[] = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [roundType, setRoundType] = useState<'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN'>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'>('MID');
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [maxQuestions, setMaxQuestions] = useState<number>(5);
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [notes, setNotes] = useState('');
  const [scheduledResult, setScheduledResult] = useState<any | null>(null);
  const [hasCopiedCreds, setHasCopiedCreds] = useState(false);

  // Set default job if available and none selected
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    } else if (jobs.length === 0 && !selectedJobId) {
      setSelectedJobId('custom');
    }
  }, [jobs, selectedJobId]);

  const scheduleMutation = useMutation({
    mutationFn: (payload: any) => aiInterviewsService.scheduleManualInterview(payload),
    onSuccess: (res: any) => {
      const data = res?.data || res;
      setScheduledResult(data);
      onSuccess();
      toast.success('Interview scheduled successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to schedule interview';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      toast.error('Please enter candidate name');
      return;
    }
    if (!candidateEmail.trim() || !candidateEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (selectedJobId === 'custom' && !customJobTitle.trim()) {
      toast.error('Please enter custom job title');
      return;
    }
    if (!selectedJobId && !customJobTitle.trim()) {
      toast.error('Please select or specify a job role');
      return;
    }

    const payload = {
      candidate_name: candidateName.trim(),
      candidate_email: candidateEmail.trim(),
      candidate_phone: candidatePhone.trim() || undefined,
      job_id: selectedJobId !== 'custom' ? selectedJobId : undefined,
      custom_job_title: selectedJobId === 'custom' ? customJobTitle.trim() : undefined,
      rounds: [
        {
          type: roundType,
          title:
            roundType === 'TECHNICAL' ? 'Technical Screening' :
            roundType === 'CODING' ? 'Live Coding Assessment' :
            roundType === 'HR' ? 'Cultural Alignment' :
            roundType === 'SYSTEM_DESIGN' ? 'System Architecture' : 'Behavioral Situations',
          difficulty,
          timer_minutes: timerMinutes,
          max_questions: maxQuestions,
          round_category: roundType === 'CODING' ? 'CODING' : 'NON_CODING',
          question_format: roundType === 'CODING' ? 'CODE' : 'TEXT',
        }
      ],
      send_invite_email: sendInviteEmail,
      notes: notes.trim() || undefined,
    };

    scheduleMutation.mutate(payload);
  };

  const handleClose = () => {
    setScheduledResult(null);
    setCandidateName('');
    setCandidateEmail('');
    setCandidatePhone('');
    setCustomJobTitle('');
    setNotes('');
    setHasCopiedCreds(false);
    onClose();
  };

  const copyFullInvite = () => {
    if (!scheduledResult) return;
    const creds = scheduledResult.exam_credentials || {};
    const text = `Hi ${scheduledResult.candidate_name},

You have been invited to complete an AI Interview assessment for the role: ${scheduledResult.job_title}.

Exam Portal: ${scheduledResult.exam_url}
Username: ${creds.username}
Password: ${creds.password}

Please log in using these credentials to complete your interview. Good luck!`;
    navigator.clipboard.writeText(text);
    setHasCopiedCreds(true);
    toast.success('Invitation text copied to clipboard!');
    setTimeout(() => setHasCopiedCreds(false), 3000);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-3 bg-transparent">
      {/* Perfect rectangular popup with crisp corners - background is unblurred and fully accessible */}
      <div className="pointer-events-auto relative w-full max-w-[560px] h-[460px] max-h-[82vh] bg-card border border-border rounded-[2px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[2px] bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center shrink-0 border border-[#0a66c2]/20">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold tracking-tight text-foreground">Schedule AI Interview</h3>
                <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/20">
                  Manual Entry
                </span>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-none mt-0.5">
                Direct candidate registration & assessment orchestration.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-[2px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {scheduledResult ? (
          /* Success Screen */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:thin]">
            <div className="text-center py-1">
              <div className="w-9 h-9 rounded-[2px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-[14px] font-bold text-foreground">Interview Successfully Scheduled!</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Candidate <span className="font-semibold text-foreground">{scheduledResult.candidate_name}</span> is registered for <span className="font-semibold text-foreground">{scheduledResult.job_title}</span>.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-muted/30 border border-border rounded-[2px] p-3 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exam Credentials</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              </div>

              {/* Exam URL */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-muted-foreground">Portal URL</label>
                <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-[2px] px-2.5 py-1.5">
                  <span className="text-[11px] font-mono truncate text-foreground">{scheduledResult.exam_url}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scheduledResult.exam_url);
                      toast.success('Exam URL copied');
                    }}
                    className="p-1 rounded-[2px] text-muted-foreground hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 transition-all shrink-0"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground">Username</label>
                  <div className="flex items-center justify-between gap-1 bg-background border border-border rounded-[2px] px-2.5 py-1.5">
                    <span className="text-[11px] font-mono font-bold text-foreground truncate">
                      {scheduledResult.exam_credentials?.username}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scheduledResult.exam_credentials?.username || '');
                        toast.success('Username copied');
                      }}
                      className="p-1 rounded-[2px] text-muted-foreground hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 transition-all shrink-0"
                      title="Copy Username"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground">Password</label>
                  <div className="flex items-center justify-between gap-1 bg-background border border-border rounded-[2px] px-2.5 py-1.5">
                    <span className="text-[11px] font-mono font-bold text-foreground truncate">
                      {scheduledResult.exam_credentials?.password}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scheduledResult.exam_credentials?.password || '');
                        toast.success('Password copied');
                      }}
                      className="p-1 rounded-[2px] text-muted-foreground hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 transition-all shrink-0"
                      title="Copy Password"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Status */}
              <div>
                {scheduledResult.invite_sent ? (
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" />
                    Invitation email dispatched to {scheduledResult.candidate_email}.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground/60" />
                    Email notification skipped. Send credentials directly to candidate.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              <button
                onClick={copyFullInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-border bg-card text-[11px] font-bold hover:bg-muted transition-all active:scale-95"
              >
                {hasCopiedCreds ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#0a66c2]" />
                    <span>Copy Full Invitation</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className="px-4 py-1.5 rounded-[2px] bg-[#0a66c2] text-white text-[11px] font-bold hover:bg-[#004182] transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen: Compact & Scrollable */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5 space-y-3.5 text-[12px] [scrollbar-width:thin]">
              {/* Candidate Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <User className="w-3 h-3 text-[#0a66c2]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Information
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      required
                      className="w-full bg-background border border-border rounded-[2px] h-7 px-2 text-[12px] font-medium focus:outline-none focus:border-[#0a66c2]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sarah.j@example.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      required
                      className="w-full bg-background border border-border rounded-[2px] h-7 px-2 text-[12px] font-medium focus:outline-none focus:border-[#0a66c2]"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Phone Number <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <PhoneInput
                      value={candidatePhone}
                      onChange={(val) => setCandidatePhone(val)}
                      defaultCountry="IN"
                      placeholder="98765 43210"
                      className="[&>div:first-child]:h-7 [&>div:first-child]:rounded-[2px] [&>div:first-child_button]:rounded-l-[2px] [&>div:first-child_button]:text-[11px] [&>div:first-child_input]:text-[12px] [&>div:first-child_input]:pl-2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Target Job Role */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <Briefcase className="w-3 h-3 text-[#0a66c2]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Target Role
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Job Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full bg-background border border-border rounded-[2px] h-7 pl-2 pr-7 text-[12px] font-medium focus:outline-none focus:border-[#0a66c2] appearance-none cursor-pointer"
                    >
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} {j.department ? `(${j.department})` : ''}
                        </option>
                      ))}
                      <option value="custom">+ Enter Custom Job Role...</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>

                  {selectedJobId === 'custom' && (
                    <div className="pt-1 animate-in fade-in duration-150">
                      <input
                        type="text"
                        placeholder="Type custom role (e.g. Senior Frontend Architect)..."
                        value={customJobTitle}
                        onChange={(e) => setCustomJobTitle(e.target.value)}
                        required={selectedJobId === 'custom'}
                        className="w-full bg-background border border-border rounded-[2px] h-7 px-2 text-[12px] font-medium focus:outline-none focus:border-[#0a66c2]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Configuration */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 pb-1 border-b border-border/60">
                  <BrainCircuit className="w-3 h-3 text-[#0a66c2]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Assessment Setup & Strategy
                  </span>
                </div>

                {/* Strategy Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Strategy Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      { id: 'TECHNICAL', label: 'Technical Screening', icon: BrainCircuit },
                      { id: 'CODING', label: 'Live Coding Assessment', icon: Code },
                      { id: 'HR', label: 'Cultural Alignment', icon: Users2 },
                      { id: 'SYSTEM_DESIGN', label: 'System Design', icon: Layers },
                      { id: 'BEHAVIORAL', label: 'Behavioral Situations', icon: ClipboardCheck },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = roundType === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setRoundType(item.id as any)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-[2px] border text-left cursor-pointer transition-all flex items-center justify-between gap-2 select-none",
                            isSelected
                              ? "border-[#0a66c2] bg-[#0a66c2]/10 text-foreground font-bold"
                              : "border-border hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-[#0a66c2]" : "text-muted-foreground")} />
                            <span className="text-[11px] truncate">{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-[#0a66c2] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty, Duration, Questions */}
                <div className="space-y-2 pt-1">
                  {/* Difficulty */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Difficulty Level</label>
                    <div className="grid grid-cols-4 gap-1 bg-muted/40 p-0.5 rounded-[2px] border border-border">
                      {(['ENTRY', 'MID', 'SENIOR', 'LEAD'] as const).map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            "py-1 text-[10px] font-bold rounded-[2px] transition-all text-center",
                            difficulty === d
                              ? "bg-background text-[#0a66c2] shadow-xs border border-border/60"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Questions in 2 cols */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Duration</label>
                      <div className="grid grid-cols-4 gap-1 bg-muted/40 p-0.5 rounded-[2px] border border-border">
                        {([15, 30, 45, 60] as const).map((mins) => (
                          <button
                            type="button"
                            key={mins}
                            onClick={() => setTimerMinutes(mins)}
                            className={cn(
                              "py-1 text-[10px] font-bold rounded-[2px] transition-all text-center",
                              timerMinutes === mins
                                ? "bg-background text-[#0a66c2] shadow-xs border border-border/60"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Question Pool</label>
                      <div className="grid grid-cols-3 gap-1 bg-muted/40 p-0.5 rounded-[2px] border border-border">
                        {([3, 5, 10] as const).map((cnt) => (
                          <button
                            type="button"
                            key={cnt}
                            onClick={() => setMaxQuestions(cnt)}
                            className={cn(
                              "py-1 text-[10px] font-bold rounded-[2px] transition-all text-center",
                              maxQuestions === cnt
                                ? "bg-background text-[#0a66c2] shadow-xs border border-border/60"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Notes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-[2px] border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendInviteEmail}
                    onChange={(e) => setSendInviteEmail(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[2px] text-[#0a66c2] accent-[#0a66c2]"
                  />
                  <span className="text-[11px] font-semibold text-foreground">
                    Email exam link & credentials to candidate immediately
                  </span>
                </label>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Interview Notes <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Candidate focus areas or special instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-background border border-border rounded-[2px] p-2 text-[11px] font-medium focus:outline-none focus:border-[#0a66c2] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 shrink-0">
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Credentials ready instantly.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={scheduleMutation.isPending}
                  className="px-3 py-1.5 rounded-[2px] border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-[2px] bg-[#0a66c2] text-white text-[11px] font-bold hover:bg-[#004182] shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Orchestrating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Schedule & Generate Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { X, User as UserIcon, MessageSquare, Mail, Loader2, Send } from 'lucide-react';
import { JobApplication } from '@/types/jobs.types';

interface ContactModalProps {
  selectedApplicant: JobApplication['applicant'] | null;
  message: string;
  setMessage: (val: string) => void;
  sendEmail: boolean;
  setSendEmail: (val: boolean) => void;
  onClose: () => void;
  onSend: () => void;
  isPending: boolean;
}

export function ContactModal({
  selectedApplicant,
  message,
  setMessage,
  sendEmail,
  setSendEmail,
  onClose,
  onSend,
  isPending
}: ContactModalProps) {
  if (!selectedApplicant) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 ring-4 ring-teal-500/5">
               <UserIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Connect with {selectedApplicant.first_name}</h2>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] font-bold mt-0.5">{selectedApplicant.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-px bg-border/50 mx-6" />

        <div className="p-6 pt-5 space-y-6">
          {/* Message Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
               <MessageSquare className="w-3 h-3" /> Professional Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${selectedApplicant.first_name}, congratulations on getting hired! I'd like to discuss the next steps...`}
              className="w-full min-h-[160px] rounded-md bg-muted/30 border border-border p-5 text-sm text-foreground focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none resize-none transition-all placeholder:text-muted-foreground/40 font-medium leading-relaxed"
            />
          </div>

          {/* Notification Checkbox */}
          <div 
            className="flex items-center gap-3 p-4 rounded-md bg-teal-500/5 border border-teal-500/10 group cursor-pointer hover:bg-teal-500/[0.08] transition-colors" 
            onClick={() => setSendEmail(!sendEmail)}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="sendEmailApp"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="peer w-5 h-5 rounded-sm border-border text-teal-500 focus:ring-teal-500/50 bg-background cursor-pointer appearance-none border-2 checked:bg-teal-500 checked:border-teal-500 transition-all"
              />
              <div className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path d="M5 13l4 4L19 7" />
                 </svg>
              </div>
            </div>
            <label htmlFor="sendEmailApp" className="text-[13px] font-semibold text-foreground/70 group-hover:text-foreground cursor-pointer flex items-center gap-2 select-none transition-colors">
              <Mail className="w-4 h-4 text-teal-600/70 dark:text-teal-400/70" /> Send automated email notification
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-2 flex justify-end items-center gap-6">
          <button
            onClick={onClose}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            disabled={!message.trim() || isPending}
            onClick={onSend}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3 rounded-md bg-teal-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_8px_20px_-6px_rgba(20,184,166,0.3)] overflow-hidden"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> 
                <span>Send Outreach</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

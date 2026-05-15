import { User } from '@/types/user.types';
import { User as UserIcon, X, MessageSquare, Mail, Loader2, Send } from 'lucide-react';
import React, { useEffect } from 'react';
import { AgentUIController } from '@/agent/ui/AgentUIController';

interface ContactModalProps {
  selectedUser: User;
  setSelectedUser: (user: User | null) => void;
  message: string;
  setMessage: (val: string) => void;
  sendEmail: boolean;
  setSendEmail: (val: boolean) => void;
  handleContact: () => void;
  isPending: boolean;
}

export function ContactModal({
  selectedUser, setSelectedUser,
  message, setMessage,
  sendEmail, setSendEmail,
  handleContact, isPending
}: ContactModalProps) {
  // Sync visibility with AgentUIController
  useEffect(() => {
    AgentUIController.getInstance().setExternalPanelOpen(true);
    return () => {
      AgentUIController.getInstance().setExternalPanelOpen(false);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-background/20 backdrop-blur-sm sm:hidden" onClick={() => setSelectedUser(null)} />
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-[340px] bg-background border-l border-border shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(0,0,0,0.2)] z-[100] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 ring-4 ring-blue-500/5">
              <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Connect with {selectedUser.first_name}</h2>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em] font-bold mt-0.5">{selectedUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
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
              placeholder={`Hi ${selectedUser.first_name}, I'd like to discuss a potential opportunity...`}
              className="w-full min-h-[160px] rounded-md bg-muted/30 border border-border p-5 text-sm text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none resize-none transition-all placeholder:text-muted-foreground/40 font-medium leading-relaxed"
            />
          </div>

          {/* Notification Checkbox */}
          <div
            className="flex items-center gap-3 p-4 rounded-md bg-blue-500/5 border border-blue-500/10 group cursor-pointer hover:bg-blue-500/[0.08] transition-colors"
            onClick={() => setSendEmail(!sendEmail)}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="peer w-5 h-5 rounded-sm border-border text-blue-500 focus:ring-blue-500/50 bg-background cursor-pointer appearance-none border-2 checked:bg-blue-500 checked:border-blue-500 transition-all"
              />
              <div className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <label htmlFor="sendEmail" className="text-[13px] font-semibold text-foreground/70 group-hover:text-foreground cursor-pointer flex items-center gap-2 select-none transition-colors">
              <Mail className="w-4 h-4 text-blue-600/70 dark:text-blue-400/70" /> Send automated email notification
            </label>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 pt-4 flex justify-end items-center gap-4 shrink-0 border-t border-border/50 bg-background mt-auto">
          <button
            onClick={() => setSelectedUser(null)}
            className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!message.trim() || isPending}
            onClick={handleContact}
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-sky-500 text-white text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

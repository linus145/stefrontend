import { User } from '@/types/user.types';
import { Users, X, MessageSquare, Loader2, Send } from 'lucide-react';
import React from 'react';

interface BulkContactModalProps {
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
  message: string;
  setMessage: (val: string) => void;
  handleBulkContact: () => void;
  isPending: boolean;
}

export function BulkContactModal({
  selectedUsers, setSelectedUsers,
  message, setMessage,
  handleBulkContact, isPending
}: BulkContactModalProps) {
  return (
    <>
      {/* Backdrop overlay for mobile, optional but good for focus */}
      <div className="fixed inset-0 z-[90] bg-background/20 backdrop-blur-sm sm:hidden" onClick={() => setSelectedUsers([])} />
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-[340px] bg-background border-l border-border shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(0,0,0,0.2)] z-[100] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 ring-4 ring-blue-500/5">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Bulk Connect</h2>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em] font-bold mt-0.5">
                {selectedUsers.length} Users Selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedUsers([])}
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
              placeholder="Type your message here..."
              className="w-full min-h-[160px] rounded-md bg-muted/30 border border-border p-5 text-sm text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none resize-none transition-all placeholder:text-muted-foreground/40 font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 pt-4 flex justify-end items-center gap-4 shrink-0 border-t border-border/50 bg-background mt-auto">
          <button
            onClick={() => setSelectedUsers([])}
            className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!message.trim() || isPending}
            onClick={handleBulkContact}
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

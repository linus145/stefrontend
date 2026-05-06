import { User } from '@/types/user.types';
import { Mail, Briefcase, User as UserIcon, MessageSquare, X } from 'lucide-react';
import React from 'react';

interface TalentPipelineProps {
  pipelineResponse: any;
  updateStatusMutation: any;
  unsaveFromPipelineMutation: any;
  setSelectedUser: (user: User) => void;
  setSendEmail: (val: boolean) => void;
}

export function TalentPipeline({
  pipelineResponse,
  updateStatusMutation,
  unsaveFromPipelineMutation,
  setSelectedUser,
  setSendEmail
}: TalentPipelineProps) {
  if (!pipelineResponse?.data || pipelineResponse.data.length === 0) {
    return (
      <div className="text-center py-24 bg-muted/5 rounded-sm border border-dashed border-border">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Empty Pipeline</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">You haven't saved any talents to your pipeline yet. Start by saving talents from the discovery tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(pipelineResponse.data as any[]).map((entry) => (
          <div
            key={entry.id}
            className="bg-card border border-border rounded-sm p-4 hover:border-blue-500/30 transition-colors group flex flex-nowrap items-center gap-4 lg:gap-6"
          >
            <div className="flex items-center gap-4 flex-[1.5] min-w-0">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                {entry.talent.profile_image_url ? (
                  <img src={entry.talent.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-foreground truncate">
                  {entry.talent.first_name} {entry.talent.last_name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{entry.talent.headline}</p>
              </div>
            </div>

            <div className="flex-[2] flex flex-nowrap items-center gap-4 sm:gap-6 min-w-0">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Saved On</span>
                <span className="text-xs font-medium text-foreground">
                  {new Date(entry.added_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 shrink-0 ml-auto pl-4 lg:pl-6 border-l border-border/50 justify-end">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/50">Update Stage</span>
                <select
                  className="bg-muted/10 border border-border text-[10px] font-bold rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/30 w-36 uppercase tracking-wider cursor-pointer hover:bg-muted/20 transition-all"
                  value={entry.status}
                  onChange={(e) => updateStatusMutation.mutate({
                    id: entry.id,
                    status: e.target.value
                  })}
                >
                  <option value="LEAD">Lead</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="REPLIED">Replied</option>
                  <option value="PHONE_SCREEN">Phone Screen</option>
                  <option value="FASE_FINAL">Fase Final</option>
                  <option value="OFFER_EXTENDED">Offer Extended</option>
                  <option value="OFFER_ACCEPTED">Offer Accepted</option>
                  <option value="OFFER_REJECTED">Offer Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative group/btn flex">
                  <button
                    onClick={() => unsaveFromPipelineMutation.mutate(entry.id)}
                    className="p-2 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors border border-transparent"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    Remove from Pipeline
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                  </span>
                </div>
                <div className="relative group/btn flex">
                  <button
                    onClick={() => { setSelectedUser(entry.talent); setSendEmail(true); }}
                    className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    Send Email
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                  </span>
                </div>
                <div className="relative group/btn flex">
                  <button
                    onClick={() => { setSelectedUser(entry.talent); setSendEmail(false); }}
                    className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    Send Message
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                  </span>
                </div>
              </div>
            </div>
          </div>
      ))}
    </div>
  );
}

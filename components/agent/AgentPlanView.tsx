import React from 'react';
import { cn } from '@/lib/utils';

export interface AgentPlanViewProps {
  planMessages: Array<{ id: string; sender: 'bot' | 'user'; text: string }>;
  isPlanBotTyping: boolean;
  planScrollRef: React.RefObject<HTMLDivElement | null>;
}

export const AgentPlanView: React.FC<AgentPlanViewProps> = ({
  planMessages,
  isPlanBotTyping,
  planScrollRef
}) => {
  return (
    <div className="h-[280px] bg-card rounded-sm border border-border flex flex-col overflow-hidden shadow-sm shrink-0 animate-in fade-in duration-300">
      <div className="px-3 py-2 border-b border-border bg-muted/60 flex justify-between items-center shrink-0">
        <span className="text-[11px] font-bold text-foreground/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Strategy Planning Feed
        </span>
      </div>
      
      <div ref={planScrollRef} className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin scrollbar-thumb-border">
        {planMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex flex-col max-w-[85%] rounded-sm p-2 text-[10px] leading-relaxed border animate-in fade-in duration-200",
              msg.sender === 'user'
                ? "ml-auto bg-blue-600/10 border-blue-600/20 text-blue-600"
                : "mr-auto bg-muted/50 border-border/40 text-foreground"
            )}
          >
            <span className="font-bold text-[8px] uppercase tracking-wider mb-0.5 opacity-60">
              {msg.sender === 'user' ? 'Recruiter' : 'Conversational AI'}
            </span>
            <span className="whitespace-pre-wrap">{msg.text}</span>
          </div>
        ))}
        {isPlanBotTyping && (
          <div className="flex gap-2 mr-auto items-center animate-pulse text-[10px] text-foreground/50 bg-muted/30 border border-border/20 p-2 rounded-sm max-w-[80%]">
            <svg className="animate-spin h-3.5 w-3.5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Formulating plan strategy...</span>
          </div>
        )}
      </div>
    </div>
  );
};

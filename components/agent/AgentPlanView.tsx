import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, User } from 'lucide-react';

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
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/90 border-b border-border/40 pb-2">
        <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-500 animate-pulse" />
        Strategy Planning Feed
      </div>
      
      <div className="space-y-3.5">
        {planMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-3 items-start animate-in fade-in duration-200",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender !== 'user' && (
              <div className="w-7 h-7 rounded-[3px] bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-500/20">
                <Brain className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col max-w-[85%]">
              <div 
                className={cn(
                  "px-3 py-2 rounded-[4px] text-[10px] leading-relaxed shadow-sm border",
                  msg.sender === 'user'
                    ? "bg-sky-100 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 border-sky-200/50 dark:border-sky-800/30"
                    : "bg-card border-border text-foreground"
                )}
              >
                <span className="whitespace-pre-wrap">{msg.text}</span>
              </div>
              <span className={cn(
                "text-[9px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider",
                msg.sender === 'user' ? "text-right" : "text-left"
              )}>
                {msg.sender === 'user' ? 'Recruiter' : 'Conversational AI'}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-[3px] bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 shadow-sm border border-blue-200">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        
        {isPlanBotTyping && (
          <div className="flex gap-3 justify-start items-start animate-pulse">
            <div className="w-7 h-7 rounded-[3px] bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-500/20">
              <svg className="animate-spin h-3.5 w-3.5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            <div className="flex flex-col max-w-[80%]">
              <div className="px-3 py-2 bg-muted/30 border border-border/20 rounded-[4px] text-[10px] text-foreground/60 leading-relaxed shadow-sm">
                Formulating plan strategy...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

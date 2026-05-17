import React from 'react';
import { cn } from '@/lib/utils';

export interface AgentHistoryViewProps {
  planMessages: Array<{ id: string; sender: 'bot' | 'user'; text: string }>;
  executionHistory: any[];
  onClearChatHistory: () => Promise<void>;
  onDeleteExecution: (id: string) => Promise<void>;
  onClose: () => void;
}

export const AgentHistoryView: React.FC<AgentHistoryViewProps> = ({
  planMessages,
  executionHistory,
  onClearChatHistory,
  onDeleteExecution,
  onClose
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Agent Execution & Chat History
        </span>
        <button 
          onClick={onClose}
          className="text-[9px] font-bold text-blue-500 hover:underline"
        >
          Back to Panel
        </button>
      </div>

      {/* Conversational AI Chat History */}
      <div className="bg-card border border-border p-3 rounded-sm space-y-3 shadow-sm">
        <div className="flex justify-between items-center text-[9px] font-extrabold text-foreground/80 uppercase tracking-wider">
          <span>Conversational AI Logs</span>
          <span className="text-[8px] opacity-70 bg-muted px-1.5 py-0.5 rounded-sm">
            {planMessages.length <= 1 ? 'Empty' : `${planMessages.length - 1} message(s)`}
          </span>
        </div>
        
        {/* Chat Logs List */}
        {planMessages.length > 1 ? (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
            {planMessages.slice(1).map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "p-2 rounded-sm text-[8px] leading-relaxed border",
                  msg.sender === 'user' 
                    ? "bg-muted/10 border-border/40 text-foreground/80 font-medium" 
                    : "bg-blue-600/5 border-blue-500/10 text-foreground/95"
                )}
              >
                <div className="flex justify-between items-center mb-1 text-[7px] font-bold uppercase tracking-wider">
                  <span className={cn(msg.sender === 'user' ? "text-muted-foreground" : "text-blue-500")}>
                    {msg.sender === 'user' ? '👤 User' : '🤖 Conversational AI'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[8px] text-muted-foreground leading-normal">
            No conversational recommendations recorded. Ask me anything to generate planning strategy!
          </p>
        )}
        
        {planMessages.length > 1 && (
          <button
            onClick={onClearChatHistory}
            className="w-full px-2.5 py-1.5 bg-red-600/10 text-red-500 border border-red-500/15 hover:bg-red-600 hover:text-white rounded-sm text-[9px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Clear Chat History Logs
          </button>
        )}
      </div>

      {/* Autonomous Executions List */}
      <div className="space-y-2 flex-1 flex flex-col">
        <span className="text-[9px] font-extrabold text-foreground/80 uppercase tracking-wider block">
          Autonomous Runs History
        </span>
        
        <div className="space-y-2">
          {executionHistory.length === 0 ? (
            <div className="text-[9px] text-foreground/40 italic py-4 text-center border border-dashed border-border rounded-sm bg-muted/10">
              No execution runs recorded yet.
            </div>
          ) : (
            executionHistory.slice(0, 8).map((exec) => (
              <div key={exec.id} className="p-2.5 border border-border rounded-sm bg-card hover:bg-muted/10 transition-all text-[9px] space-y-1.5 shadow-sm animate-in fade-in duration-300 group relative">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-foreground/75 text-[8px]">
                    RUN #{exec.id.substring(0, 8).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-sm text-[7px] font-bold uppercase border",
                      exec.status === 'success' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
                      exec.status === 'failed' && "bg-red-500/10 text-red-600 border-red-500/15",
                      exec.status === 'running' && "bg-blue-500/10 text-blue-600 border-blue-500/15",
                      exec.status === 'pending' && "bg-muted text-foreground/70 border-border"
                    )}>
                      {exec.status}
                    </span>
                    <button
                      onClick={() => onDeleteExecution(exec.id)}
                      className="p-1 hover:bg-red-600/10 text-foreground/40 hover:text-red-500 rounded-sm transition-colors border border-border shadow-sm flex items-center justify-center shrink-0"
                      title="Delete this execution run"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-foreground/50 text-[7px]">
                  <span>{new Date(exec.started_at).toLocaleString([], { hour12: false, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {exec.execution_time && (
                    <span className="font-semibold text-foreground/75">Duration: {Math.round(exec.execution_time)}s</span>
                  )}
                </div>
                {exec.metadata && exec.metadata.goal && (
                  <div className="text-[8px] text-foreground/70 font-semibold bg-muted/20 px-1.5 py-1 rounded-sm border border-border/20 leading-relaxed">
                    <span className="text-blue-500 font-extrabold uppercase text-[6.5px] block mb-0.5 tracking-wider">Goal</span>
                    {exec.metadata.goal}
                  </div>
                )}
                {exec.actions_performed && exec.actions_performed.length > 0 && (
                  <div className="pt-1.5 border-t border-border/40 text-[7px] text-foreground/60">
                    <span className="font-bold">Steps performed:</span> {exec.actions_performed.length} action(s)
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

export interface AgentHistoryViewProps {
  planMessages: Array<{ id: string; sender: 'bot' | 'user'; text: string; timestamp?: number; conversation_id?: string }>;
  executionHistory: any[];
  onClearChatHistory: () => Promise<void>;
  onDeleteExecution: (id: string) => Promise<void>;
  onClose: () => void;
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  defaultSubTab?: 'ACT' | 'PLAN';
}

export const AgentHistoryView: React.FC<AgentHistoryViewProps> = ({
  planMessages,
  executionHistory,
  onClearChatHistory,
  onDeleteExecution,
  onClose,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  defaultSubTab
}) => {
  const [subTab, setSubTab] = React.useState<'RUNS' | 'CHATS'>(
    defaultSubTab === 'PLAN' ? 'CHATS' : 'RUNS'
  );

  React.useEffect(() => {
    setSubTab(defaultSubTab === 'PLAN' ? 'CHATS' : 'RUNS');
  }, [defaultSubTab]);

  // Group plan messages by conversation_id (excluding init message)
  const conversations = React.useMemo(() => {
    const groups: Record<string, { id: string; title: string; messagesCount: number; timestamp: number; firstUserMsg?: string }> = {};
    
    planMessages.forEach((msg) => {
      if (msg.id === 'init') return;
      const convId = msg.conversation_id || 'legacy';
      if (!groups[convId]) {
        // Use the first user message as the conversation title (like ChatGPT)
        const rawTitle = msg.sender === 'user' ? msg.text : '';
        groups[convId] = {
          id: convId,
          title: rawTitle ? (rawTitle.length > 50 ? rawTitle.substring(0, 50) + '...' : rawTitle) : 'Conversational Chat',
          messagesCount: 0,
          timestamp: msg.timestamp || Date.now(),
          firstUserMsg: msg.sender === 'user' ? msg.text : undefined
        };
      }
      // If we haven't found a user message title yet, keep looking
      if (!groups[convId].firstUserMsg && msg.sender === 'user') {
        const truncated = msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text;
        groups[convId].title = truncated;
        groups[convId].firstUserMsg = msg.text;
      }
      groups[convId].messagesCount++;
    });

    // If currentConversationId is set and has no messages yet, include a placeholder thread
    if (currentConversationId && !groups[currentConversationId]) {
      groups[currentConversationId] = {
        id: currentConversationId,
        title: 'New Chat',
        messagesCount: 0,
        timestamp: Date.now()
      };
    }
    
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [planMessages, currentConversationId]);

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

      {/* Switcher tabs */}
      <div className="grid grid-cols-2 p-0.5 bg-muted/30 border border-border rounded-[4px] w-full shrink-0">
        <button
          onClick={() => setSubTab('RUNS')}
          className={cn(
            "py-1.5 text-[9.5px] font-bold text-center rounded-[3px] transition-all cursor-pointer border",
            subTab === 'RUNS'
              ? "bg-card text-foreground border-border/80 shadow-xs font-extrabold"
              : "text-foreground/50 hover:text-foreground/85 border-transparent"
          )}
        >
          Agent History
        </button>
        <button
          onClick={() => setSubTab('CHATS')}
          className={cn(
            "py-1.5 text-[9.5px] font-bold text-center rounded-[3px] transition-all cursor-pointer border",
            subTab === 'CHATS'
              ? "bg-card text-foreground border-border/80 shadow-xs font-extrabold"
              : "text-foreground/50 hover:text-foreground/85 border-transparent"
          )}
        >
          Chat History
        </button>
      </div>

      {subTab === 'CHATS' ? (
        /* Conversational AI Chat History */
        <div className="bg-card border border-border p-3 rounded-sm space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-[9px] font-extrabold text-foreground/80 uppercase tracking-wider">
            <span>Conversational Chats</span>
            <span className="text-[8px] opacity-70 bg-muted px-1.5 py-0.5 rounded-[3px]">
              {conversations.length} Thread(s)
            </span>
          </div>
          
          {/* Conversations List */}
          {conversations.length > 0 ? (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
              {conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  className={cn(
                    "p-2 rounded-[3px] text-[9.5px] leading-relaxed border flex justify-between items-center transition-all cursor-pointer group/item",
                    conv.id === currentConversationId 
                      ? "bg-blue-600/10 border-blue-500/20 text-blue-600 font-bold" 
                      : "bg-muted/10 border-border/40 text-foreground/85 hover:bg-muted/20 hover:border-border/60"
                  )}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-foreground/50 group-hover/item:text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="truncate block font-semibold text-[9.5px]">
                      {conv.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[7.5px] text-foreground/40 font-bold px-1 py-0.5 bg-muted rounded-[2px]">
                      {conv.messagesCount} msg
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-0.5 hover:bg-red-600/15 text-foreground/30 hover:text-red-500 rounded-[2px] transition-colors border border-border/20 shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      title="Delete this conversation thread"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[8.5px] text-muted-foreground leading-normal italic text-center py-2">
              No conversational threads recorded. Start a chat session to create your first strategy thread!
            </p>
          )}
          
          {conversations.length > 0 && (
            <button
              onClick={onClearChatHistory}
              className="w-full px-2.5 py-1.5 bg-red-600/10 text-red-500 border border-red-500/15 hover:bg-red-600 hover:text-white rounded-[3px] text-[9px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Clear All Conversation Threads
            </button>
          )}
        </div>
      ) : (
        /* Autonomous Executions List */
        <div className="space-y-2 flex-1 flex flex-col">
          <span className="text-[9px] font-extrabold text-foreground/80 uppercase tracking-wider block">
            Autonomous Runs History
          </span>
          
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
            {executionHistory.length === 0 ? (
              <div className="text-[9px] text-foreground/40 italic py-4 text-center border border-dashed border-border rounded-[4px] bg-muted/10">
                No execution runs recorded yet.
              </div>
            ) : (
              executionHistory.slice(0, 15).map((exec) => (
                <div key={exec.id} className="p-2.5 border border-border rounded-[4px] bg-card hover:bg-muted/10 transition-all text-[9px] space-y-1.5 shadow-sm animate-in fade-in duration-300 group relative">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-foreground/75 text-[8px]">
                      RUN #{exec.id.substring(0, 8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-[3px] text-[7px] font-bold uppercase border",
                        exec.status === 'success' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
                        exec.status === 'failed' && "bg-red-500/10 text-red-600 border-red-500/15",
                        exec.status === 'running' && "bg-blue-500/10 text-blue-600 border-blue-500/15",
                        exec.status === 'pending' && "bg-muted text-foreground/70 border-border"
                      )}>
                        {exec.status}
                      </span>
                      <button
                        onClick={() => onDeleteExecution(exec.id)}
                        className="p-1 hover:bg-red-600/10 text-foreground/40 hover:text-red-500 rounded-[3px] transition-colors border border-border shadow-sm flex items-center justify-center shrink-0"
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
                    <div className="text-[8px] text-foreground/70 font-semibold bg-muted/20 px-1.5 py-1 rounded-[3px] border border-border/20 leading-relaxed">
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
      )}
    </div>
  );
};

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversationLog: Array<{ role: string, text: string }>;
  isKeyboardMode: boolean;
  currentQuestionId: string;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleKeyboardSubmit: () => void;
  isFallbackMode: boolean;
  isListening: boolean;
  handleSendFallbackAnswer: () => void;
  userTranscript?: string;
  agentTranscript?: string;
  isSpeaking?: boolean;
}

export function MeetingSidebar({
  isOpen,
  onClose,
  conversationLog,
  isKeyboardMode,
  currentQuestionId,
  answers,
  setAnswers,
  handleKeyboardSubmit,
  isFallbackMode,
  isListening,
  handleSendFallbackAnswer,
  userTranscript,
  agentTranscript,
  isSpeaking
}: MeetingSidebarProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      key="meeting-sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="w-[400px] border-l border-border bg-card flex flex-col justify-between h-full relative"
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Meeting Details</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xs font-semibold"
        >
          Hide
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {conversationLog.length === 0 && !userTranscript && !agentTranscript ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <HelpCircle size={32} className="mb-2 opacity-40" />
            <p className="text-xs">No dialogue recorded. Please speak after Sophia starts.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {conversationLog.map((log, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col max-w-[85%] p-3 rounded-md text-[13px]",
                  log.role === 'agent'
                    ? "bg-muted text-foreground self-start border border-border"
                    : "bg-primary/10 text-primary self-end ml-auto border border-primary/20"
                )}
              >
                <span className="text-[9px] font-bold uppercase opacity-60 mb-1">
                  {log.role === 'agent' ? 'Sophia' : 'You'}
                </span>
                <p className="leading-relaxed">{log.text}</p>
              </div>
            ))}

            {/* Live streaming bubble for Sophia speaking */}
            {isSpeaking && agentTranscript && (
              <div className="flex flex-col max-w-[85%] p-3 rounded-md text-[13px] bg-muted/60 text-foreground self-start border border-border opacity-70 animate-pulse">
                <span className="text-[9px] font-bold uppercase opacity-60 mb-1 text-blue-500">
                  Sophia (Speaking...)
                </span>
                <p className="leading-relaxed">{agentTranscript}</p>
              </div>
            )}

            {/* Live streaming bubble for user speaking */}
            {userTranscript && (
              <div className="flex flex-col max-w-[85%] p-3 rounded-md text-[13px] bg-primary/5 text-primary self-end ml-auto border border-primary/10 opacity-70 animate-pulse">
                <span className="text-[9px] font-bold uppercase opacity-60 mb-1 text-emerald-500">
                  You (Speaking...)
                </span>
                <p className="leading-relaxed">{userTranscript}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        {isKeyboardMode ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={currentQuestionId ? (answers[currentQuestionId] || '') : ''}
              onChange={(e) => {
                if (currentQuestionId) {
                  setAnswers(prev => ({ ...prev, [currentQuestionId]: e.target.value }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleKeyboardSubmit();
              }}
              placeholder="Type answer here..."
              className="flex-1 bg-background border border-border rounded text-xs px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleKeyboardSubmit}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded p-2 flex items-center justify-center transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        ) : (
          isFallbackMode && isListening && (
            <button
              onClick={() => handleSendFallbackAnswer()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 animate-pulse transition-all"
            >
              Done Speaking & Send
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

interface FloatingChatInputProps {
  messageInput: string;
  setMessageInput: (val: string) => void;
  onSend: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (val: boolean) => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  isDark: boolean;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingChatInput({
  messageInput,
  setMessageInput,
  onSend,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  isDark,
  emojiPickerRef
}: FloatingChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-2.5 border-t border-border bg-card/40 shrink-0">
      <div className="flex items-end gap-1.5 bg-background border border-border rounded-lg p-1.5 focus-within:border-[#0a66c2]/40 transition-all">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none py-1 px-1 text-xs text-foreground placeholder:text-muted-foreground resize-none max-h-16 font-normal"
          rows={1}
        />
        <div className="relative shrink-0" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(
              "p-1.5 text-muted-foreground hover:text-[#0a66c2] transition-colors rounded-lg hover:bg-muted",
              showEmojiPicker && "text-[#0a66c2]"
            )}
          >
            <Smile className="w-4.5 h-4.5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-3 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={isDark ? Theme.DARK : Theme.LIGHT}
                width={220}
                height={260}
                skinTonesDisabled
                searchDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
        <button
          onClick={onSend}
          disabled={!messageInput.trim()}
          className="w-8 h-8 rounded-lg bg-[#0a66c2] flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

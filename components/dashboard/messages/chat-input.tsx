'use client';

import React from 'react';
import { Paperclip, Smile, Send } from 'lucide-react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSend: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  isDark: boolean;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatInput({
  messageInput,
  setMessageInput,
  handleKeyPress,
  handleSend,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  isDark,
  emojiPickerRef
}: ChatInputProps) {
  return (
    <div className="p-3 sm:p-6 bg-gradient-to-t from-background via-background to-transparent relative z-10">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/40 border border-border rounded-lg p-2 sm:p-3 shadow-lg backdrop-blur-xl group-focus-within:border-primary/30 transition-all">
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block">
          <Paperclip className="w-5 h-5 opacity-60" />
        </button>
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none max-h-32 font-normal"
          rows={1}
        />
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn("p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block", showEmojiPicker && "text-primary")}
          >
            <Smile className="w-5 h-5 opacity-60" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-4 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={isDark ? Theme.DARK : Theme.LIGHT}
                width={250}
                height={300}
                skinTonesDisabled
                searchDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!messageInput.trim()}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}

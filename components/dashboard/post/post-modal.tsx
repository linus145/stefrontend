'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageIcon, Loader2, X, Globe, Smile, Calendar, Trash2, Lock, ChevronDown, Wand2 } from 'lucide-react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { cn } from '@/lib/utils';
import { postService } from '@/services/post.service';
import { uploadService } from '@/services/upload.service';
import { getOptimizedImage } from '@/lib/imagekit';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
}

const MAX_CHARS = 1800;
const MIN_CHARS = 100;

export function PostModal({ isOpen, onClose, onPostSuccess }: PostModalProps) {
  const { user } = useAuth();
  const { isDark } = useDashboardTheme();
  const [postType, setPostType] = useState<'POST' | 'NEWS'>('POST');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const autoFormatContent = () => {
    if (!content.trim()) return;
    
    let formatted = content;
    
    // 1. Fix missing spaces after punctuation (even if next letter is uppercase like "workflows.The")
    formatted = formatted.replace(/([.!?])([a-zA-Z])/g, '$1 $2');
    
    // 2. Capitalize next lowercase letter after punctuation
    formatted = formatted.replace(/([.!?])\s+([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase());

    // 3. Start every sentence on a new line (paragraph break)
    formatted = formatted.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
    
    // 3. Make sure Markdown bolded headings have paragraph breaks around them
    formatted = formatted.replace(/([a-zA-Z.!?])\s*(\*\*.*?\*\*)/g, '$1\n\n$2');
    formatted = formatted.replace(/(\*\*.*?\*\*)\s*([a-zA-Z])/g, '$1\n\n$2');
    
    // 4. Format lines starting with -, *, or numbers as lists properly
    formatted = formatted.replace(/([^\n])\n([-*]|\d+\.) /g, '$1\n\n$2 ');

    // 5. Remove excessive newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // 6. Capitalize very first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    // 7. Trim
    formatted = formatted.trim();

    setContent(formatted);
    toast.success('Text automatically formatted!');
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;

  const handlePost = async () => {
    if ((!content.trim() && !mediaUrl) || isOverLimit || isTooShort) {
      if (isTooShort) toast.error(`Post is too short. Please provide at least ${MIN_CHARS} characters to maintain layout quality.`);
      return;
    }

    if (postType === 'NEWS' && !title.trim()) {
      toast.error('News articles require a headline.');
      return;
    }

    try {
      /* if (postType === 'NEWS') {
        const { newsService } = await import('@/services/news.service');
        await newsService.createNews({ title, content, media_url: mediaUrl });
      } else { */
        await postService.createPost({ content, media_url: mediaUrl, visibility });
      // }
      
      toast.success(`${postType === 'NEWS' ? 'News article' : 'Post'} created successfully!`);
      setContent('');
      setTitle('');
      setMediaUrl('');
      setMediaType(null);
      onPostSuccess();
      onClose();
    } catch (error) {
      toast.error(`Failed to create ${postType === 'NEWS' ? 'news article' : 'post'}. Please try again.`);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, '/posts');
      setMediaUrl(result.image_url);
      setMediaType('image');
      toast.success('Media uploaded successfully.');
    } catch (error) {
      toast.error('Media upload failed.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-16px)] sm:max-w-[600px] bg-card border-border p-0 overflow-hidden rounded-md shadow-2xl max-h-[95vh]">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">Create Post</DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 bg-muted/20 border-b border-border flex items-center gap-2">
          <button
            onClick={() => setPostType('POST')}
            className={cn(
              "px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border",
              postType === 'POST' 
                ? "bg-foreground text-background border-foreground shadow-sm" 
                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
            )}
          >
            General Post
          </button>
          {/* <button
            onClick={() => setPostType('NEWS')}
            className={cn(
              "px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border",
              postType === 'NEWS' 
                ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm" 
                : "bg-transparent text-muted-foreground border-transparent hover:bg-[#7C3AED]/10 hover:text-[#7C3AED]"
            )}
          >
            News Article
          </button> */}
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Conditional Title Field for News */}
          {/* {postType === 'NEWS' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="Enter News Headline..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border rounded-sm py-3 px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          )} */}

          {/* User Profile Info & Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted/50 flex items-center justify-center text-primary font-bold border border-border shadow-sm overflow-hidden text-sm sm:text-base">
                  {user?.profile?.profile_image_url ? (
                    <img 
                      src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`} 
                      alt={user?.first_name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.first_name ? user.first_name.charAt(0) : 'U'
                  )}
               </div>
              <div className="space-y-0.5">
                <p className="text-[13px] sm:text-[14px] font-bold text-foreground leading-none">{user?.first_name} {user?.last_name}</p>
                <div className="relative">
                  <button 
                    onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border hover:bg-muted/60 transition-all group"
                  >
                    {visibility === 'PUBLIC' ? (
                      <Globe className="w-3 h-3 text-sky-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      {visibility === 'PUBLIC' ? 'Public' : 'Private'}
                    </span>
                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", isVisibilityMenuOpen && "rotate-180")} />
                  </button>
  
                  {isVisibilityMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsVisibilityMenuOpen(false)} />
                      <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => { setVisibility('PUBLIC'); setIsVisibilityMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4 text-sky-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-foreground">Public</span>
                            <span className="text-[10px] text-muted-foreground">Anyone can see this post</span>
                          </div>
                        </button>
                        <button
                          onClick={() => { setVisibility('PRIVATE'); setIsVisibilityMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-foreground">Private</span>
                            <span className="text-[10px] text-muted-foreground">Only you can see this post</span>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button onClick={autoFormatContent} className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm border border-[#7C3AED]/20" title="Auto-Format Content">
              <Wand2 className="w-3.5 h-3.5" />
              Auto-Format
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="post-textarea"
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'NEWS' ? "Write the news article content..." : "What's on your architectural mind?"}
              className="w-full bg-transparent text-[14px] sm:text-[16px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none min-h-[120px] sm:min-h-[150px] leading-relaxed"
            />

              <div className={cn(
                "text-[11px] font-bold tracking-widest transition-colors ml-auto",
                isOverLimit ? "text-destructive" :
                  isTooShort ? "text-orange-500" :
                    "text-muted-foreground opacity-40"
              )}>
                {isTooShort && <span className="mr-2 animate-pulse">Needs more detail...</span>}
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </div>
          </div>

          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative rounded-md overflow-hidden border border-border group shadow-lg animate-in zoom-in-95 duration-300">
              <img src={getOptimizedImage(mediaUrl)} alt="Preview" className="w-full object-cover max-h-[400px]" />
              <button
                onClick={() => { setMediaUrl(''); setMediaType(null); }}
                className="absolute top-3 right-3 bg-background/80 backdrop-blur-md text-foreground p-2 rounded-full hover:bg-destructive hover:text-white transition-all shadow-md active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/10 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Hidden file input for server-side upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-muted/40 text-sky-500 hover:bg-sky-500/10 transition-all active:scale-90 disabled:opacity-50"
              title="Add Photo"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>

            <div className="relative" ref={emojiPickerRef}>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn("w-10 h-10 flex items-center justify-center rounded-md bg-muted/40 text-amber-500 hover:bg-amber-500/10 transition-all active:scale-90", showEmojiPicker && "bg-amber-500/20")}
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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

            <button className="w-10 h-10 flex items-center justify-center rounded-md bg-muted/40 text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90" title="Add Video">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center rounded-md bg-muted/40 text-[#b49cf8] hover:bg-[#b49cf8]/10 transition-all active:scale-90" title="Schedule">
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          <button
            disabled={(!content.trim() && !mediaUrl) || isUploading || isOverLimit || isTooShort}
            onClick={handlePost}
            className="bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] sm:text-[14px] font-bold py-2 px-6 sm:px-10 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

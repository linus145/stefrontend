'use client';

import React, { useState, useRef } from 'react';
import { X, Globe, Image as ImageIcon, Video, FileText, BarChart2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getOptimizedImage } from '@/lib/imagekit';
import { postService } from '@/services/post.service';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX_CHARS = 1800;
const MIN_CHARS = 100;

interface MobilePostViewProps {
  onClose: () => void;
  onPostSuccess: () => void;
}

export function MobilePostView({ onClose, onPostSuccess }: MobilePostViewProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;

  const handlePost = async () => {
    if ((!content.trim() && !mediaUrl) || isOverLimit || isTooShort || isPosting) {
      if (isTooShort) toast.error(`Post is too short. Please provide at least ${MIN_CHARS} characters.`);
      return;
    }

    setIsPosting(true);
    try {
      await postService.createPost({ content, media_url: mediaUrl });
      toast.success('Post created successfully!');
      onPostSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, '/posts');
      setMediaUrl(result.image_url);
      toast.success('Media uploaded!');
    } catch (error) {
      toast.error('Media upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="font-bold text-[15px] tracking-tight">Share Post</span>
        </div>
        <button 
          onClick={handlePost}
          disabled={isPosting || (!content.trim() && !mediaUrl) || isOverLimit || isTooShort}
          className="bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-sm font-bold disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-primary/20"
        >
          {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
        <div className="p-4 sm:p-6 space-y-6">
          {/* User Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-muted/50 border border-border overflow-hidden shadow-sm">
              {user?.profile?.profile_image_url ? (
                <img 
                  src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground leading-none mb-1.5">{user?.first_name} {user?.last_name}</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border w-fit group cursor-pointer hover:bg-muted/60 transition-colors">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Public</span>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your architectural mind?"
              className="w-full bg-transparent border-none outline-none resize-none text-lg sm:text-xl text-foreground placeholder:text-muted-foreground/40 min-h-[200px] leading-relaxed font-normal"
            />
          </div>

          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative rounded-md overflow-hidden border border-border group shadow-md animate-in zoom-in duration-300">
              <img src={getOptimizedImage(mediaUrl)} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
              <button 
                onClick={() => setMediaUrl('')}
                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for server-side upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Footer Toolbar */}
      <div className="border-t border-border bg-background/80 backdrop-blur-md p-4 pb-8 sm:pb-4 flex items-center justify-between sticky bottom-0">
        <div className="flex items-center gap-6 text-muted-foreground">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Photo</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 hover:text-primary transition-all group cursor-not-allowed opacity-40">
            <div className="p-2 rounded-full transition-colors">
              <Video className="w-6 h-6" />
            </div>
          </button>

          <button className="flex flex-col items-center gap-1 hover:text-primary transition-all group cursor-not-allowed opacity-40">
            <div className="p-2 rounded-full transition-colors">
              <BarChart2 className="w-6 h-6" />
            </div>
          </button>
        </div>

        <div className="flex flex-col items-end">
           <span className={cn(
             "text-[10px] font-bold tracking-tight mb-1 transition-colors",
             isOverLimit ? "text-destructive" : isTooShort ? "text-amber-500" : "text-muted-foreground"
           )}>
             {charCount} / {MAX_CHARS}
           </span>
           <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
             <div 
               className={cn(
                 "h-full transition-all duration-300",
                 isOverLimit ? "bg-destructive" : "bg-primary"
               )}
               style={{ width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%` }}
             />
           </div>
        </div>
      </div>
    </div>
  );
}

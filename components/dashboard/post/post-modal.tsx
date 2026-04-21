'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageKitProvider, IKUpload } from 'imagekitio-next';
import { ImageIcon, Loader2, X, Globe, Smile, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { postService } from '@/services/post.service';
import { getOptimizedImage } from '@/lib/imagekit';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
const MAX_CHARS = 1800;
const MIN_CHARS = 100;

export function PostModal({ isOpen, onClose, onPostSuccess }: PostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const ikVideoUploadRef = useRef<HTMLInputElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;

  const handlePost = async () => {
    if ((!content.trim() && !mediaUrl) || isOverLimit || isTooShort) {
      if (isTooShort) toast.error(`Post is too short. Please provide at least ${MIN_CHARS} characters to maintain layout quality.`);
      return;
    }
    
    try {
      await postService.createPost({ content, media_url: mediaUrl });
      toast.success('Post created successfully!');
      setContent('');
      setMediaUrl('');
      setMediaType(null);
      onPostSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    }
  };

  const handleImageKitAuth = async () => {
    try {
      return await postService.getImageKitAuth();
    } catch (error) {
      console.error('ImageKit Auth Error:', error);
      throw error;
    }
  };

  const onUploadStart = () => setIsUploading(true);
  const onUploadSuccess = (res: any) => {
    setMediaUrl(res.url);
    setIsUploading(false);
    toast.success('Media uploaded successfully.');
  };
  const onUploadError = () => {
    setIsUploading(false);
    toast.error('Media upload failed.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">Create Post</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* User Profile Info */}
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-primary font-bold border border-border shadow-sm overflow-hidden">
                {user?.first_name ? user.first_name.charAt(0) : 'U'}
             </div>
             <div className="space-y-0.5">
                <p className="text-[14px] font-bold text-foreground leading-none">{user?.first_name} {user?.last_name}</p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/40 border border-border w-fit">
                   <Globe className="w-3 h-3 text-muted-foreground" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Public</span>
                </div>
             </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your architectural mind?"
              className="w-full bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none min-h-[150px] leading-relaxed"
            />
            
            <div className="flex justify-between items-center mt-2">
                <button className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-all">
                   <Smile className="w-5 h-5" />
                </button>
                <div className={cn(
                    "text-[11px] font-bold tracking-widest transition-colors",
                    isOverLimit ? "text-destructive" : 
                    isTooShort ? "text-orange-500" :
                    "text-muted-foreground opacity-40"
                )}>
                    {isTooShort && <span className="mr-2 animate-pulse">Needs more detail...</span>}
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </div>
            </div>
          </div>

          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-border group shadow-lg animate-in zoom-in-95 duration-300">
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
        <div className="px-6 py-4 bg-muted/10 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageKitProvider 
              publicKey={PUBLIC_KEY} 
              urlEndpoint={URL_ENDPOINT} 
              authenticator={handleImageKitAuth}
            >
                <button 
                  onClick={() => {
                    setMediaType('image');
                    ikUploadRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-sky-500 hover:bg-sky-500/10 transition-all active:scale-90 disabled:opacity-50"
                  title="Add Photo"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <div className="hidden">
                  <IKUpload
                    ref={ikUploadRef}
                    onUploadStart={onUploadStart}
                    onSuccess={(res) => {
                        onUploadSuccess(res);
                        setMediaType('image');
                    }}
                    onError={onUploadError}
                  />
                </div>
            </ImageKitProvider>

            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-90" title="Add Video">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-[#b49cf8] hover:bg-[#b49cf8]/10 transition-all active:scale-90" title="Schedule">
               <Calendar className="w-5 h-5" />
            </button>
          </div>

          <button 
            disabled={(!content.trim() && !mediaUrl) || isUploading || isOverLimit || isTooShort}
            onClick={handlePost}
            className="bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[14px] font-bold py-2 px-10 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

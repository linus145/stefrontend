'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, Search, Image as ImageIcon, BarChart2, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { postService } from '@/services/post.service';
import { PostCard } from './post-card';
import { toast } from 'sonner';
import { ImageKitProvider, IKUpload } from 'imagekitio-next';
import { Post } from '@/types/post.types';

interface FeedProps {
  isCollapsed: boolean;
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';

export function Feed({ isCollapsed }: FeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  // Fetch Posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postService.getPosts(1),
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  // Create Post Mutation
  const createMutation = useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
      setMediaUrl('');
      toast.success('Post architectural synchronization successful.');
    },
    onError: () => toast.error('Creation rejected by network protocol.')
  });

  // Like Mutation with Optimistic Updates
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((post: Post) => {
            if (post.id === postId) {
              const wasLiked = post.user_has_liked;
              return {
                ...post,
                user_has_liked: !wasLiked,
                likes_count: Math.max(0, wasLiked ? post.likes_count - 1 : post.likes_count + 1)
              };
            }
            return post;
          })
        };
      });

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Signal synchronization failed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const onLike = (id: string) => {
    likeMutation.mutate(id);
  };

  const handlePost = () => {
    if (!content.trim() && !mediaUrl) return;
    createMutation.mutate({ content, media_url: mediaUrl });
  };

  const handleImageKitAuth = async () => {
    try {
      const auth = await postService.getImageKitAuth();
      return auth;
    } catch (error) {
      console.error('ImageKit Auth Error:', error);
      throw error;
    }
  };

  const onUploadStart = () => setIsUploading(true);
  const onUploadSuccess = (res: any) => {
    setMediaUrl(res.url);
    setIsUploading(false);
    toast.success('System visual asset uploaded.');
  };
  const onUploadError = () => {
    setIsUploading(false);
    toast.error('Asset transmission failed.');
  };

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background px-8 py-8 mr-80 transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-20" : "ml-60"
    )}>
      
      {/* Feed Header */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Signal Stream</h2>
          <p className="text-[10px] text-sky-500 font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Live Network
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        
        {/* Composer */}
        {/* Composer (LinkedIn Style) */}
        <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-muted shrink-0 flex items-center justify-center text-primary font-bold border border-border overflow-hidden">
               {user?.first_name ? user.first_name.charAt(0) : 'U'}
            </div>
            <div className="flex-1">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start a post"
                className="w-full bg-background border border-border rounded-full py-3 px-5 text-[14px] text-foreground placeholder:text-muted-foreground placeholder:font-medium resize-none outline-none hover:bg-muted/50 focus:bg-muted/30 focus:ring-1 focus:ring-primary/20 focus:border-primary/30 transition-all min-h-[48px] overflow-hidden custom-scrollbar"
                rows={content ? 3 : 1}
              ></textarea>
            </div>
          </div>

          {(mediaUrl || content) && (
             <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
               {mediaUrl && (
                 <div className="relative rounded-xl overflow-hidden border border-border group/preview shadow-md mb-4">
                    <img src={mediaUrl} alt="Preview" className="w-full max-h-[400px] object-cover" />
                    <button 
                     onClick={() => setMediaUrl('')}
                     className="absolute top-2 right-2 bg-background/80 backdrop-blur-md text-foreground p-1.5 rounded-full hover:bg-destructive hover:text-white transition-all shadow-sm"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                 </div>
               )}
               
               <div className="flex justify-end pt-2 border-t border-border/40">
                  <button 
                    disabled={createMutation.isPending || (!content.trim() && !mediaUrl)}
                    onClick={handlePost}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-30 text-white text-xs font-semibold py-2 px-6 rounded-full shadow-sm transition-all flex items-center gap-2"
                  >
                    {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Post</span>}
                  </button>
               </div>
             </div>
          )}

          <div className="flex items-center justify-between mt-3 px-2">
            <div className="flex items-center gap-1">
              <ImageKitProvider 
                publicKey={PUBLIC_KEY} 
                urlEndpoint={URL_ENDPOINT} 
                authenticator={handleImageKitAuth}
              >
                <button 
                  disabled={isUploading}
                  onClick={() => ikUploadRef.current?.click()}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-5 w-5 text-sky-500" />}
                  <span>Photo</span>
                </button>
                <div className="hidden">
                  <IKUpload
                    ref={ikUploadRef}
                    onUploadStart={onUploadStart}
                    onSuccess={onUploadSuccess}
                    onError={onUploadError}
                  />
                </div>
              </ImageKitProvider>
              
              <button className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-all">
                <BarChart2 className="h-5 w-5 text-emerald-500" />
                <span>Poll</span>
              </button>

              <button className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-all text-nowrap">
                <Rocket className="h-5 w-5 text-indigo-500" />
                <span>Launch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 opacity-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                        <div className="w-32 h-2 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="w-full h-32 bg-muted rounded animate-pulse" />
            </div>
          ))
        ) : (
          postsData?.results.map(post => (
            <PostCard 
                key={post.id} 
                post={post} 
                onLike={(id) => onLike(id)} 
            />
          ))
        )}

        {postsData?.results.length === 0 && (
          <div className="text-center py-16 bg-muted/10 border border-border rounded-2xl border-dashed">
            <p className="text-muted-foreground font-semibold text-xs tracking-wide">No network activity observed.</p>
          </div>
        )}

      </div>
    </div>
  );
}

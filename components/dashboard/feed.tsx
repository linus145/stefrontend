'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, Search, Image as ImageIcon, BarChart2, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { postService } from '@/services/post.service';
import { PostCard } from './post/post-card';
import { PostModal } from './post/post-modal';
import { toast } from 'sonner';
import { Post } from '@/types/post.types';
import { getOptimizedImage } from '@/lib/imagekit';

interface FeedProps {
  isCollapsed: boolean;
  isRightCollapsed?: boolean;
  onNavigateToProfile: (userId: string) => void;
}



export function Feed({ isCollapsed, isRightCollapsed, onNavigateToProfile }: FeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => postService.getPosts(1),
    refetchInterval: 5000,
  });

  // Progressive Loading Logic
  const [visibleCount, setVisibleCount] = useState(5);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = React.useCallback(() => {
    if (isSimulatingLoad || !postsData?.results || visibleCount >= postsData.results.length) return;
    setIsSimulatingLoad(true);
    // Simulate natural loading delay
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setIsSimulatingLoad(false);
    }, 1200);
  }, [isSimulatingLoad, postsData?.results, visibleCount]);

  React.useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [handleLoadMore, visibleCount]);

  // Like Mutation with Optimistic Updates
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts', user?.id] });
      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts', user?.id], (old: any) => {
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
      toast.error('Failed to sync reaction.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', user?.id] });
    }
  });

  const onLike = (id: string) => {
    likeMutation.mutate(id);
  };


  return (
    <div className={cn(
      "flex-1 min-h-screen min-w-0 bg-background transition-all duration-300 ease-in-out",
      "px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
    )}>

      {/* Feed Header */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Post Stream</h2>
          <p className="text-[10px] text-sky-500 font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Live Network
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-2">

        {/* Composer (Open Modal Trigger) */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="hidden lg:block bg-card border border-border/80 rounded-md p-4 sm:p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted/50 shrink-0 flex items-center justify-center text-primary font-bold border border-border overflow-hidden shadow-sm transition-all text-sm sm:text-base">
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
            <div className="flex-1">
              <div className="w-full bg-muted/20 border border-border rounded-full py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-[15px] text-muted-foreground/60 font-medium transition-all min-h-[44px] sm:min-h-[52px] flex items-center group-hover:bg-muted/30 hover:border-primary/20">
                What's on your architectural mind?
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 px-2">
            <button className="flex items-center gap-1.5 sm:gap-2.5 py-2 px-2 sm:px-3 rounded-xl text-[12px] sm:text-[13px] font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all group/btn">
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            <button className="flex items-center gap-1.5 sm:gap-2.5 py-2 px-2 sm:px-3 rounded-xl text-[12px] sm:text-[13px] font-bold text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600 transition-all group/btn">
              <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Poll</span>
            </button>

            <button className="flex items-center gap-1.5 sm:gap-2.5 py-2 px-2 sm:px-3 rounded-xl text-[12px] sm:text-[13px] font-bold text-muted-foreground hover:bg-indigo-500/5 hover:text-indigo-600 transition-all group/btn">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">Launch</span>
            </button>
          </div>
        </div>

        {/* Global Post Modal */}
        <PostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostSuccess={() => queryClient.invalidateQueries({ queryKey: ['posts', user?.id] })}
        />

        {/* Feed Posts */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-md p-4 sm:p-6 shadow-sm space-y-4 opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                  <div className="w-32 h-2 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full h-32 bg-muted rounded animate-pulse" />
            </div>
          ))
        ) : (
          <>
            {postsData?.results.slice(0, visibleCount).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(id) => onLike(id)}
                onNavigateToProfile={onNavigateToProfile}
              />
            ))}

            {/* Natural Progressive Loader */}
            {postsData?.results && visibleCount < postsData.results.length && (
              <div
                ref={loaderRef}
                className="bg-card border border-border/60 rounded-md shadow-sm p-5 flex flex-col gap-4 animate-in fade-in duration-500"
              >
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-12 h-12 rounded-md bg-muted shrink-0" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-muted rounded" />
                    <div className="w-32 h-2 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="relative">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    Architecting more insights...
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {postsData?.results.length === 0 && (
          <div className="text-center py-16 bg-muted/10 border border-border rounded-md border-dashed">
            <p className="text-muted-foreground font-semibold text-xs tracking-wide">No network activity observed.</p>
          </div>
        )}

      </div>
    </div>
  );
}
